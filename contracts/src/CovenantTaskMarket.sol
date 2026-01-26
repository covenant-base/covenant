// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {CovenantBase} from "./lib/CovenantBase.sol";
import {ICovenantAgentRegistry} from "./interfaces/ICovenantAgentRegistry.sol";
import {ICovenantProofVerifier} from "./interfaces/ICovenantProofVerifier.sol";

contract CovenantTaskMarket is CovenantBase {
    using SafeERC20 for IERC20;

    uint256 private constant VERIFICATION_PUBLIC_INPUT_COUNT = 8;

    enum TaskStatus {
        None,
        Funded,
        ProofSubmitted,
        Verified,
        Released,
        Disputed,
        Resolved
    }

    struct Task {
        address client;
        bytes32 agentId;
        address paymentToken;
        uint128 paymentAmount;
        bytes32 taskHash;
        bytes32 resultHash;
        bytes32 proofHash;
        bytes32 criteriaRoot;
        uint64 deadline;
        uint64 submittedAt;
        uint64 disputeWindowEnd;
        TaskStatus status;
        address assignedBidder;
    }

    struct BidBook {
        bool open;
        uint64 commitEnd;
        uint64 revealEnd;
        uint128 bondAmount;
        address winner;
        bytes32 winnerAgentId;
        uint128 winnerAmount;
    }

    struct Bid {
        bytes32 commitment;
        bytes32 agentId;
        uint128 amount;
        bool revealed;
        bool claimed;
    }

    ICovenantAgentRegistry public immutable registry;
    ICovenantProofVerifier public immutable verifier;
    address public feeCollector;
    uint16 public protocolFeeBps = 10;
    uint16 public solrepFeeBps = 5;
    uint64 public disputeWindow = 1 days;

    mapping(bytes32 => Task) public tasks;
    mapping(bytes32 => BidBook) public bidBooks;
    mapping(bytes32 => mapping(address => Bid)) public bids;

    event TaskCreated(bytes32 indexed taskId, address indexed client, bytes32 indexed agentId, address token, uint256 amount);
    event BidCommitted(bytes32 indexed taskId, address indexed bidder, bytes32 commitment);
    event BidRevealed(bytes32 indexed taskId, address indexed bidder, bytes32 indexed agentId, uint256 amount);
    event TaskResultSubmitted(bytes32 indexed taskId, bytes32 resultHash, bytes32 proofHash);
    event TaskVerified(bytes32 indexed taskId, uint64 disputeWindowEnd);
    event TaskReleased(bytes32 indexed taskId, address indexed recipient, uint256 payout);
    event TaskDisputed(bytes32 indexed taskId, address indexed claimant);

    constructor(
        address initialOwner,
        ICovenantAgentRegistry agentRegistry,
        ICovenantProofVerifier proofVerifier,
        address feeCollector_
    ) CovenantBase(initialOwner) {
        registry = agentRegistry;
        verifier = proofVerifier;
        feeCollector = feeCollector_;
    }

    function setFeeConfiguration(uint16 nextProtocolFeeBps, uint16 nextSolrepFeeBps, uint64 nextDisputeWindow) external onlyOwner {
        protocolFeeBps = nextProtocolFeeBps;
        solrepFeeBps = nextSolrepFeeBps;
        disputeWindow = nextDisputeWindow;
    }

    function createTask(
        bytes32 taskId,
        bytes32 agentId,
        address paymentToken,
        uint128 paymentAmount,
        bytes32 taskHash,
        bytes32 criteriaRoot,
        uint64 deadline
    ) external whenNotPaused {
        require(tasks[taskId].status == TaskStatus.None, "task exists");
        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), paymentAmount);
        tasks[taskId] = Task({
            client: msg.sender,
            agentId: agentId,
            paymentToken: paymentToken,
            paymentAmount: paymentAmount,
            taskHash: taskHash,
            resultHash: bytes32(0),
            proofHash: bytes32(0),
            criteriaRoot: criteriaRoot,
            deadline: deadline,
            submittedAt: 0,
            disputeWindowEnd: 0,
            status: TaskStatus.Funded,
            assignedBidder: address(0)
        });

        emit TaskCreated(taskId, msg.sender, agentId, paymentToken, paymentAmount);
    }

    function openBidding(bytes32 taskId, uint64 commitDuration, uint64 revealDuration, uint128 bondAmount) external whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.client == msg.sender, "not client");

        bidBooks[taskId] = BidBook({
            open: true,
            commitEnd: uint64(block.timestamp) + commitDuration,
            revealEnd: uint64(block.timestamp) + commitDuration + revealDuration,
            bondAmount: bondAmount,
            winner: address(0),
            winnerAgentId: bytes32(0),
            winnerAmount: type(uint128).max
        });
    }

    function commitBid(bytes32 taskId, bytes32 commitment) external whenNotPaused {
        BidBook storage bidBook = bidBooks[taskId];
        Task storage task = tasks[taskId];
        require(bidBook.open, "bidding closed");
        require(block.timestamp < bidBook.commitEnd, "commit ended");

        IERC20(task.paymentToken).safeTransferFrom(msg.sender, address(this), bidBook.bondAmount);
        bids[taskId][msg.sender].commitment = commitment;
        emit BidCommitted(taskId, msg.sender, commitment);
    }

    function revealBid(bytes32 taskId, bytes32 agentId, uint128 amount, bytes32 nonce) external whenNotPaused {
        BidBook storage bidBook = bidBooks[taskId];
        Bid storage bid = bids[taskId][msg.sender];
        require(block.timestamp >= bidBook.commitEnd, "reveal not started");
        require(block.timestamp < bidBook.revealEnd, "reveal ended");
        require(!bid.revealed, "revealed");
        require(
            bid.commitment == keccak256(abi.encode(taskId, agentId, amount, nonce, msg.sender)),
            "bad reveal"
        );

        bid.revealed = true;
        bid.agentId = agentId;
        bid.amount = amount;

        if (amount < bidBook.winnerAmount) {
            bidBook.winnerAmount = amount;
            bidBook.winner = msg.sender;
            bidBook.winnerAgentId = agentId;
        }

        emit BidRevealed(taskId, msg.sender, agentId, amount);
    }

    function closeBidding(bytes32 taskId) external {
        BidBook storage bidBook = bidBooks[taskId];
        Task storage task = tasks[taskId];
        require(bidBook.open, "not open");
        require(block.timestamp >= bidBook.revealEnd, "reveal active");

        bidBook.open = false;
        task.agentId = bidBook.winnerAgentId;
        task.assignedBidder = bidBook.winner;
    }

    function claimBond(bytes32 taskId) external {
        BidBook storage bidBook = bidBooks[taskId];
        Bid storage bid = bids[taskId][msg.sender];
        Task storage task = tasks[taskId];

        require(!bidBook.open && block.timestamp >= bidBook.revealEnd, "bidding active");
        require(bid.revealed, "not revealed");
        require(!bid.claimed, "claimed");

        bid.claimed = true;
        IERC20(task.paymentToken).safeTransfer(msg.sender, bidBook.bondAmount);
    }

    function submitResult(bytes32 taskId, bytes32 resultHash, bytes32 proofHash) external whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Funded, "wrong status");

        address operator = registry.operatorOf(task.agentId);
        require(msg.sender == operator || msg.sender == task.assignedBidder, "not task operator");

        task.resultHash = resultHash;
        task.proofHash = proofHash;
        task.submittedAt = uint64(block.timestamp);
        task.status = TaskStatus.ProofSubmitted;

        emit TaskResultSubmitted(taskId, resultHash, proofHash);
    }

    function verifyTask(bytes32 taskId, bytes calldata proof, bytes32[] calldata publicInputs) external whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.ProofSubmitted, "wrong status");
        require(publicInputs.length == VERIFICATION_PUBLIC_INPUT_COUNT, "bad public inputs");
        require(publicInputs[0] == taskId, "taskId mismatch");
        require(publicInputs[1] == task.agentId, "agentId mismatch");
        require(publicInputs[2] == task.taskHash, "taskHash mismatch");
        require(publicInputs[3] == task.resultHash, "resultHash mismatch");
        require(publicInputs[4] == task.proofHash, "proofHash mismatch");
        require(publicInputs[5] == task.criteriaRoot, "criteriaRoot mismatch");
        require(publicInputs[6] == bytes32(uint256(task.deadline)), "deadline mismatch");
        require(publicInputs[7] == bytes32(uint256(task.submittedAt)), "submittedAt mismatch");
        require(verifier.verify(proof, publicInputs), "proof invalid");

        task.status = TaskStatus.Verified;
        task.disputeWindowEnd = uint64(block.timestamp) + disputeWindow;
        emit TaskVerified(taskId, task.disputeWindowEnd);
    }

    function raiseDispute(bytes32 taskId) external whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.client == msg.sender, "not client");
        require(task.status == TaskStatus.Verified, "not verified");
        require(block.timestamp < task.disputeWindowEnd, "window closed");
        task.status = TaskStatus.Disputed;
        emit TaskDisputed(taskId, msg.sender);
    }

    function resolveDispute(bytes32 taskId, bool releaseToAgent, address recipient) external onlyOwner {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Disputed, "not disputed");

        task.status = TaskStatus.Resolved;
        if (releaseToAgent) {
            _release(taskId, recipient == address(0) ? registry.operatorOf(task.agentId) : recipient);
        } else {
            IERC20(task.paymentToken).safeTransfer(recipient == address(0) ? task.client : recipient, task.paymentAmount);
        }
    }

    function release(bytes32 taskId) external whenNotPaused {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Verified, "wrong status");
        require(block.timestamp >= task.disputeWindowEnd, "dispute window active");
        _release(taskId, registry.operatorOf(task.agentId));
    }

    function _release(bytes32 taskId, address recipient) internal {
        Task storage task = tasks[taskId];
        uint256 protocolFee = (uint256(task.paymentAmount) * protocolFeeBps) / 10_000;
        uint256 solrepFee = (uint256(task.paymentAmount) * solrepFeeBps) / 10_000;
        uint256 payout = uint256(task.paymentAmount) - protocolFee - solrepFee;

        task.status = TaskStatus.Released;
        IERC20(task.paymentToken).safeTransfer(recipient, payout);
        if (protocolFee + solrepFee > 0) {
            IERC20(task.paymentToken).safeTransfer(feeCollector, protocolFee + solrepFee);
        }

        emit TaskReleased(taskId, recipient, payout);
    }
}

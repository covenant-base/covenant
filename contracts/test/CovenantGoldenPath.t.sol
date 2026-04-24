// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {CovenantAgentRegistry} from "../src/CovenantAgentRegistry.sol";
import {CovenantFeeCollector} from "../src/CovenantFeeCollector.sol";
import {GuardianAttestationVerifier} from "../src/GuardianAttestationVerifier.sol";
import {CovenantProofVerifier} from "../src/CovenantProofVerifier.sol";
import {CovenantTaskMarket} from "../src/CovenantTaskMarket.sol";
import {CovenantToken} from "../src/CovenantToken.sol";
import {ICovenantAgentRegistry} from "../src/interfaces/ICovenantAgentRegistry.sol";
import {ICovenantProofVerifier} from "../src/interfaces/ICovenantProofVerifier.sol";

interface Vm {
    function addr(uint256 privateKey) external returns (address);
    function sign(uint256 privateKey, bytes32 digest) external returns (uint8 v, bytes32 r, bytes32 s);
}

contract Actor {
    function approveToken(CovenantToken token, address spender, uint256 amount) external {
        token.approve(spender, amount);
    }

    function registerAgent(CovenantAgentRegistry registry, bytes32 agentId, string calldata metadataURI, uint256 capabilityBitmap)
        external
    {
        registry.registerAgent(agentId, metadataURI, capabilityBitmap);
    }

    function createTask(
        CovenantTaskMarket market,
        bytes32 taskId,
        bytes32 agentId,
        address paymentToken,
        uint128 paymentAmount,
        bytes32 taskHash,
        bytes32 criteriaRoot,
        uint64 deadline
    ) external {
        market.createTask(taskId, agentId, paymentToken, paymentAmount, taskHash, criteriaRoot, deadline);
    }

    function submitResult(CovenantTaskMarket market, bytes32 taskId, bytes32 resultHash, bytes32 proofHash) external {
        market.submitResult(taskId, resultHash, proofHash);
    }

    function raiseDispute(CovenantTaskMarket market, bytes32 taskId) external {
        market.raiseDispute(taskId);
    }
}

contract MockStrictVerifier {
    function verifyProof(bytes calldata proof, bytes32[] calldata publicInputs) external pure returns (bool) {
        return proof.length == 32 && publicInputs.length == 8;
    }
}

contract CovenantGoldenPathTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    uint256 private constant GUARDIAN_PRIVATE_KEY = 0xA11CE;

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant SETTLEMENT_ATTESTATION_TYPEHASH =
        keccak256(
            "SettlementAttestation(bytes32 taskId,bytes32 agentId,bytes32 taskHash,bytes32 resultHash,bytes32 proofHash,bytes32 criteriaRoot,bytes32 deadline,bytes32 submittedAt)"
        );
    bytes32 private constant NAME_HASH = keccak256(bytes("CovenantGuardianAttestationVerifier"));
    bytes32 private constant VERSION_HASH = keccak256(bytes("1"));

    function testGoldenPathSettlementOnBase() external {
        CovenantToken token = new CovenantToken("Covenant Token", "COV", 18, address(this));
        CovenantAgentRegistry registry = new CovenantAgentRegistry(address(this));
        CovenantFeeCollector feeCollector = new CovenantFeeCollector(address(this));
        GuardianAttestationVerifier guardianVerifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        CovenantProofVerifier verifier = new CovenantProofVerifier(
            address(this),
            address(guardianVerifier),
            _guardianConfigHash(vm.addr(GUARDIAN_PRIVATE_KEY))
        );
        CovenantTaskMarket market = new CovenantTaskMarket(
            address(this),
            ICovenantAgentRegistry(address(registry)),
            ICovenantProofVerifier(address(verifier)),
            address(feeCollector)
        );

        Actor operator = new Actor();
        Actor client = new Actor();

        bytes32 agentId = keccak256("covenant-agent-1");
        bytes32 taskId = keccak256("covenant-task-1");
        bytes32 taskHash = keccak256("task-hash");
        bytes32 resultHash = keccak256("result-hash");
        bytes32 proofHash = keccak256("proof-hash");
        uint128 paymentAmount = 1_000 ether;

        token.mint(address(client), paymentAmount);
        operator.registerAgent(registry, agentId, "ipfs://covenant-agent", 7);
        client.approveToken(token, address(market), paymentAmount);
        client.createTask(
            market,
            taskId,
            agentId,
            address(token),
            paymentAmount,
            taskHash,
            keccak256("criteria-root"),
            uint64(block.timestamp + 7 days)
        );

        operator.submitResult(market, taskId, resultHash, proofHash);

        bytes32[] memory publicInputs =
            _publicInputs(taskId, agentId, taskHash, resultHash, proofHash, keccak256("criteria-root"), uint64(block.timestamp + 7 days), uint64(block.timestamp));
        bytes memory proof = _sign(address(guardianVerifier), publicInputs);
        market.setFeeConfiguration(10, 5, 0);
        market.verifyTask(taskId, proof, publicInputs);
        market.release(taskId);

        uint256 fees = (uint256(paymentAmount) * 15) / 10_000;
        uint256 payout = uint256(paymentAmount) - fees;

        assert(token.balanceOf(address(operator)) == payout);
        assert(token.balanceOf(address(feeCollector)) == fees);
    }

    function testVerifyTaskRejectsMismatchedPublicInputs() external {
        (
            CovenantTaskMarket market,
            GuardianAttestationVerifier guardianVerifier,
            ,
            bytes32 taskId,
            bytes32 agentId,
            bytes32 taskHash,
            bytes32 resultHash,
            bytes32 proofHash,
            bytes32 criteriaRoot,
            uint64 deadline,
            uint64 submittedAt
        ) = _setUpProofSubmittedTask();

        bytes32[] memory publicInputs =
            _publicInputs(taskId, agentId, taskHash, resultHash, proofHash, criteriaRoot, deadline, submittedAt);
        bytes memory proof = _sign(address(guardianVerifier), publicInputs);

        for (uint256 i = 0; i < publicInputs.length; i++) {
            bytes32[] memory mutated =
                _publicInputs(taskId, agentId, taskHash, resultHash, proofHash, criteriaRoot, deadline, submittedAt);
            mutated[i] = bytes32(uint256(1000 + i));

            (bool ok,) =
                address(market).call(abi.encodeCall(market.verifyTask, (taskId, proof, mutated)));
            assert(!ok);
        }
    }

    function testGuardianVerificationRespectsDisputeWindow() external {
        (
            CovenantTaskMarket market,
            GuardianAttestationVerifier guardianVerifier,
            Actor client,
            bytes32 taskId,
            bytes32 agentId,
            bytes32 taskHash,
            bytes32 resultHash,
            bytes32 proofHash,
            bytes32 criteriaRoot,
            uint64 deadline,
            uint64 submittedAt
        ) = _setUpProofSubmittedTask();

        assert(uint8(_taskStatus(market, taskId)) == uint8(CovenantTaskMarket.TaskStatus.ProofSubmitted));

        bytes32[] memory publicInputs =
            _publicInputs(taskId, agentId, taskHash, resultHash, proofHash, criteriaRoot, deadline, submittedAt);
        bytes memory proof = _sign(address(guardianVerifier), publicInputs);
        market.verifyTask(taskId, proof, publicInputs);

        assert(uint8(_taskStatus(market, taskId)) == uint8(CovenantTaskMarket.TaskStatus.Verified));
        assert(_taskDisputeWindowEnd(market, taskId) > uint64(block.timestamp));

        (bool releaseOk,) = address(market).call(abi.encodeCall(market.release, (taskId)));
        assert(!releaseOk);

        client.raiseDispute(market, taskId);
        assert(uint8(_taskStatus(market, taskId)) == uint8(CovenantTaskMarket.TaskStatus.Disputed));
    }

    function testProofVerifierCanCutOverWithoutRedeployingTaskMarket() external {
        CovenantToken token = new CovenantToken("Covenant Token", "COV", 18, address(this));
        CovenantAgentRegistry registry = new CovenantAgentRegistry(address(this));
        CovenantFeeCollector feeCollector = new CovenantFeeCollector(address(this));
        GuardianAttestationVerifier guardianVerifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        CovenantProofVerifier verifier = new CovenantProofVerifier(
            address(this),
            address(guardianVerifier),
            _guardianConfigHash(vm.addr(GUARDIAN_PRIVATE_KEY))
        );
        CovenantTaskMarket market = new CovenantTaskMarket(
            address(this),
            ICovenantAgentRegistry(address(registry)),
            ICovenantProofVerifier(address(verifier)),
            address(feeCollector)
        );

        Actor operator = new Actor();
        Actor client = new Actor();

        bytes32 guardianTaskId = keccak256("guardian-task");
        bytes32 strictTaskId = keccak256("strict-task");
        bytes32 agentId = keccak256("covenant-agent-cutover");
        bytes32 criteriaRoot = keccak256("criteria-root");

        token.mint(address(client), 2_000 ether);
        operator.registerAgent(registry, agentId, "ipfs://covenant-agent-cutover", 7);
        client.approveToken(token, address(market), 2_000 ether);

        client.createTask(
            market,
            guardianTaskId,
            agentId,
            address(token),
            1_000 ether,
            keccak256("guardian-task-hash"),
            criteriaRoot,
            uint64(block.timestamp + 7 days)
        );
        operator.submitResult(market, guardianTaskId, keccak256("guardian-result"), keccak256("guardian-proof"));
        market.setFeeConfiguration(10, 5, 0);

        bytes32[] memory guardianInputs = _publicInputs(
            guardianTaskId,
            agentId,
            keccak256("guardian-task-hash"),
            keccak256("guardian-result"),
            keccak256("guardian-proof"),
            criteriaRoot,
            uint64(block.timestamp + 7 days),
            uint64(block.timestamp)
        );
        market.verifyTask(guardianTaskId, _sign(address(guardianVerifier), guardianInputs), guardianInputs);
        market.release(guardianTaskId);

        MockStrictVerifier strictVerifier = new MockStrictVerifier();
        verifier.setVerifier(address(strictVerifier), keccak256("strict-verifier"));

        client.createTask(
            market,
            strictTaskId,
            agentId,
            address(token),
            1_000 ether,
            keccak256("strict-task-hash"),
            criteriaRoot,
            uint64(block.timestamp + 14 days)
        );
        operator.submitResult(market, strictTaskId, keccak256("strict-result"), keccak256("strict-proof"));

        bytes32[] memory strictInputs = _publicInputs(
            strictTaskId,
            agentId,
            keccak256("strict-task-hash"),
            keccak256("strict-result"),
            keccak256("strict-proof"),
            criteriaRoot,
            uint64(block.timestamp + 14 days),
            uint64(block.timestamp)
        );
        market.verifyTask(strictTaskId, abi.encodePacked(bytes32(uint256(1))), strictInputs);
        market.release(strictTaskId);

        assert(uint8(_taskStatus(market, guardianTaskId)) == uint8(CovenantTaskMarket.TaskStatus.Released));
        assert(uint8(_taskStatus(market, strictTaskId)) == uint8(CovenantTaskMarket.TaskStatus.Released));
    }

    function _setUpProofSubmittedTask()
        internal
        returns (
            CovenantTaskMarket market,
            GuardianAttestationVerifier guardianVerifier,
            Actor client,
            bytes32 taskId,
            bytes32 agentId,
            bytes32 taskHash,
            bytes32 resultHash,
            bytes32 proofHash,
            bytes32 criteriaRoot,
            uint64 deadline,
            uint64 submittedAt
        )
    {
        CovenantToken token = new CovenantToken("Covenant Token", "COV", 18, address(this));
        CovenantAgentRegistry registry = new CovenantAgentRegistry(address(this));
        CovenantFeeCollector feeCollector = new CovenantFeeCollector(address(this));
        guardianVerifier = new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        CovenantProofVerifier verifier = new CovenantProofVerifier(
            address(this),
            address(guardianVerifier),
            _guardianConfigHash(vm.addr(GUARDIAN_PRIVATE_KEY))
        );
        market = new CovenantTaskMarket(
            address(this),
            ICovenantAgentRegistry(address(registry)),
            ICovenantProofVerifier(address(verifier)),
            address(feeCollector)
        );

        Actor operator = new Actor();
        client = new Actor();

        taskId = keccak256("canonical-task");
        agentId = keccak256("canonical-agent");
        taskHash = keccak256("canonical-task-hash");
        resultHash = keccak256("canonical-result-hash");
        proofHash = keccak256("canonical-proof-hash");
        criteriaRoot = keccak256("canonical-criteria-root");
        deadline = uint64(block.timestamp + 7 days);

        token.mint(address(client), 1_000 ether);
        operator.registerAgent(registry, agentId, "ipfs://canonical-agent", 7);
        client.approveToken(token, address(market), 1_000 ether);
        client.createTask(market, taskId, agentId, address(token), 1_000 ether, taskHash, criteriaRoot, deadline);
        assert(uint8(_taskStatus(market, taskId)) == uint8(CovenantTaskMarket.TaskStatus.Funded));
        operator.submitResult(market, taskId, resultHash, proofHash);
        submittedAt = uint64(block.timestamp);
    }

    function _guardianConfigHash(address guardian) internal pure returns (bytes32) {
        return keccak256(bytes(string.concat("guardian-attestation-v1:", Strings.toHexString(uint256(uint160(guardian)), 20))));
    }

    function _publicInputs(
        bytes32 taskId,
        bytes32 agentId,
        bytes32 taskHash,
        bytes32 resultHash,
        bytes32 proofHash,
        bytes32 criteriaRoot,
        uint64 deadline,
        uint64 submittedAt
    ) internal pure returns (bytes32[] memory publicInputs) {
        publicInputs = new bytes32[](8);
        publicInputs[0] = taskId;
        publicInputs[1] = agentId;
        publicInputs[2] = taskHash;
        publicInputs[3] = resultHash;
        publicInputs[4] = proofHash;
        publicInputs[5] = criteriaRoot;
        publicInputs[6] = bytes32(uint256(deadline));
        publicInputs[7] = bytes32(uint256(submittedAt));
    }

    function _domainSeparator(address verifierAddress) internal view returns (bytes32) {
        return keccak256(
            abi.encode(DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, verifierAddress)
        );
    }

    function _digest(address verifierAddress, bytes32[] memory publicInputs) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                hex"1901",
                _domainSeparator(verifierAddress),
                keccak256(
                    abi.encode(
                        SETTLEMENT_ATTESTATION_TYPEHASH,
                        publicInputs[0],
                        publicInputs[1],
                        publicInputs[2],
                        publicInputs[3],
                        publicInputs[4],
                        publicInputs[5],
                        publicInputs[6],
                        publicInputs[7]
                    )
                )
            )
        );
    }

    function _sign(address verifierAddress, bytes32[] memory publicInputs) internal returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(GUARDIAN_PRIVATE_KEY, _digest(verifierAddress, publicInputs));
        return abi.encodePacked(r, s, v);
    }

    function _taskStatus(CovenantTaskMarket market, bytes32 taskId)
        internal
        view
        returns (CovenantTaskMarket.TaskStatus status)
    {
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            CovenantTaskMarket.TaskStatus taskStatus,
            address assignedBidder
        ) = market.tasks(taskId);
        assignedBidder;
        status = taskStatus;
    }

    function _taskDisputeWindowEnd(CovenantTaskMarket market, bytes32 taskId) internal view returns (uint64 disputeWindowEnd) {
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint64 taskWindowEnd,
            ,
            address assignedBidder
        ) = market.tasks(taskId);
        assignedBidder;
        disputeWindowEnd = taskWindowEnd;
    }
}

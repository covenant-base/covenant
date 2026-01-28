// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantBase} from "./lib/CovenantBase.sol";
import {ICovenantStaking} from "./interfaces/ICovenantStaking.sol";

contract CovenantGovernance is CovenantBase {
    struct Proposal {
        address proposer;
        address target;
        bytes callData;
        string descriptionURI;
        uint64 voteStart;
        uint64 voteEnd;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    ICovenantStaking public immutable staking;
    uint256 public nextProposalId;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address indexed target, string descriptionURI);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address initialOwner, ICovenantStaking stakingContract) CovenantBase(initialOwner) {
        staking = stakingContract;
        nextProposalId = 1;
    }

    function createProposal(
        address target,
        bytes calldata callData,
        string calldata descriptionURI,
        uint64 votingDuration
    ) external whenNotPaused returns (uint256 proposalId) {
        proposalId = nextProposalId++;
        proposals[proposalId] = Proposal({
            proposer: msg.sender,
            target: target,
            callData: callData,
            descriptionURI: descriptionURI,
            voteStart: uint64(block.timestamp),
            voteEnd: uint64(block.timestamp) + votingDuration,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });
        emit ProposalCreated(proposalId, msg.sender, target, descriptionURI);
    }

    function vote(uint256 proposalId, bool support) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.voteStart, "vote not started");
        require(block.timestamp < proposal.voteEnd, "vote ended");
        require(!hasVoted[proposalId][msg.sender], "already voted");

        uint256 weight = staking.votingPower(msg.sender);
        require(weight > 0, "no voting power");

        hasVoted[proposalId][msg.sender] = true;
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.voteEnd, "vote active");
        require(!proposal.executed, "executed");
        require(proposal.forVotes > proposal.againstVotes, "proposal failed");

        proposal.executed = true;
        if (proposal.target != address(0) && proposal.callData.length > 0) {
            (bool ok,) = proposal.target.call(proposal.callData);
            require(ok, "execution failed");
        }
        emit ProposalExecuted(proposalId);
    }
}

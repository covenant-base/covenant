// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantBase} from "./lib/CovenantBase.sol";

contract CovenantDisputeArbitration is CovenantBase {
    struct DisputeCase {
        bytes32 taskId;
        address claimant;
        uint64 openedAt;
        uint256 agentVotes;
        uint256 clientVotes;
        bool resolved;
        bool agentWins;
    }

    uint256 public nextCaseId;
    mapping(uint256 => DisputeCase) public disputeCases;
    mapping(uint256 => mapping(address => bool)) public voted;

    event DisputeOpened(uint256 indexed caseId, bytes32 indexed taskId, address indexed claimant);
    event DisputeVote(uint256 indexed caseId, address indexed voter, bool supportAgent);
    event DisputeResolved(uint256 indexed caseId, bool agentWins);

    constructor(address initialOwner) CovenantBase(initialOwner) {
        nextCaseId = 1;
    }

    function openCase(bytes32 taskId, address claimant) external whenNotPaused returns (uint256 caseId) {
        caseId = nextCaseId++;
        disputeCases[caseId] = DisputeCase({
            taskId: taskId,
            claimant: claimant,
            openedAt: uint64(block.timestamp),
            agentVotes: 0,
            clientVotes: 0,
            resolved: false,
            agentWins: false
        });

        emit DisputeOpened(caseId, taskId, claimant);
    }

    function vote(uint256 caseId, bool supportAgent) external whenNotPaused {
        DisputeCase storage disputeCase = disputeCases[caseId];
        require(!disputeCase.resolved, "resolved");
        require(!voted[caseId][msg.sender], "already voted");

        voted[caseId][msg.sender] = true;
        if (supportAgent) {
            disputeCase.agentVotes += 1;
        } else {
            disputeCase.clientVotes += 1;
        }
        emit DisputeVote(caseId, msg.sender, supportAgent);
    }

    function resolveCase(uint256 caseId, bool agentWins) external onlyOwner {
        DisputeCase storage disputeCase = disputeCases[caseId];
        disputeCase.resolved = true;
        disputeCase.agentWins = agentWins;
        emit DisputeResolved(caseId, agentWins);
    }
}

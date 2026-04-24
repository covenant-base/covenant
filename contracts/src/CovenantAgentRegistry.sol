// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantBase} from "./lib/CovenantBase.sol";

contract CovenantAgentRegistry is CovenantBase {
    struct Agent {
        address operator;
        string metadataURI;
        uint256 capabilityBitmap;
        uint256 stake;
        uint96 reputation;
        bool active;
    }

    mapping(bytes32 => Agent) public agents;

    event AgentRegistered(bytes32 indexed agentId, address indexed operator, string metadataURI, uint256 capabilityBitmap);
    event AgentStatusUpdated(bytes32 indexed agentId, bool active);
    event AgentStakeUpdated(bytes32 indexed agentId, uint256 stake);
    event ReputationCredited(bytes32 indexed agentId, uint96 reputation);

    error AgentAlreadyRegistered(bytes32 agentId);
    error AgentNotRegistered(bytes32 agentId);
    error NotAgentOperator(bytes32 agentId, address caller);

    constructor(address initialOwner) CovenantBase(initialOwner) {}

    modifier onlyOperator(bytes32 agentId) {
        if (agents[agentId].operator == address(0)) revert AgentNotRegistered(agentId);
        if (agents[agentId].operator != msg.sender) revert NotAgentOperator(agentId, msg.sender);
        _;
    }

    function registerAgent(
        bytes32 agentId,
        string calldata metadataURI,
        uint256 capabilityBitmap
    ) external whenNotPaused {
        if (agents[agentId].operator != address(0)) revert AgentAlreadyRegistered(agentId);

        agents[agentId] = Agent({
            operator: msg.sender,
            metadataURI: metadataURI,
            capabilityBitmap: capabilityBitmap,
            stake: 0,
            reputation: 0,
            active: true
        });

        emit AgentRegistered(agentId, msg.sender, metadataURI, capabilityBitmap);
    }

    function updateMetadata(bytes32 agentId, string calldata metadataURI) external onlyOperator(agentId) {
        agents[agentId].metadataURI = metadataURI;
    }

    function increaseStake(bytes32 agentId, uint256 amount) external onlyOperator(agentId) {
        agents[agentId].stake += amount;
        emit AgentStakeUpdated(agentId, agents[agentId].stake);
    }

    function slashStake(bytes32 agentId, uint256 amount) external onlyOwner {
        Agent storage agent = agents[agentId];
        if (agent.operator == address(0)) revert AgentNotRegistered(agentId);
        agent.stake = amount >= agent.stake ? 0 : agent.stake - amount;
        emit AgentStakeUpdated(agentId, agent.stake);
    }

    function setAgentActive(bytes32 agentId, bool active) external onlyOwner {
        Agent storage agent = agents[agentId];
        if (agent.operator == address(0)) revert AgentNotRegistered(agentId);
        agent.active = active;
        emit AgentStatusUpdated(agentId, active);
    }

    function creditReputation(bytes32 agentId, uint96 amount) external onlyOwner {
        Agent storage agent = agents[agentId];
        if (agent.operator == address(0)) revert AgentNotRegistered(agentId);
        agent.reputation += amount;
        emit ReputationCredited(agentId, agent.reputation);
    }

    function operatorOf(bytes32 agentId) external view returns (address) {
        return agents[agentId].operator;
    }

    function isActive(bytes32 agentId) external view returns (bool) {
        return agents[agentId].active;
    }
}

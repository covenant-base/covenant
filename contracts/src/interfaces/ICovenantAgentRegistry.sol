// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICovenantAgentRegistry {
    function operatorOf(bytes32 agentId) external view returns (address);
}

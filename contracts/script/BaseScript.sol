// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface Vm {
    function envAddress(string calldata name) external returns (address);
    function envOr(string calldata name, address defaultValue) external returns (address);
    function envOr(string calldata name, uint256 defaultValue) external returns (uint256);
    function envOr(string calldata name, string calldata defaultValue) external returns (string memory);
    function startBroadcast() external;
    function stopBroadcast() external;
}

abstract contract BaseScript {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}

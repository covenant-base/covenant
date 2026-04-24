// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICovenantStaking {
    function votingPower(address voter) external view returns (uint256);
}

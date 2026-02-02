// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseScript} from "./BaseScript.sol";
import {CovenantGovernance} from "../src/CovenantGovernance.sol";
import {CovenantStaking} from "../src/CovenantStaking.sol";
import {CovenantTaskMarket} from "../src/CovenantTaskMarket.sol";
import {CovenantTreasury} from "../src/CovenantTreasury.sol";

contract CovenantVerifyScript is BaseScript {
    function run() external {
        address treasuryAddress = vm.envAddress("COVENANT_CONTRACT_TREASURY");
        address stakingAddress = vm.envAddress("COVENANT_CONTRACT_STAKING");
        address governanceAddress = vm.envAddress("COVENANT_CONTRACT_GOVERNANCE");
        address taskMarketAddress = vm.envAddress("COVENANT_CONTRACT_TASK_MARKET");
        address feeCollectorAddress = vm.envAddress("COVENANT_CONTRACT_FEE_COLLECTOR");
        address registryAddress = vm.envAddress("COVENANT_CONTRACT_AGENT_REGISTRY");
        address proofVerifierAddress = vm.envAddress("COVENANT_CONTRACT_PROOF_VERIFIER");

        require(address(CovenantTreasury(treasuryAddress).registry()) == registryAddress, "treasury registry mismatch");
        require(address(CovenantStaking(stakingAddress).feeCollector()) == feeCollectorAddress, "staking fee collector mismatch");
        require(address(CovenantGovernance(governanceAddress).staking()) == stakingAddress, "governance staking mismatch");
        require(address(CovenantTaskMarket(taskMarketAddress).registry()) == registryAddress, "task market registry mismatch");
        require(address(CovenantTaskMarket(taskMarketAddress).verifier()) == proofVerifierAddress, "task market verifier mismatch");
        require(CovenantTaskMarket(taskMarketAddress).feeCollector() == feeCollectorAddress, "task market fee collector mismatch");
    }
}

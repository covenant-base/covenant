// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseScript} from "./BaseScript.sol";
import {CovenantCapabilityRegistry} from "../src/CovenantCapabilityRegistry.sol";

contract CovenantSeedScript is BaseScript {
    function run() external {
        address registryAddress = vm.envAddress("COVENANT_CAPABILITY_REGISTRY");
        string memory baseUri = vm.envOr("COVENANT_CAPABILITY_BASE_URI", "https://docs.covenantbase.com/capabilities");
        CovenantCapabilityRegistry registry = CovenantCapabilityRegistry(registryAddress);

        vm.startBroadcast();

        registry.setCapability(0, "code_execution", string.concat(baseUri, "/code-execution"), true);
        registry.setCapability(1, "governance_ops", string.concat(baseUri, "/governance-ops"), true);
        registry.setCapability(2, "treasury_ops", string.concat(baseUri, "/treasury-ops"), true);
        registry.setCapability(3, "task_routing", string.concat(baseUri, "/task-routing"), true);
        registry.setCapability(4, "proof_validation", string.concat(baseUri, "/proof-validation"), true);
        registry.setCapability(5, "agent_registry", string.concat(baseUri, "/agent-registry"), true);
        registry.setCapability(6, "template_publishing", string.concat(baseUri, "/template-publishing"), true);
        registry.setCapability(7, "payment_settlement", string.concat(baseUri, "/payment-settlement"), true);

        vm.stopBroadcast();
    }
}

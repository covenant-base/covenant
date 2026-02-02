// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseScript} from "./BaseScript.sol";
import {GuardianAttestationVerifier} from "../src/GuardianAttestationVerifier.sol";

contract DeployGuardianAttestationVerifierScript is BaseScript {
    function run() external {
        address owner = vm.envOr("COVENANT_OWNER", tx.origin);
        address guardian = vm.envOr("COVENANT_GUARDIAN", owner);

        vm.startBroadcast();
        new GuardianAttestationVerifier(owner, guardian);
        vm.stopBroadcast();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantProofVerifier} from "../src/CovenantProofVerifier.sol";

contract CovenantProofVerifierTest {
    function testVerifyRevertsWhenVerifierNotConfigured() external {
        CovenantProofVerifier verifier = new CovenantProofVerifier(address(this), address(0), bytes32(0));
        bytes32[] memory publicInputs = new bytes32[](8);
        (bool ok,) = address(verifier).call(abi.encodeCall(verifier.verify, (hex"1234", publicInputs)));
        assert(!ok);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantBase} from "./lib/CovenantBase.sol";

interface ICovenantVerifierImplementation {
    function verifyProof(bytes calldata proof, bytes32[] calldata publicInputs) external view returns (bool);
}

contract CovenantProofVerifier is CovenantBase {
    address public verifier;
    bytes32 public verifierKeyHash;

    event VerifierUpdated(address indexed verifier, bytes32 indexed verifierKeyHash);

    constructor(address initialOwner, address initialVerifier, bytes32 initialVerifierKeyHash) CovenantBase(initialOwner) {
        verifier = initialVerifier;
        verifierKeyHash = initialVerifierKeyHash;
    }

    function setVerifier(address nextVerifier, bytes32 nextVerifierKeyHash) external onlyOwner {
        verifier = nextVerifier;
        verifierKeyHash = nextVerifierKeyHash;
        emit VerifierUpdated(nextVerifier, nextVerifierKeyHash);
    }

    function verify(bytes calldata proof, bytes32[] calldata publicInputs) external view returns (bool) {
        require(verifier != address(0), "verifier not configured");
        return ICovenantVerifierImplementation(verifier).verifyProof(proof, publicInputs);
    }
}

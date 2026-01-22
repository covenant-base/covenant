// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {CovenantBase} from "./lib/CovenantBase.sol";

contract GuardianAttestationVerifier is CovenantBase, EIP712 {
    uint256 public constant PUBLIC_INPUT_COUNT = 8;

    bytes32 private constant SETTLEMENT_ATTESTATION_TYPEHASH =
        keccak256(
            "SettlementAttestation(bytes32 taskId,bytes32 agentId,bytes32 taskHash,bytes32 resultHash,bytes32 proofHash,bytes32 criteriaRoot,bytes32 deadline,bytes32 submittedAt)"
        );

    address public guardian;

    event GuardianUpdated(address indexed guardian);

    constructor(address initialOwner, address initialGuardian)
        CovenantBase(initialOwner)
        EIP712("CovenantGuardianAttestationVerifier", "1")
    {
        require(initialGuardian != address(0), "guardian required");
        guardian = initialGuardian;
        emit GuardianUpdated(initialGuardian);
    }

    function setGuardian(address nextGuardian) external onlyOwner {
        require(nextGuardian != address(0), "guardian required");
        guardian = nextGuardian;
        emit GuardianUpdated(nextGuardian);
    }

    function verifyProof(bytes calldata proof, bytes32[] calldata publicInputs) external view returns (bool) {
        if (proof.length != 65 || publicInputs.length != PUBLIC_INPUT_COUNT || guardian == address(0)) {
            return false;
        }

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    SETTLEMENT_ATTESTATION_TYPEHASH,
                    publicInputs[0],
                    publicInputs[1],
                    publicInputs[2],
                    publicInputs[3],
                    publicInputs[4],
                    publicInputs[5],
                    publicInputs[6],
                    publicInputs[7]
                )
            )
        );

        (address recovered, ECDSA.RecoverError err, bytes32 errArg) = ECDSA.tryRecover(digest, proof);
        errArg;
        return err == ECDSA.RecoverError.NoError && recovered == guardian;
    }
}

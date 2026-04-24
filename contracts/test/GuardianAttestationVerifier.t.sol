// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {GuardianAttestationVerifier} from "../src/GuardianAttestationVerifier.sol";

interface Vm {
    function addr(uint256 privateKey) external returns (address);
    function sign(uint256 privateKey, bytes32 digest) external returns (uint8 v, bytes32 r, bytes32 s);
    function chainId(uint256 newChainId) external;
}

contract GuardianAttestationVerifierTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    uint256 private constant GUARDIAN_PRIVATE_KEY = 0xA11CE;
    uint256 private constant OTHER_PRIVATE_KEY = 0xB0B;

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant SETTLEMENT_ATTESTATION_TYPEHASH =
        keccak256(
            "SettlementAttestation(bytes32 taskId,bytes32 agentId,bytes32 taskHash,bytes32 resultHash,bytes32 proofHash,bytes32 criteriaRoot,bytes32 deadline,bytes32 submittedAt)"
        );
    bytes32 private constant NAME_HASH = keccak256(bytes("CovenantGuardianAttestationVerifier"));
    bytes32 private constant VERSION_HASH = keccak256(bytes("1"));

    function testAcceptsValidSignature() external {
        GuardianAttestationVerifier verifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        bytes32[] memory publicInputs = _publicInputs();

        assert(verifier.verifyProof(_sign(GUARDIAN_PRIVATE_KEY, address(verifier), publicInputs), publicInputs));
    }

    function testRejectsWrongSigner() external {
        GuardianAttestationVerifier verifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        bytes32[] memory publicInputs = _publicInputs();

        assert(!verifier.verifyProof(_sign(OTHER_PRIVATE_KEY, address(verifier), publicInputs), publicInputs));
    }

    function testRejectsWrongVerifierAddress() external {
        GuardianAttestationVerifier verifierA =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        GuardianAttestationVerifier verifierB =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        bytes32[] memory publicInputs = _publicInputs();

        assert(!verifierB.verifyProof(_sign(GUARDIAN_PRIVATE_KEY, address(verifierA), publicInputs), publicInputs));
    }

    function testRejectsWrongChainId() external {
        GuardianAttestationVerifier verifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        bytes32[] memory publicInputs = _publicInputs();
        bytes memory signature = _sign(GUARDIAN_PRIVATE_KEY, address(verifier), publicInputs);

        vm.chainId(block.chainid + 1);
        assert(!verifier.verifyProof(signature, publicInputs));
    }

    function testRejectsWrongFieldOrder() external {
        GuardianAttestationVerifier verifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        bytes32[] memory publicInputs = _publicInputs();
        bytes32[] memory reordered = _publicInputs();
        bytes32 swapped = reordered[0];
        reordered[0] = reordered[1];
        reordered[1] = swapped;

        assert(!verifier.verifyProof(_sign(GUARDIAN_PRIVATE_KEY, address(verifier), publicInputs), reordered));
    }

    function testRejectsWrongPublicInputCount() external {
        GuardianAttestationVerifier verifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        bytes32[] memory publicInputs = new bytes32[](7);

        assert(!verifier.verifyProof(hex"", publicInputs));
    }

    function testRejectsModifiedTaskData() external {
        GuardianAttestationVerifier verifier =
            new GuardianAttestationVerifier(address(this), vm.addr(GUARDIAN_PRIVATE_KEY));
        bytes32[] memory publicInputs = _publicInputs();
        bytes memory signature = _sign(GUARDIAN_PRIVATE_KEY, address(verifier), publicInputs);
        publicInputs[3] = bytes32(uint256(999));

        assert(!verifier.verifyProof(signature, publicInputs));
    }

    function _publicInputs() internal pure returns (bytes32[] memory publicInputs) {
        publicInputs = new bytes32[](8);
        publicInputs[0] = keccak256("task-id");
        publicInputs[1] = keccak256("agent-id");
        publicInputs[2] = keccak256("task-hash");
        publicInputs[3] = keccak256("result-hash");
        publicInputs[4] = keccak256("proof-hash");
        publicInputs[5] = keccak256("criteria-root");
        publicInputs[6] = bytes32(uint256(7 days));
        publicInputs[7] = bytes32(uint256(1 days));
    }

    function _domainSeparator(address verifierAddress) internal view returns (bytes32) {
        return keccak256(
            abi.encode(DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, verifierAddress)
        );
    }

    function _digest(address verifierAddress, bytes32[] memory publicInputs) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                hex"1901",
                _domainSeparator(verifierAddress),
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
            )
        );
    }

    function _sign(uint256 privateKey, address verifierAddress, bytes32[] memory publicInputs)
        internal
        returns (bytes memory)
    {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, _digest(verifierAddress, publicInputs));
        return abi.encodePacked(r, s, v);
    }
}

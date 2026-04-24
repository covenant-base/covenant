// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseScript} from "./BaseScript.sol";
import {CovenantAgentRegistry} from "../src/CovenantAgentRegistry.sol";
import {CovenantCapabilityRegistry} from "../src/CovenantCapabilityRegistry.sol";
import {CovenantDisputeArbitration} from "../src/CovenantDisputeArbitration.sol";
import {CovenantFeeCollector} from "../src/CovenantFeeCollector.sol";
import {CovenantGovernance} from "../src/CovenantGovernance.sol";
import {CovenantProofVerifier} from "../src/CovenantProofVerifier.sol";
import {CovenantStaking} from "../src/CovenantStaking.sol";
import {CovenantTaskMarket} from "../src/CovenantTaskMarket.sol";
import {CovenantTemplateRegistry} from "../src/CovenantTemplateRegistry.sol";
import {CovenantToken} from "../src/CovenantToken.sol";
import {CovenantTreasury} from "../src/CovenantTreasury.sol";
import {ICovenantAgentRegistry} from "../src/interfaces/ICovenantAgentRegistry.sol";
import {ICovenantProofVerifier} from "../src/interfaces/ICovenantProofVerifier.sol";
import {ICovenantStaking} from "../src/interfaces/ICovenantStaking.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CovenantDeployScript is BaseScript {
    function run() external {
        string memory tokenName = vm.envOr("COVENANT_TOKEN_NAME", "Covenant Token");
        string memory tokenSymbol = vm.envOr("COVENANT_TOKEN_SYMBOL", "COV");
        uint8 tokenDecimals = uint8(vm.envOr("COVENANT_TOKEN_DECIMALS", uint256(18)));
        address owner = vm.envOr("COVENANT_OWNER", tx.origin);
        address verifierImpl =
            vm.envOr("COVENANT_VERIFIER_IMPLEMENTATION", vm.envOr("COVENANT_BN254_VERIFIER", address(0)));
        bytes32 verifierKeyHash = bytes32(
            vm.envOr("COVENANT_VERIFIER_CONFIG_HASH", vm.envOr("COVENANT_BN254_VERIFIER_KEY_HASH", uint256(0)))
        );
        bool hasVerifier = verifierImpl != address(0);
        bool hasVerifierKeyHash = verifierKeyHash != bytes32(0);

        require(hasVerifier == hasVerifierKeyHash, "verifier config incomplete");
        require(block.chainid != 8453 || hasVerifier, "base mainnet verifier required");

        vm.startBroadcast();

        CovenantFeeCollector feeCollector = new CovenantFeeCollector(owner);
        CovenantToken token = new CovenantToken(tokenName, tokenSymbol, tokenDecimals, owner);
        CovenantCapabilityRegistry capabilityRegistry = new CovenantCapabilityRegistry(owner);
        CovenantAgentRegistry agentRegistry = new CovenantAgentRegistry(owner);
        CovenantProofVerifier proofVerifier = new CovenantProofVerifier(owner, verifierImpl, verifierKeyHash);
        CovenantTreasury treasury = new CovenantTreasury(owner, ICovenantAgentRegistry(address(agentRegistry)));
        CovenantStaking staking = new CovenantStaking(owner, IERC20(address(token)), address(feeCollector));
        CovenantGovernance governance = new CovenantGovernance(owner, ICovenantStaking(address(staking)));
        CovenantDisputeArbitration disputeArbitration = new CovenantDisputeArbitration(owner);
        CovenantTemplateRegistry templateRegistry = new CovenantTemplateRegistry(owner);
        CovenantTaskMarket taskMarket = new CovenantTaskMarket(
            owner,
            ICovenantAgentRegistry(address(agentRegistry)),
            ICovenantProofVerifier(address(proofVerifier)),
            address(feeCollector)
        );

        feeCollector;
        token;
        capabilityRegistry;
        treasury;
        governance;
        disputeArbitration;
        templateRegistry;
        taskMarket;

        vm.stopBroadcast();
    }
}

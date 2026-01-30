// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CovenantAgentRegistry} from "../src/CovenantAgentRegistry.sol";
import {CovenantFeeCollector} from "../src/CovenantFeeCollector.sol";
import {CovenantGovernance} from "../src/CovenantGovernance.sol";
import {CovenantStaking} from "../src/CovenantStaking.sol";
import {CovenantToken} from "../src/CovenantToken.sol";
import {CovenantTreasury} from "../src/CovenantTreasury.sol";
import {ICovenantAgentRegistry} from "../src/interfaces/ICovenantAgentRegistry.sol";
import {ICovenantStaking} from "../src/interfaces/ICovenantStaking.sol";

contract TreasuryActor {
    function approveToken(CovenantToken token, address spender, uint256 amount) external {
        token.approve(spender, amount);
    }

    function registerAgent(CovenantAgentRegistry registry, bytes32 agentId, string calldata metadataURI, uint256 capabilityBitmap)
        external
    {
        registry.registerAgent(agentId, metadataURI, capabilityBitmap);
    }

    function deposit(CovenantTreasury treasury, bytes32 agentId, address token, uint256 amount) external {
        treasury.deposit(agentId, token, amount);
    }

    function setLimits(CovenantTreasury treasury, bytes32 agentId, uint128 dailyLimit, uint128 perTxLimit, uint128 weeklyLimit)
        external
    {
        treasury.setSpendingLimits(agentId, dailyLimit, perTxLimit, weeklyLimit);
    }

    function withdraw(CovenantTreasury treasury, bytes32 agentId, address token, address recipient, uint256 amount) external {
        treasury.withdraw(agentId, token, recipient, amount);
    }

    function stake(CovenantStaking staking, uint128 amount, uint64 lockDuration) external returns (uint256) {
        return staking.stake(amount, lockDuration);
    }

    function vote(CovenantGovernance governance, uint256 proposalId, bool support) external {
        governance.vote(proposalId, support);
    }
}

contract CovenantTreasuryAndGovernanceTest {
    function testTreasuryAndGovernanceFoundation() external {
        CovenantToken token = new CovenantToken("Covenant Token", "COV", 18, address(this));
        CovenantAgentRegistry registry = new CovenantAgentRegistry(address(this));
        CovenantFeeCollector feeCollector = new CovenantFeeCollector(address(this));
        CovenantTreasury treasury = new CovenantTreasury(address(this), ICovenantAgentRegistry(address(registry)));
        CovenantStaking staking = new CovenantStaking(address(this), token, address(feeCollector));
        CovenantGovernance governance = new CovenantGovernance(address(this), ICovenantStaking(address(staking)));

        TreasuryActor operator = new TreasuryActor();
        TreasuryActor funder = new TreasuryActor();
        TreasuryActor staker = new TreasuryActor();

        bytes32 agentId = keccak256("covenant-agent-2");

        token.mint(address(funder), 500 ether);
        token.mint(address(staker), 300 ether);

        operator.registerAgent(registry, agentId, "ipfs://covenant-agent-2", 3);

        funder.approveToken(token, address(treasury), 500 ether);
        funder.deposit(treasury, agentId, address(token), 500 ether);
        operator.setLimits(treasury, agentId, 500 ether, 250 ether, 500 ether);
        operator.withdraw(treasury, agentId, address(token), address(operator), 200 ether);

        assert(token.balanceOf(address(operator)) == 200 ether);
        assert(treasury.balances(agentId, address(token)) == 300 ether);

        staker.approveToken(token, address(staking), 300 ether);
        uint256 positionId = staker.stake(staking, 300 ether, 30 days);
        assert(positionId == 1);
        assert(staking.votingPower(address(staker)) == 300 ether);

        uint256 proposalId =
            governance.createProposal(address(0), bytes(""), "ipfs://covenant-proposal", uint64(1 days));
        staker.vote(governance, proposalId, true);

        (,, , , , , uint256 forVotes, uint256 againstVotes, bool executed) = governance.proposals(proposalId);
        assert(forVotes == 300 ether);
        assert(againstVotes == 0);
        assert(!executed);
    }
}

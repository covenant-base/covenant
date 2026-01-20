// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {CovenantBase} from "./lib/CovenantBase.sol";
import {ICovenantAgentRegistry} from "./interfaces/ICovenantAgentRegistry.sol";

contract CovenantTreasury is CovenantBase {
    using SafeERC20 for IERC20;

    struct SpendingLimit {
        uint128 dailyLimit;
        uint128 perTxLimit;
        uint128 weeklyLimit;
        uint128 spentToday;
        uint128 spentThisWeek;
        uint64 lastDay;
        uint64 lastWeek;
    }

    ICovenantAgentRegistry public immutable registry;
    mapping(bytes32 => mapping(address => uint256)) public balances;
    mapping(bytes32 => SpendingLimit) public spendingLimits;

    event TreasuryFunded(bytes32 indexed agentId, address indexed token, address indexed funder, uint256 amount);
    event TreasuryWithdrawn(bytes32 indexed agentId, address indexed token, address indexed recipient, uint256 amount);
    event SpendingLimitsUpdated(bytes32 indexed agentId, uint128 dailyLimit, uint128 perTxLimit, uint128 weeklyLimit);

    error NotAgentOperator(bytes32 agentId, address caller);
    error SpendLimitExceeded(bytes32 agentId, uint256 amount);

    constructor(address initialOwner, ICovenantAgentRegistry agentRegistry) CovenantBase(initialOwner) {
        registry = agentRegistry;
    }

    modifier onlyOperator(bytes32 agentId) {
        if (registry.operatorOf(agentId) != msg.sender) revert NotAgentOperator(agentId, msg.sender);
        _;
    }

    function deposit(bytes32 agentId, address token, uint256 amount) external whenNotPaused {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        balances[agentId][token] += amount;
        emit TreasuryFunded(agentId, token, msg.sender, amount);
    }

    function setSpendingLimits(
        bytes32 agentId,
        uint128 dailyLimit,
        uint128 perTxLimit,
        uint128 weeklyLimit
    ) external onlyOperator(agentId) {
        spendingLimits[agentId].dailyLimit = dailyLimit;
        spendingLimits[agentId].perTxLimit = perTxLimit;
        spendingLimits[agentId].weeklyLimit = weeklyLimit;
        emit SpendingLimitsUpdated(agentId, dailyLimit, perTxLimit, weeklyLimit);
    }

    function withdraw(bytes32 agentId, address token, address recipient, uint256 amount) external whenNotPaused onlyOperator(agentId) {
        SpendingLimit storage limits = spendingLimits[agentId];
        _rollover(limits);

        if (
            amount > limits.perTxLimit ||
            limits.spentToday + amount > limits.dailyLimit ||
            limits.spentThisWeek + amount > limits.weeklyLimit
        ) {
            revert SpendLimitExceeded(agentId, amount);
        }

        limits.spentToday += uint128(amount);
        limits.spentThisWeek += uint128(amount);
        balances[agentId][token] -= amount;
        IERC20(token).safeTransfer(recipient, amount);

        emit TreasuryWithdrawn(agentId, token, recipient, amount);
    }

    function _rollover(SpendingLimit storage limits) internal {
        uint64 dayBucket = uint64(block.timestamp / 1 days);
        uint64 weekBucket = uint64(block.timestamp / 1 weeks);

        if (limits.lastDay != dayBucket) {
            limits.lastDay = dayBucket;
            limits.spentToday = 0;
        }
        if (limits.lastWeek != weekBucket) {
            limits.lastWeek = weekBucket;
            limits.spentThisWeek = 0;
        }
    }
}

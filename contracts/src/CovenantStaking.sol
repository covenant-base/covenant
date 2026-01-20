// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {CovenantBase} from "./lib/CovenantBase.sol";

contract CovenantStaking is CovenantBase {
    using SafeERC20 for IERC20;

    struct StakePosition {
        address owner;
        uint128 amount;
        uint64 unlockTime;
        bool withdrawn;
    }

    IERC20 public immutable token;
    address public feeCollector;
    uint256 public nextPositionId;

    mapping(uint256 => StakePosition) public positions;
    mapping(address => uint256) public totalStakedBy;

    event Staked(uint256 indexed positionId, address indexed owner, uint256 amount, uint64 unlockTime);
    event Withdrawn(uint256 indexed positionId, address indexed owner, uint256 amount);
    event Slashed(uint256 indexed positionId, uint256 amount);

    constructor(address initialOwner, IERC20 stakeToken, address feeCollector_) CovenantBase(initialOwner) {
        token = stakeToken;
        feeCollector = feeCollector_;
        nextPositionId = 1;
    }

    function setFeeCollector(address nextFeeCollector) external onlyOwner {
        feeCollector = nextFeeCollector;
    }

    function stake(uint128 amount, uint64 lockDuration) external whenNotPaused returns (uint256 positionId) {
        positionId = nextPositionId++;
        uint64 unlockTime = uint64(block.timestamp) + lockDuration;
        positions[positionId] = StakePosition({
            owner: msg.sender,
            amount: amount,
            unlockTime: unlockTime,
            withdrawn: false
        });

        totalStakedBy[msg.sender] += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(positionId, msg.sender, amount, unlockTime);
    }

    function extendLock(uint256 positionId, uint64 additionalSeconds) external {
        StakePosition storage position = positions[positionId];
        require(position.owner == msg.sender, "not staker");
        require(!position.withdrawn, "withdrawn");
        position.unlockTime += additionalSeconds;
    }

    function withdraw(uint256 positionId) external {
        StakePosition storage position = positions[positionId];
        require(position.owner == msg.sender, "not staker");
        require(!position.withdrawn, "withdrawn");
        require(block.timestamp >= position.unlockTime, "still locked");

        position.withdrawn = true;
        totalStakedBy[msg.sender] -= position.amount;
        token.safeTransfer(msg.sender, position.amount);
        emit Withdrawn(positionId, msg.sender, position.amount);
    }

    function slash(uint256 positionId, uint128 amount) external onlyOwner {
        StakePosition storage position = positions[positionId];
        require(!position.withdrawn, "withdrawn");
        require(amount <= position.amount, "slash too large");

        position.amount -= amount;
        totalStakedBy[position.owner] -= amount;
        token.safeTransfer(feeCollector, amount);
        emit Slashed(positionId, amount);
    }

    function votingPower(address voter) external view returns (uint256) {
        return totalStakedBy[voter];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {CovenantBase} from "./lib/CovenantBase.sol";

contract CovenantFeeCollector is CovenantBase {
    using SafeERC20 for IERC20;

    event TreasuryWithdrawal(address indexed token, address indexed recipient, uint256 amount);

    constructor(address initialOwner) CovenantBase(initialOwner) {}

    function withdraw(address token, address recipient, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(recipient, amount);
        emit TreasuryWithdrawal(token, recipient, amount);
    }
}

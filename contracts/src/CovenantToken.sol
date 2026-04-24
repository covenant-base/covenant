// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CovenantToken is ERC20, Ownable {
    uint8 private immutable _tokenDecimals;

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        address initialOwner
    ) ERC20(tokenName, tokenSymbol) Ownable(initialOwner) {
        _tokenDecimals = tokenDecimals;
    }

    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

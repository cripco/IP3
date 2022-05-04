// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title IP3Token
 */

import "./libs/Ethless.sol";

contract IP3Token is Ethless {
    function initialize(address owner_, string memory name_, string memory symbol_, uint256 totalSupply_) external initializer {
        __BasicERC20_init_unchained(owner_, name_, symbol_, totalSupply_);
        __Reservable_init_unchained();
        __Ethless_init_unchained();
    }
    
    function balanceOf(address account) public override(Ethless) view returns (uint256 amount) {
        return super.balanceOf(account);
    }
    
    uint256[50] private __gap;
}
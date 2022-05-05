// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title IP3Token
 */

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "./libs/Ethless.sol";

contract IP3Token is AccessControlUpgradeable, ERC20PermitUpgradeable, Ethless {
    function initialize(address owner_, string memory name_, string memory symbol_, uint256 totalSupply_) external initializer {
        __AccessControl_init_unchained();
        _grantRole(DEFAULT_ADMIN_ROLE, owner_);
        __ERC20_init_unchained(name_, symbol_);
        __EIP712_init_unchained(name_, "1");
        __ERC20Permit_init_unchained(name_);
        _mint(owner_, totalSupply_);
        __Reservable_init_unchained();
        __Ethless_init_unchained();
    }
    
    function balanceOf(address account) public override(ERC20Upgradeable, Ethless) view returns (uint256 amount) {
        return super.balanceOf(account);
    }
    
    function chainId()public view returns(uint256){
        return block.chainid;
    }

    function version()public pure returns(string memory){
        return "0.1";
    }
    
    function burn(uint256 amount_) external {
        require(amount_ > 0);
        _burn(_msgSender(), amount_);
    }
    
    uint256[50] private __gap;
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title BasicERC20
 */

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";

contract BasicERC20 is AccessControlUpgradeable, ERC20Upgradeable, ERC20PermitUpgradeable {

    function __BasicERC20_init_unchained(address owner_, string memory name_, string memory symbol_, uint256 totalSupply_) internal onlyInitializing {
        __AccessControl_init_unchained();
        _grantRole(DEFAULT_ADMIN_ROLE, owner_);
        __ERC20_init_unchained(name_, symbol_);
        __EIP712_init_unchained(name_, "1");
        __ERC20Permit_init_unchained(name_);
        _mint(owner_, totalSupply_);
    }
    
    
    function chainId()public view returns(uint256){
        return block.chainid;
    }

    function version()public pure returns(string memory){
        return "0.1";
    }

    function mint(address to_, uint256 amount_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to_ != address(0));
        require(amount_ > 0);
        _mint(to_, amount_);
    }

    
    function burn(uint256 amount_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount_ > 0);
        _burn(_msgSender(), amount_);
    }
    
    uint256[50] private __gap;
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title IIP3Token
 */

interface IIP3Token {
    function initialize(
        address owner_,
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_
    ) external;

    function grantRole(bytes32 role, address account) external;

    function transfer(address to, uint256 amount) external returns (bool);

    function mint(address to_, uint256 amount_) external;

    function burn(uint256 amount_) external;

    function balanceOf(address account) external view returns (uint256);
}

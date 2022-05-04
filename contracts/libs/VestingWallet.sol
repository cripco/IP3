// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title IP3Board
 */
 
import "@openzeppelin/contracts-upgradeable/finance/VestingWalletUpgradeable.sol";

contract VestingWallet is VestingWalletUpgradeable {
    
    function initialize(
        address beneficiaryAddress,
        uint64 startTimestamp,
        uint64 durationSeconds
    ) external initializer {
        __VestingWallet_init(
            beneficiaryAddress, 
            startTimestamp,
            durationSeconds
        );
    }
}
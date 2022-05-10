// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './utils/console.sol';
import './utils/stdlib.sol';
import './utils/test.sol';
import { CheatCodes } from './utils/cheatcodes.sol';

import { IP3Token } from '../IP3Token.sol';

import './SharedHelper.t.sol';

contract IP3TokenTest is DSTest, SharedHelper {
    IP3Token iP3Token;

    uint8 LOG_LEVEL = 0;

    function setUp() public {
        // Deploy contracts
        iP3Token = new IP3Token();
        // Initialize helper
        initialize_helper(LOG_LEVEL, address(iP3Token), address(this));
        if (LOG_LEVEL > 0) _changeLogLevel(LOG_LEVEL);
    }

    // Ethless Reserve
    function test_IP3Token_ethless_reserve() public {
        uint256 amountToReserve = 1000;
        uint256 feeToPay = 100;
        uint256 nonce = 54645;
        uint256 deadline = block.number + 10;

        eip191_reserve_verified(
            USER1,
            USER1_PRIVATEKEY,
            amountToReserve,
            feeToPay,
            nonce,
            USER3,
            USER4,
            USER2,
            deadline,
            true
        );
    }
    
    function test_IP3Token_ethless_reserve_reuseSameNonce() public {
        uint256 amountToReserve = 1000;
        uint256 feeToPay = 100;
        uint256 nonce = 54645;
        uint256 deadline = block.number + 10;

        eip191_reserve_verified(
            USER1,
            USER1_PRIVATEKEY,
            amountToReserve,
            feeToPay,
            nonce,
            USER3,
            USER4,
            USER2,
            deadline,
            true
        );

        bytes memory signature = eip191_sign_reserve(
            USER1,
            USER1_PRIVATEKEY,
            amountToReserve, 
            feeToPay, 
            nonce,
            USER3,
            USER4,
            deadline
        );

        vm.prank(USER2);
        vm.expectRevert('Ethless: nonce already used');
        IP3Token(_ip3Token).reserve(
            USER1,
            USER3,
            USER4,
            amountToReserve,
            feeToPay,
            nonce,
            deadline,
            signature
        );
    }
}

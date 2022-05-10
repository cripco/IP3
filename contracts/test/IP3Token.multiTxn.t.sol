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
    uint256 ORIGIN_BLOCK_NUMBER = block.number;

    function setUp() public {
        // Deploy contracts
        iP3Token = new IP3Token();
        // Initialize helper
        initialize_helper(LOG_LEVEL, address(iP3Token), address(this));
        if (LOG_LEVEL > 0) _changeLogLevel(LOG_LEVEL);
    }

    // Complex scenario
    function test_IP3Token_multiTxn_transferAndBurn_sameBlock() public {
        uint256 AMOUNT_TO_TRANSFER = 100 * 10**18;
        if (LOG_LEVEL > 0) _changeLogLevel(LOG_LEVEL);
        iP3Token.transfer(USER1, AMOUNT_TO_TRANSFER);

        vm.prank(USER1);
        iP3Token.burn(AMOUNT_TO_TRANSFER);

        assertEq(iP3Token.balanceOf(address(this)), TOTALSUPPLY - AMOUNT_TO_TRANSFER);
        assertEq(iP3Token.balanceOf(USER1), 0);
        assertEq(block.number, ORIGIN_BLOCK_NUMBER);
    }

    function test_IP3Token_multiTxn_permitAndTransferFrom_sameBlock() public {
        uint256 AMOUNT_TO_TRANSFER = 100 * 10**18;

        iP3Token.transfer(USER1, AMOUNT_TO_TRANSFER);

        uint256 deadline = block.number + 100;

        eip712_permit_verified(
            USER1,
            USER1_PRIVATEKEY,
            AMOUNT_TO_TRANSFER,
            iP3Token.nonces(USER1),
            USER3,
            USER2,
            deadline
        );

        vm.prank(USER3);

        iP3Token.transferFrom(USER1, USER2, AMOUNT_TO_TRANSFER);
        assertEq(iP3Token.balanceOf(USER2), AMOUNT_TO_TRANSFER);
        assertEq(block.number, ORIGIN_BLOCK_NUMBER);
    }

    function test_IP3Token_multiTxn_allEthless_sameNonce_sameBlock() public {
        uint256 AMOUNT_TO_TRANSFER = 100 * 10**18;
        uint256 AMOUNT_TO_BURN = 30 * 10**18;
        uint256 AMOUNT_TO_RESERVE = 40 * 10**18;
        uint256 deadline = block.number + 100;
        uint256 feeToPay = 100;
        uint256 nonce = 54645;

        eip191_transfer_verified(USER1, USER1_PRIVATEKEY, AMOUNT_TO_TRANSFER, feeToPay, nonce, USER3, USER2, true);

        eip191_burn_verified(USER3, USER3_PRIVATEKEY, AMOUNT_TO_BURN, feeToPay, nonce, USER2, false);

        eip191_reserve_verified(
            USER3,
            USER3_PRIVATEKEY,
            AMOUNT_TO_RESERVE,
            feeToPay,
            nonce,
            USER4,
            USER5,
            USER2,
            deadline,
            false
        );
        assertEq(block.number, ORIGIN_BLOCK_NUMBER);
    }

    function test_IP3Token_multiTxn_eip191_burnAfterTransfer_sameBlock() public {
        uint256 amountToTransfer = 1000;
        uint256 amountToBurn = 600;
        uint256 feeToPay = 100;
        uint256 nonce = 54645;

        eip191_transfer_verified(USER1, USER1_PRIVATEKEY, amountToTransfer, feeToPay, nonce, USER3, USER2, true);

        eip191_burn(USER3, USER3_PRIVATEKEY, amountToBurn, feeToPay, nonce, USER2, false);
        assertEq(block.number, ORIGIN_BLOCK_NUMBER);
    }

    function test_IP3Token_multiTxn_eip191_reserveAfterTransfer_sameBlock() public {
        uint256 amountToTransfer = 1000;
        uint256 amountToReserve = 600;
        uint256 feeToPay = 100;
        uint256 nonce = 54645;
        uint256 deadline = block.number + 100;

        eip191_transfer_verified(USER1, USER1_PRIVATEKEY, amountToTransfer, feeToPay, nonce, USER3, USER2, true);

        eip191_reserve_verified(
            USER3,
            USER3_PRIVATEKEY,
            amountToReserve,
            feeToPay,
            nonce,
            USER4,
            USER5,
            USER2,
            deadline,
            false
        );
        assertEq(block.number, ORIGIN_BLOCK_NUMBER);
    }
}

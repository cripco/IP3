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
        IP3Token(_ip3Token).reserve(USER1, USER3, USER4, amountToReserve, feeToPay, nonce, deadline, signature);
    }

    function test_IP3Token_ethless_reserve_andTransferSameBlock() public {
        uint256 amountToReserve = 500;
        uint256 feeToPay = 100;
        uint256 amountToTransfer = 400;

        iP3Token.transfer(USER1, amountToReserve + feeToPay + amountToTransfer);
        assertEq(iP3Token.balanceOf(USER1), amountToReserve + feeToPay + amountToTransfer);

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
            false
        );

        vm.prank(USER1);
        iP3Token.transfer(USER3, amountToTransfer);

        assertEq(iP3Token.balanceOf(USER1), 0);
        assertEq(iP3Token.balanceOf(USER3), amountToTransfer);
    }

    function test_IP3Token_ethless_reserve_andTransferLessSameBlock() public {
        uint256 amountToReserve = 500;
        uint256 feeToPay = 100;
        uint256 amountToTransfer = 400;

        iP3Token.transfer(USER1, amountToReserve + feeToPay + amountToTransfer);
        assertEq(iP3Token.balanceOf(USER1), amountToReserve + feeToPay + amountToTransfer);

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
            false
        );

        vm.prank(USER1);
        iP3Token.transfer(USER3, amountToTransfer - 1);

        assertEq(iP3Token.balanceOf(USER1), 1);
        assertEq(iP3Token.balanceOf(USER3), amountToTransfer - 1);
    }

    function test_IP3Token_ethless_reserve_andTransferMoreSameBlock() public {
        uint256 amountToReserve = 500;
        uint256 feeToPay = 100;
        uint256 amountToTransfer = 400;

        iP3Token.transfer(USER1, amountToReserve + feeToPay + amountToTransfer);
        assertEq(iP3Token.balanceOf(USER1), amountToReserve + feeToPay + amountToTransfer);

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
            false
        );

        vm.prank(USER1);
        vm.expectRevert('IP3Token: Insufficient balance');
        iP3Token.transfer(USER3, amountToTransfer + 1);

        assertEq(iP3Token.balanceOf(USER1), amountToTransfer);
        assertEq(iP3Token.balanceOf(USER3), 0);
    }
}

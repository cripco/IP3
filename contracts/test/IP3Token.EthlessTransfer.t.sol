// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./utils/console.sol";
import "./utils/stdlib.sol";
import "./utils/test.sol";
import {CheatCodes} from "./utils/cheatcodes.sol";

import {IP3Token} from "../IP3Token.sol";

import "./SharedHelper.t.sol";

contract IP3TokenTest is DSTest, SharedHelper {

    IP3Token iP3Token;

    uint8 LOG_LEVEL = 0;

    address user1 = address(1);
    address user2 = address(2);
    address user3 = address(3);
    function setUp() public {
        // Deploy contracts
        iP3Token = new IP3Token();
        // Initialize helper
        initialize_helper(
            LOG_LEVEL,
            address(iP3Token),
            address(this)
        );
        if(LOG_LEVEL > 0) _changeLogLevel(LOG_LEVEL);
    }

    // Ethless Transfer
    // function test_IP3Token_ethless_transfer() public {
    //     uint256 user1PrivateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    //     user1 = vm.addr(user1PrivateKey);
    //     uint256 amountToTransfer = 10000;
    //     uint256 feeToPay = 100;
    //     uint256 nonce = 54645;

    //     (uint8 signV, bytes32 signR, bytes32 signS) = vm.sign(
    //         user1PrivateKey, 
    //         keccak256(
    //             abi.encodePacked(
    //                 uint8(3),
    //                 block.chainid,
    //                 address(iP3Token),
    //                 user1,
    //                 user3,
    //                 amountToTransfer,
    //                 feeToPay,
    //                 nonce
    //             )
    //         )
    //     );
    //     console.log("signV: ", signV);
    //     console.logBytes32(signR);
    //     console.logBytes32(signS);

    //     bytes memory signature = abi.encodePacked(signR, signS, signV);
    //     console.logBytes(signature);
    //     console.log(signature.length);

    //     vm.prank(user2);
    //     iP3Token.transfer(
    //         user1, 
    //         user3, 
    //         amountToTransfer, 
    //         feeToPay, 
    //         nonce, 
    //         signature
    //     );

    //     uint256 user1Balance = iP3Token.balanceOf(user1);
    //     uint256 user2Balance = iP3Token.balanceOf(user2);
    //     uint256 user3Balance = iP3Token.balanceOf(user3);

    //     if(LOG_LEVEL > 0) {
    //         console.log("User 1 balance: ", user1Balance);
    //         console.log("User 2 balance: ", user2Balance);
    //         console.log("User 3 balance: ", user2Balance);
    //     }
    //     assertEq(user1Balance, TOTALSUPPLY - amountToTransfer - feeToPay);
    //     assertEq(user2Balance, feeToPay);
    //     assertEq(user3Balance, user3Balance);
    // }
}

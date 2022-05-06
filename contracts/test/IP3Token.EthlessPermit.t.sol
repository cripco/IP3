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

    address user1 = address(1);
    address user2 = address(2);
    address user3 = address(3);

    function setUp() public {
        // Deploy contracts
        iP3Token = new IP3Token();
        // Initialize helper
        initialize_helper(LOG_LEVEL, address(iP3Token), address(this));
        if (LOG_LEVEL > 0) _changeLogLevel(LOG_LEVEL);
    }

    // Ethless Permit
    function test_IP3Token_ethless_permit() public {
        uint256 user1PrivateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
        user1 = vm.addr(user1PrivateKey);

        uint256 amountToPermit = 10_000;
        uint256 deadline = block.number + 100;
        (uint8 signV, bytes32 signR, bytes32 signS) = vm.sign(
            user1PrivateKey,
            keccak256(
                abi.encodePacked(
                    '\x19\x01',
                    iP3Token.DOMAIN_SEPARATOR(),
                    keccak256(
                        abi.encode(
                            keccak256(
                                'Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'
                            ),
                            user1,
                            user3,
                            amountToPermit,
                            iP3Token.nonces(user1),
                            deadline
                        )
                    )
                )
            )
        );

        vm.prank(user2);
        iP3Token.permit(user1, user3, amountToPermit, deadline, signV, signR, signS);
        assertEq(iP3Token.allowance(user1, user3), amountToPermit);
    }
}

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

    // Basic ERC20 Call
    function test_IP3Token_basicERC20_name() public {
        assertEq(iP3Token.name(), NAME);
    }

    function test_IP3Token_basicERC20_symbol() public {
        assertEq(iP3Token.symbol(), SYMBOL);
    }

    function test_IP3Token_basicERC20_decimals() public {
        assertEq(iP3Token.decimals(), 18);
    }

    function test_IP3Token_basicERC20_chainId() public {
        assertEq(iP3Token.chainId(), 99);
    }
}

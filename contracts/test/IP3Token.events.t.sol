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

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event Initialized(uint8 version);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        // Deploy contracts
        iP3Token = new IP3Token();
        // Initialize helper
        initialize_helper(LOG_LEVEL, address(iP3Token), address(this));
        if (LOG_LEVEL > 0) _changeLogLevel(LOG_LEVEL);
    }
}

// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './utils/console.sol';
import './utils/stdlib.sol';
import './utils/test.sol';
import { CheatCodes } from './utils/cheatcodes.sol';

import { IP3Token } from '../IP3Token.sol';

contract SharedHelper is DSTest {
    // using console for console;
    Vm public constant vm = Vm(HEVM_ADDRESS);
    //CheatCodes cheats = CheatCodes(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    string constant NAME = 'IP3';
    string constant SYMBOL = 'IP3';

    uint256 constant TOTALSUPPLY = 300_000_000 * 10**18;

    uint8 _LOG_LEVEL;
    address _ip3Token;
    address _testContractAddress;

    // Events
    function initialize_helper(
        uint8 LOG_LEVEL_,
        address ip3Token_,
        address testContractAddress_
    ) internal {
        _LOG_LEVEL = LOG_LEVEL_;
        _ip3Token = ip3Token_;
        _testContractAddress = testContractAddress_;

        // Initialize contracts

        IP3Token(ip3Token_).initialize(testContractAddress_, NAME, SYMBOL, TOTALSUPPLY);
    }

    function _changeLogLevel(uint8 newLogLevel_) internal {
        _LOG_LEVEL = newLogLevel_;
    }
}

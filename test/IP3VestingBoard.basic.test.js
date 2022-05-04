require('dotenv');
const { expect, use } = require('chai');
const { solidity } = require('ethereum-waffle');
const { ethers, network } = require('hardhat');
const TestHelper = require('./shared');
const SignHelper = require('./signature');
use(solidity);

let owner;
let user1;
let user2;
let user3;
let IP3Token;
let IP3VestingBoard;
let provider;
const zeroAddress = '0x0000000000000000000000000000000000000000';

describe('IP3VestingBoard - Basic functions', function () {
    before(async () => {
        [provider, owner, ownerKey, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token, IP3VestingBoard] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3VestingBoard - Vesting Board Info', async function () {
        it('Return the right address for IP3 Token ', async () => {
            expect(await IP3VestingBoard.ip3Token()).to.equal(IP3Token.address);
        });
        it('Token total supply is ' + TestHelper.TOTALSUPPLY, async () => {
            expect(await IP3VestingBoard.ip3TokenTotalSupply()).to.equal(TestHelper.TOTALSUPPLY);
        });
        it('Token allocated before creating vesting wallet is 0', async () => {
            expect(await IP3VestingBoard.ip3TokenAllocated()).to.equal(0);
        });
        it('Last vesting wallet Id created is 0', async () => {
            expect(await IP3VestingBoard.vestingWalletsId()).to.equal(0);
        });
    });
});

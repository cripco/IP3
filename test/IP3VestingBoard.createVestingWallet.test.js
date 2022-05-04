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

describe('IP3VestingBoard - Create Vesting Wallet', function () {
    before(async () => {
        [provider, owner, ownerKey, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token, IP3VestingBoard] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3VestingBoard -Create Vesting Wallet', async function () {
        it('Can Create 1 Vesting Wallet', async () => {
            const currentBlock = await provider.getBlockNumber();
            const blockDetail = await provider.getBlock(currentBlock);
            const inputCreateVestingWallet = await IP3VestingBoard.connect(
                owner
            ).populateTransaction.createVestingWallet(
                user1.address,
                blockDetail.timestamp,
                1000,
                TestHelper.STANDARD_MINT_AMOUNT
            );
            await TestHelper.checkResult(inputCreateVestingWallet, IP3VestingBoard.address, owner, ethers, provider, 0);
            const vestingWalletAddress = await IP3VestingBoard.getVestingWalletAddress(1);
            expect(vestingWalletAddress).to.not.equal(zeroAddress);
        });
    });
});

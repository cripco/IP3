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
let provider;
const zeroAddress = '0x0000000000000000000000000000000000000000';

describe('IP3Token - Reservable functions', function () {
    before(async () => {
        [provider, owner, ownerKey, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
    });
    const amountToReserve = 1000;
    const feeToPay = 10;

    describe('IP3Token - Reserve', async function () {
        it('Test Regular Reserve', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = (blockNumber + 2000);

            const input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256)'](
                owner.address, 
                user1.address, 
                owner.address, 
                amountToReserve, 
                feeToPay, 
                nonce, 
                expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay));
        });
    });

    describe('IP3Token - Reserve & Execute', async function () {
        it('Test Regular Reserve & Execute', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = (blockNumber + 2000);

            const input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256)'](
                owner.address, 
                user1.address, 
                owner.address, 
                amountToReserve, 
                feeToPay, 
                nonce, 
                expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay));
        
            const inputExecute = await IP3Token.connect(owner).populateTransaction['execute(address,uint256)'](
                owner.address, 
                nonce);
            await TestHelper.checkResult(inputExecute, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance).sub(amountToReserve));
            expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(amountToReserve));
        });
    });

    describe('IP3Token - Reserve & Reclaim', async function () {
        it('Test Regular Reserve & Execute', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = (blockNumber + 2);

            const input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256)'](
                owner.address, 
                user1.address, 
                owner.address, 
                amountToReserve, 
                feeToPay, 
                nonce, 
                expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay));
        
            const inputReclaim = await IP3Token.connect(owner).populateTransaction['reclaim(address,uint256)'](
                owner.address, 
                nonce);
            await TestHelper.checkResult(inputReclaim, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
            expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
        });
    });
});

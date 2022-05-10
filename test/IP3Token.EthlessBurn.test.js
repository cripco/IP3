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

describe('IP3Token - Ethless Burn functions', function () {
    before(async () => {
        [provider, owner, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3Token - Regular Ethless Burn', async function () {
        const amountToBurn = 100;
        const feeToPay = 10;

        it('Test Ethless burn', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const signature = SignHelper.signBurn(
                1,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                amountToBurn,
                feeToPay,
                nonce
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'burn(address,uint256,uint256,uint256,bytes)'
            ](owner.address, amountToBurn, feeToPay, nonce, signature);
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToBurn)
            );
            expect(await IP3Token.balanceOf(user3.address)).to.equal(ethers.BigNumber.from(feeToPay));
        });
    });

    describe('IP3Token - Test expecting failure Ethless Burn', async function () {
        const amountToBurn = 100;
        const feeToPay = 10;

        it('Test Ethless burn while reusing the same nonce (and signature) on the second burn', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const signature = SignHelper.signBurn(
                1,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                amountToBurn,
                feeToPay,
                nonce
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'burn(address,uint256,uint256,uint256,bytes)'
            ](owner.address, amountToBurn, feeToPay, nonce, signature);
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToBurn)
            );
            expect(await IP3Token.balanceOf(user3.address)).to.equal(ethers.BigNumber.from(feeToPay));

            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Ethless: nonce already used'
            );
        });

        it('Test Ethless burn while amountToBurn + feeToPay is higher than the balance', async () => {
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user1.address,
                amountToBurn - feeToPay / 2
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            const nonce = Date.now();
            const signature = SignHelper.signBurn(
                1,
                network.config.chainId,
                IP3Token.address,
                user1.address,
                user1.privateKey,
                amountToBurn,
                feeToPay,
                nonce
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'burn(address,uint256,uint256,uint256,bytes)'
            ](user1.address, amountToBurn, feeToPay, nonce, signature);
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'ERC20: burn amount exceeds balance'
            );
        });

        it('Test Ethless burn while amountToBurn is higher than the balance', async () => {
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user1.address,
                amountToBurn - feeToPay
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            const nonce = Date.now();
            const signature = SignHelper.signBurn(
                1,
                network.config.chainId,
                IP3Token.address,
                user1.address,
                user1.privateKey,
                amountToBurn,
                feeToPay,
                nonce
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'burn(address,uint256,uint256,uint256,bytes)'
            ](user1.address, amountToBurn, feeToPay, nonce, signature);
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'ERC20: burn amount exceeds balance'
            );
        });

        it('Test Ethless burn while feeToPay is higher than the balance', async () => {
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user1.address,
                feeToPay / 2
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            const nonce = Date.now();
            const signature = SignHelper.signBurn(
                1,
                network.config.chainId,
                IP3Token.address,
                user1.address,
                user1.privateKey,
                amountToBurn,
                feeToPay,
                nonce
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'burn(address,uint256,uint256,uint256,bytes)'
            ](user1.address, amountToBurn, feeToPay, nonce, signature);
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'ERC20: transfer amount exceeds balance'
            );
        });
    });
});

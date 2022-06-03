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

describe('IP3Token - Ethless Reserve functions', function () {
    before(async () => {
        [provider, owner, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3Token - Regular Ethless Reserve', async function () {
        const amountToReserve = 1000;
        const feeToPay = 10;

        it('Test Ethless Reserve', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );
        });
        it('Test Ethless Reserve + ReserveOf', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const reserveOf = await IP3Token.reserveOf(owner.address);
            expect(reserveOf).to.equal(ethers.BigNumber.from(amountToReserve).add(feeToPay));
        });
        it('Test Ethless Reserve + GetReservation', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const getReservation = await IP3Token.getReservation(owner.address, nonce);
            expect(getReservation['amount'], 'amount').to.equal(ethers.BigNumber.from(amountToReserve));
            expect(getReservation['fee'], 'fee').to.equal(ethers.BigNumber.from(feeToPay));
            expect(getReservation['recipient'], 'recipient').to.equal(user1.address);
            expect(getReservation['executor'], 'executor').to.equal(owner.address);
            expect(getReservation['expiryBlockNum'], 'expiryBlockNum').to.equal(ethers.BigNumber.from(expirationBlock));
            expect(getReservation['status'], 'status').to.equal(1);
        });
        it('Test Ethless Reserve & Execute', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const inputExecute = await IP3Token.connect(owner).populateTransaction['execute(address,uint256)'](
                owner.address,
                nonce
            );
            await TestHelper.checkResult(inputExecute, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve)
            );
            expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(amountToReserve));
        });
        it('Test Ethless Reserve & Reclaim', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const inputReclaim = await IP3Token.connect(owner).populateTransaction['reclaim(address,uint256)'](
                owner.address,
                nonce
            );
            await TestHelper.checkResult(inputReclaim, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
            expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
        });
    });

    describe('IP3Token - Test expecting failure Ethless Reserve', async function () {
        const amountToReserve = 1000;
        const feeToPay = 10;

        it('Test Ethless Reserve while reusing the same nonce (and signature) on the second reserve', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Ethless: nonce already used'
            );
        });

        it('Test Ethless Reserve while amountToReserve + feeToPay is higher than the balance', async () => {
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user2.address,
                amountToReserve - feeToPay / 2
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                user2.address,
                user2.privateKey,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                user2.address,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Reservable: reserve amount exceeds balance'
            );
        });

        it('Test Ethless Reserve while amountToReserve is higher than the balance', async () => {
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user2.address,
                amountToReserve - feeToPay
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                user2.address,
                user2.privateKey,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                user2.address,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Reservable: reserve amount exceeds balance'
            );
        });

        it('Test Ethless Reserve while feeToPay is higher than the balance', async () => {
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user2.address,
                feeToPay / 2
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                user2.address,
                user2.privateKey,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                user2.address,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Reservable: reserve amount exceeds balance'
            );
        });

        it('Test Ethless Reserve while expirationBlock is lower than the current block.number', async () => {
            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber - 100;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Reservable: deadline must be in the future'
            );
        });

        it('Test Ethless Reserve while expirationBlock is the current block.number', async () => {
            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user3.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                blockNumber
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](owner.address, user3.address, owner.address, amountToReserve, feeToPay, nonce, blockNumber, signature);
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Reservable: deadline must be in the future'
            );
        });

        it('Test Ethless Reserve & Execute while reservation is expired already', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                owner.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const inputExecute = await IP3Token.connect(owner).populateTransaction['execute(address,uint256)'](
                owner.address,
                nonce
            );
            await TestHelper.checkResult(
                inputExecute,
                IP3Token.address,
                owner,
                ethers,
                provider,
                'Reservable: reservation has expired and cannot be executed'
            );
        });
        it('Test Ethless Reserve & Reclaim while reservation is not expired yet', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const signature = SignHelper.signReserve(
                4,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user1.address,
                user3.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock
            );
            const input = await IP3Token.connect(user3).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'
            ](
                owner.address,
                user1.address,
                user3.address,
                amountToReserve,
                feeToPay,
                nonce,
                expirationBlock,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const inputReclaim = await IP3Token.connect(owner).populateTransaction['reclaim(address,uint256)'](
                owner.address,
                nonce
            );
            await TestHelper.checkResult(
                inputReclaim,
                IP3Token.address,
                owner,
                ethers,
                provider,
                'Reservable: reservation has not expired or you are not the executor and cannot be reclaimed'
            );
        });
    });
});

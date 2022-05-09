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
        [provider, owner, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
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
            const expirationBlock = blockNumber + 2000;

            const input = await IP3Token.connect(owner).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256)'
            ](owner.address, user1.address, owner.address, amountToReserve, feeToPay, nonce, expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );
        });
        it('Test Regular ReserveOf', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const input = await IP3Token.connect(owner).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256)'
            ](owner.address, user1.address, owner.address, amountToReserve, feeToPay, nonce, expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const reserveOf = await IP3Token.reserveOf(owner.address);
            expect(reserveOf).to.equal(ethers.BigNumber.from(amountToReserve).add(feeToPay));
        });
        it('Test Regular GetReservation', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const input = await IP3Token.connect(owner).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256)'
            ](owner.address, user1.address, owner.address, amountToReserve, feeToPay, nonce, expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
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
    });

    describe('IP3Token - Reserve & Execute', async function () {
        it('Test Regular Reserve & Execute', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2000;

            const input = await IP3Token.connect(owner).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256)'
            ](owner.address, user1.address, owner.address, amountToReserve, feeToPay, nonce, expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
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
    });

    describe('IP3Token - Reserve & Reclaim', async function () {
        it('Test Regular Reserve & Reclaim', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 2;

            const input = await IP3Token.connect(owner).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256)'
            ](owner.address, user1.address, owner.address, amountToReserve, feeToPay, nonce, expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
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

    describe('IP3Token - Test expecting failure Reserve & Reclaim', async function () {
        it('Test Regular Reserve & Reclaim by someone else than executor and sender', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 200;

            const input = await IP3Token.connect(owner).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256)'
            ](owner.address, user1.address, owner.address, amountToReserve, feeToPay, nonce, expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToReserve).sub(feeToPay)
            );

            const inputReclaim = await IP3Token.connect(user3).populateTransaction['reclaim(address,uint256)'](
                owner.address,
                nonce
            );
            await TestHelper.checkResult(
                inputReclaim,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'Reservable: only the sender or the executor can reclaim the reservation back to the sender'
            );
        });
        it('Test Regular Reserve & Reclaim on non-expired reservation', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const blockNumber = await provider.getBlockNumber();
            const expirationBlock = blockNumber + 200;

            const input = await IP3Token.connect(owner).populateTransaction[
                'reserve(address,address,address,uint256,uint256,uint256,uint256)'
            ](owner.address, user1.address, user2.address, amountToReserve, feeToPay, nonce, expirationBlock);
            await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
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
        it('Test Regular ReserveOf on user without reservation', async () => {
            const reserveOf = await IP3Token.reserveOf(user1.address);
            expect(reserveOf).to.equal(ethers.BigNumber.from(0));
        });
        it('Test GetReservation on non-existing reservation', async () => {
            const nonce = Date.now();
            const getReservation = await IP3Token.getReservation(user1.address, nonce);
            expect(getReservation['amount'], 'amount').to.equal(ethers.BigNumber.from(0));
            expect(getReservation['fee'], 'fee').to.equal(ethers.BigNumber.from(0));
            expect(getReservation['recipient'], 'recipient').to.equal(zeroAddress);
            expect(getReservation['executor'], 'executor').to.equal(zeroAddress);
            expect(getReservation['expiryBlockNum'], 'expiryBlockNum').to.equal(ethers.BigNumber.from(0));
            expect(getReservation['status'], 'status').to.equal(0);
        });
    });
});

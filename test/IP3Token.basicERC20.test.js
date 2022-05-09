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

describe('IP3Token - Basic ERC20 functions', function () {
    before(async () => {
        [provider, owner, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3Token - ERC20 Token Info', async function () {
        it('Token name is ' + TestHelper.NAME, async () => {
            expect(await IP3Token.name()).to.equal(TestHelper.NAME);
        });
        it('Token symbol is ' + TestHelper.SYMBOLE, async () => {
            expect(await IP3Token.symbol()).to.equal(TestHelper.SYMBOL);
        });
        it('Token decimals is ' + TestHelper.DECIMALS, async () => {
            expect(await IP3Token.decimals()).to.equal(TestHelper.DECIMALS);
        });
        it('Token chainId is ' + network.config.chainId, async () => {
            expect(await IP3Token.chainId()).to.equal(network.config.chainId);
        });
        it('Token version is ' + TestHelper.VERSION, async () => {
            expect(await IP3Token.version()).to.equal(TestHelper.VERSION);
        });
    });

    describe('IP3Token - Allowance', async function () {
        const amountToApprove = 100;
        const amountToIncrease = 100;
        const amountToDecrease = 50;

        beforeEach(async () => {
            const amountToTransfer = 100;
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user1.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
        });
        it('Test approve()', async () => {
            const inputApprove = await IP3Token.connect(user1).populateTransaction.approve(
                user2.address,
                amountToApprove
            );
            await TestHelper.checkResult(inputApprove, IP3Token.address, user1, ethers, provider, 0);
            expect((await IP3Token.allowance(user1.address, user2.address)).toString()).to.equal(
                amountToApprove.toString()
            );
        });
        it('Test increaseAllowance()', async () => {
            const inputIncreaseAllowance = await IP3Token.connect(user1).populateTransaction.increaseAllowance(
                user2.address,
                amountToIncrease
            );
            await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, user1, ethers, provider, 0);
            expect((await IP3Token.allowance(user1.address, user2.address)).toString()).to.equal(
                amountToIncrease.toString()
            );
        });
        it('Test decreaseAllowance()', async () => {
            const inputApprove = await IP3Token.connect(user1).populateTransaction.approve(
                user2.address,
                amountToApprove
            );
            await TestHelper.checkResult(inputApprove, IP3Token.address, user1, ethers, provider, 0);
            expect((await IP3Token.allowance(user1.address, user2.address)).toString()).to.equal(
                amountToApprove.toString()
            );

            const inputDecreaseAllowance = await IP3Token.connect(user1).populateTransaction.decreaseAllowance(
                user2.address,
                amountToDecrease
            );
            await TestHelper.checkResult(inputDecreaseAllowance, IP3Token.address, user1, ethers, provider, 0);
            expect((await IP3Token.allowance(user1.address, user2.address)).toString()).to.equal((50).toString());
        });
    });

    describe('IP3Token - transfer and transferFrom', async function () {
        const amountToTransfer = 100;

        it('Test transfer() / verify balanceOf owner is -1000', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user2.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToTransfer)
            );
            expect((await IP3Token.balanceOf(user2.address)).toString()).to.equal(amountToTransfer.toString());
        });
        it('Test transferFrom() / verify balance of owner is -1000', async () => {
            const originalOwnerBalance = await IP3Token.balanceOf(owner.address);
            const originalUser2Balance = await IP3Token.balanceOf(user2.address);

            const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(
                user1.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);

            const inputTransferFrom = await IP3Token.connect(user1).populateTransaction.transferFrom(
                owner.address,
                user2.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransferFrom, IP3Token.address, user1, ethers, provider, 0);

            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalOwnerBalance).sub(amountToTransfer)
            );
            expect((await IP3Token.balanceOf(user2.address)).toString()).to.equal(
                ethers.BigNumber.from(originalUser2Balance).add(amountToTransfer)
            );
        });
    });

    describe('IP3Token - burn', async function () {
        const amountToBurn = 100;

        it('Test burn() / verify balanceOf owner is -100', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const inputTransfer = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](amountToBurn);
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);

            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToBurn)
            );
        });
    });

    describe('IP3Token - Test expecting failure Allowance', async function () {
        const amountToApprove = 100;
        const amountToDecrease = 150;

        beforeEach(async () => {
            const amountToTransfer = 100;
            const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](
                user1.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
        });
        it('Test decreaseAllowance() by more than the current allowance', async () => {
            const inputApprove = await IP3Token.connect(user1).populateTransaction.approve(
                user2.address,
                amountToApprove
            );
            await TestHelper.checkResult(inputApprove, IP3Token.address, user1, ethers, provider, 0);
            expect((await IP3Token.allowance(user1.address, user2.address)).toString()).to.equal(
                amountToApprove.toString()
            );

            const inputDecreaseAllowance = await IP3Token.connect(user1).populateTransaction.decreaseAllowance(
                user2.address,
                amountToDecrease
            );
            await TestHelper.checkResult(inputDecreaseAllowance, IP3Token.address, user1, ethers, provider, 'ERC20: decreased allowance below zero');
        });
    });

    describe('IP3Token - Test expecting failure transfer and transferFrom', async function () {
        const amountToTransfer = 100;

        it('Test transfer() without balance', async () => {
            const originalUser1Balance = await IP3Token.balanceOf(user1.address);

            const inputTransfer = await IP3Token.connect(user1).populateTransaction['transfer(address,uint256)'](
                user2.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 'ERC20: transfer amount exceeds balance');
            expect(await IP3Token.balanceOf(user1.address)).to.equal(
                ethers.BigNumber.from(originalUser1Balance)
            );
        });
        it('Test transferFrom() without allowance', async () => {
            const originalUser1Balance = await IP3Token.balanceOf(user1.address);
            const originalUser3Balance = await IP3Token.balanceOf(user3.address);

            const inputTransferFrom = await IP3Token.connect(user2).populateTransaction.transferFrom(
                user1.address,
                user3.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransferFrom, IP3Token.address, user2, ethers, provider, 'ERC20: insufficient allowance');
            expect(await IP3Token.balanceOf(user1.address)).to.equal(
                ethers.BigNumber.from(originalUser1Balance)
            );
            expect(await IP3Token.balanceOf(user3.address)).to.equal(
                ethers.BigNumber.from(originalUser3Balance)
            );
        });
        it('Test transferFrom() without balance', async () => {
            const originalUser1Balance = await IP3Token.balanceOf(user1.address);
            const originalUser3Balance = await IP3Token.balanceOf(user3.address);

            const inputApprove = await IP3Token.connect(user1).populateTransaction.approve(
                user2.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputApprove, IP3Token.address, user1, ethers, provider, 0);

            const inputTransferFrom = await IP3Token.connect(user2).populateTransaction.transferFrom(
                user1.address,
                user3.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransferFrom, IP3Token.address, user2, ethers, provider, 'ERC20: transfer amount exceeds balance');
            expect(await IP3Token.balanceOf(user1.address)).to.equal(
                ethers.BigNumber.from(originalUser1Balance)
            );
            expect(await IP3Token.balanceOf(user3.address)).to.equal(
                ethers.BigNumber.from(originalUser3Balance)
            );
        });
        it('Test 2x transferFrom() second transferFrom will fail due to remaining allowance to low', async () => {
            const originalOwnerBalance = await IP3Token.balanceOf(owner.address);
            const originalUser2Balance = await IP3Token.balanceOf(user2.address);

            const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(
                user1.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);

            const inputTransferFrom = await IP3Token.connect(user1).populateTransaction.transferFrom(
                owner.address,
                user2.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransferFrom, IP3Token.address, user1, ethers, provider, 0);

            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalOwnerBalance).sub(amountToTransfer)
            );
            expect((await IP3Token.balanceOf(user2.address)).toString()).to.equal(
                ethers.BigNumber.from(originalUser2Balance).add(amountToTransfer)
            );
            
            await TestHelper.checkResult(inputTransferFrom, IP3Token.address, user1, ethers, provider, 'ERC20: insufficient allowance');
        });
    });

    describe('IP3Token - Test expecting failure burn', async function () {
        const amountToBurn = 100;

        it('Test burn() without balance', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const inputTransfer = await IP3Token.connect(user1).populateTransaction['burn(uint256)'](amountToBurn);
            await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 'ERC20: burn amount exceeds balance');

            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance)
            );
        });
    });

    describe('IP3Token - EIP-712 support', async function () {
        it('Return DOMAIN_SEPARATOR', async () => {
            let msg;
            try {
                await IP3Token.DOMAIN_SEPARATOR();
                msg = 'DOMAIN_SEPARATOR succeeded';
            } catch {
                msg = 'DOMAIN_SEPARATOR failed';
            }
            expect(msg).to.be.equal('DOMAIN_SEPARATOR succeeded');
        });
    });
});

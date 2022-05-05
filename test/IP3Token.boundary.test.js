require('dotenv');
const { expect, use } = require('chai');
const { solidity } = require('ethereum-waffle');
const { ethers, network } = require('hardhat');
const Chance = require('chance')
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

describe('IP3Token - Boundary', function () {
    let originalBalance;
    before(async () => {
        [provider, owner, owner.privateKey, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
        originalBalance = await IP3Token.balanceOf(owner.address);
    });

    describe('Test floating point on different fn()', () => {
        it('Test burn() w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ min: 0, max: 100, fixed: 7 });
                let msg;
                try {
                        const inputBurn = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](amount);
                        msg = await TestHelper.checkResult(inputBurn, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no floating point');
        });
        it('Test burn(w/ signature) w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ min: 0, max: 100, fixed: 7 });
                const feeToPay = 10;
                const nonce = Date.now();
                const signature = SignHelper.signBurn(1, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, amount, feeToPay, nonce);
                
                let msg;
                try {
                        let input = await IP3Token.connect(owner).populateTransaction['burn(address,uint256,uint256,uint256,bytes)'](
                                owner.address,
                                amount,
                                feeToPay,
                                nonce, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no floating point');
        });
        it('Test transfer() w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ min: 0, max: 1000, fixed: 7 });
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](user1.address, amount, { from: owner.address });
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no floating point');
        });
        it('Test transferFrom() w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ min: 0, max: 1000, fixed: 7 });
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(user1.address, 1000);
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);

                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(user1).populateTransaction.transferFrom(owner.address, user2.address, amount);
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no floating point');
        });
        it('Test transfer(w/ signature) w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ min: 0, max: 1000, fixed: 7 });
                const feeToPay = 10;
                const nonce = Date.now();

                let msg;
                try {
                        const signature = SignHelper.signTransfer(3, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, amount, feeToPay, nonce);
                        let input = await IP3Token.connect(owner).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                        owner.address,
                        user1.address,
                        amount,
                        feeToPay,
                        nonce, 
                        signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no floating point');
        });
        it('Test reserve(w/ signature) w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ min: 0, max: 1000, fixed: 7 });

                const feeToPay = 10;
                const nonce = Date.now();
                const blockNumber = await provider.blockNumber;
                const expirationBlock = (blockNumber + 2000);

                let msg;
                try {
                        const signature = SignHelper.signReserve(4, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, owner.address, amount, feeToPay, nonce, expirationBlock);
                        let input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'](
                                owner.address, 
                                user1.address, 
                                owner.address, 
                                amount, 
                                feeToPay, 
                                nonce, 
                                expirationBlock, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no floating point');
        });
        it('Test approve() w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ fixed: 7 });
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no floating point');
        });
        it('Test increaseAllowance() w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ fixed: 7 });
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, 1000);
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const inputIncreaseAllowance = await IP3Token.connect(owner).populateTransaction.increaseAllowance(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(1000));
                expect(msg).to.equal('no floating point');
        });
        it('Test decreaseAllowance() w/ floating point', async () => {
                const chance = new Chance;
                const amount = chance.floating({ min: 0, max: 100, fixed: 7 });
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, 1000);
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.decreaseAllowance(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no floating point';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(1000));
                expect(msg).to.equal('no floating point');
        });
});

describe('Test negative number on different fn()', () => {
        it('Test burn() w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                let msg;
                try {
                        const inputBurn = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](amount);
                        msg = await TestHelper.checkResult(inputBurn, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no negative number');
        });
        it('Test burn(w/ signature) w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                const feeToPay = 10;
                const nonce = Date.now();
                let msg;
                try {
                        const signature = SignHelper.signBurn(1, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, amount, feeToPay, nonce);        
                        let input = await IP3Token.connect(owner).populateTransaction['burn(address,uint256,uint256,uint256,bytes)'](
                                owner.address,
                                amount,
                                feeToPay,
                                nonce, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no negative number');
        });
        it('Test transfer() w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](user1.address, amount, { from: owner.address });
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no negative number');
        });
        it('Test transferFrom() w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(user1.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);

                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(user1).populateTransaction.transferFrom(owner.address, user2.address, amount);
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no negative number');
        });
        it('Test transfer(w/ signature) w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                const feeToPay = 10;
                const nonce = Date.now();

                let msg;
                try {
                        const signature = SignHelper.signTransfer(3, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, amount, feeToPay, nonce);
                        let input = await IP3Token.connect(owner).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                        owner.address,
                        user1.address,
                        amount,
                        feeToPay,
                        nonce, 
                        signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no negative number');
        });
        it('Test reserve(w/ signature) w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});

                const feeToPay = 10;
                const nonce = Date.now();
                const blockNumber = await provider.blockNumber;
                const expirationBlock = (blockNumber + 2000);

                let msg;
                try {
                        const signature = SignHelper.signReserve(4, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, owner.address, amount, feeToPay, nonce, expirationBlock);
                        let input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'](
                                owner.address, 
                                user1.address, 
                                owner.address, 
                                amount, 
                                feeToPay, 
                                nonce, 
                                expirationBlock, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no negative number');
        });
        it('Test approve() w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(0);
                expect(msg).to.equal('no negative number');
        });
        it('Test increaseAllowance() w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const inputIncreaseAllowance = await IP3Token.connect(owner).populateTransaction.increaseAllowance(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no negative number');
        });
        it('Test decreaseAllowance() w/ negative number', async () => {
                const chance = new Chance;
                const amount = chance.integer({min: -10000, max: -1});
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.decreaseAllowance(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no negative number';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no negative number');
        });
});

describe('Test zero(0) number on different fn()', () => {
        it('Test burn() w/ zero(0) number', async () => {
                const amount = 0;
                let msg;
                try {
                const inputBurn = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](amount);
                msg = await TestHelper.checkResult(inputBurn, IP3Token.address, owner, ethers, provider, 0);
        } catch(err) {
                msg = 'ERC20: burn amount exceeds balance';
        }
                
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
        });
        it('Test burn(w/ signature) w/ zero(0) number', async () => {
                const amount = 0;
                const feeToPay = 10;
                const nonce = Date.now();
                const signature = SignHelper.signBurn(1, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, amount, feeToPay, nonce);
                
                let msg;
                try {
                        let input = await IP3Token.connect(owner).populateTransaction['burn(address,uint256,uint256,uint256,bytes)'](
                                owner.address,
                                amount,
                                feeToPay,
                                nonce, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'ERC20: burn amount exceeds balance';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('ERC20: burn amount exceeds balance');
        });
        it('Test transfer() w/ zero(0) number', async () => {
                const amount = 0;
                const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](user1.address, amount, { from: owner.address });
                await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
                
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
        });
        it('Test transferFrom() w/ zero(0) number', async () => {
                const amount = 0;
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(user1.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
    
                const inputTransfer = await IP3Token.connect(user1).populateTransaction.transferFrom(owner.address, user2.address, amount);
                await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 0);
                
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
        });
        it('Test transfer(w/ signature) w/ zero(0) number', async () => {
                const amounToTransfer = 0;
                const feeToPay = 0;
                const nonce = Date.now();

                const signature = SignHelper.signTransfer(3, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, amounToTransfer, feeToPay, nonce);
                let input = await IP3Token.connect(owner).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                        owner.address,
                        user1.address,
                        amounToTransfer,
                        feeToPay,
                        nonce, 
                        signature, { from: owner.address });
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
        });
        it('Test reserve(w/ signature) w/ zero(0) number', async () => {
                const amounToReserve = 0;
                const feeToPay = 0;
                const nonce = Date.now();
                const blockNumber = await provider.blockNumber;
                const expirationBlock = (blockNumber + 2000);

                const signature = SignHelper.signReserve(4, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, owner.address, amounToReserve, feeToPay, nonce, expirationBlock);
                const input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'](
                        owner.address, 
                        user1.address, 
                        owner.address, 
                        amounToReserve, 
                        feeToPay, 
                        nonce, 
                        expirationBlock, 
                        signature, { from: owner.address, gasLimit: ethers.utils.hexlify(3000000) });
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
        });
        it('Test approve() w/ zero(0) number', async () => {
                const amount = 0;
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, amount);
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(0));
        });
        it('Test increaseAllowance() w/ zero(0) number', async () => {
                const amount = 0;
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                const inputIncreaseAllowance = await IP3Token.connect(owner).populateTransaction.increaseAllowance(IP3Token.address, amount);
                await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, owner, ethers, provider, 0);
                
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
        });
        it('Test decreaseAllowance() w/ zero(0) number', async () => {
                const amount = 0;
                const inputAprove = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputAprove, IP3Token.address, owner, ethers, provider, 0);
                const input = await IP3Token.connect(owner).populateTransaction.decreaseAllowance(IP3Token.address, amount);
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
        });
});

describe('Test overflow on different fn()', () => {
        it('Test burn() w/ overflow', async () => {
                const amount = 2**256;
                let msg;
                try {
                        const inputBurn = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](amount);
                        msg = await TestHelper.checkResult(inputBurn, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no overflow');
        });
        it('Test burn(w/ signature) w/ overflow', async () => {
                const amount = 2**256;
                const feeToPay = 10;
                const nonce = Date.now();
                let msg;
                try {
                        const signature = SignHelper.signBurn(1, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, amount, feeToPay, nonce);        
                        let input = await IP3Token.connect(owner).populateTransaction['burn(address,uint256,uint256,uint256,bytes)'](
                                owner.address,
                                amount,
                                feeToPay,
                                nonce, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no overflow');
        });
        it('Test transfer() w/ overflow', async () => {
                const amount = 2**256;
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](user1.address, amount, { from: owner.address });
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no overflow');
        });
        it('Test transferFrom() w/ overflow', async () => {
                const amount = 2**256;
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(user1.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
    
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(user1).populateTransaction.transferFrom(owner.address, user2.address, amount);
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no overflow');
        });
        it('Test transfer(w/ signature) w/ overflow', async () => {
                const amount = 2**256;
                const feeToPay = 10;
                const nonce = Date.now();

                let msg;
                try {
                        const signature = SignHelper.signTransfer(3, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, amount, feeToPay, nonce);
                        let input = await IP3Token.connect(owner).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                        owner.address,
                        user1.address,
                        amount,
                        feeToPay,
                        nonce, 
                        signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no overflow');
        });
        it('Test reserve(w/ signature) w/ overflow', async () => {
                const amount = 2**256;

                const feeToPay = 10;
                const nonce = Date.now();
                const blockNumber = await provider.blockNumber;
                const expirationBlock = (blockNumber + 2000);

                let msg;
                try {
                        const signature = SignHelper.signReserve(4, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, owner.address, amount, feeToPay, nonce, expirationBlock);
                        let input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'](
                                owner.address, 
                                user1.address, 
                                owner.address, 
                                amount, 
                                feeToPay, 
                                nonce, 
                                expirationBlock, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no overflow');
        });
        it('Test approve() w/ overflow', async () => {
                const amount = 2**256;
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no overflow');
        });
        it('Test increaseAllowance() w/ overflow', async () => {
                const amount = 2**256;
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const inputIncreaseAllowance = await IP3Token.connect(owner).populateTransaction.increaseAllowance(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no overflow');
        });
        it('Test decreaseAllowance() w/ overflow', async () => {
                const amount = 2**256;
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.decreaseAllowance(IP3Token.address, amount);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no overflow';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no overflow');
        });
});

describe('Test NaN on different fn()', () => {
        it('Test burn() w/ NaN', async () => {
                const amount = NaN;
                let msg;
                try {
                        const inputBurn = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](amount);
                        await TestHelper.checkResult(inputBurn, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no NaN');
        });
        it('Test burn(w/ signature) w/ NaN', async () => {
                const amount = NaN;
                const feeToPay = 10;
                const nonce = Date.now();
                const signature = SignHelper.signBurn(1, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, amount, feeToPay, nonce);
                
                let msg;
                try {
                        let input = await IP3Token.connect(owner).populateTransaction['burn(address,uint256,uint256,uint256,bytes)'](
                                owner.address,
                                amount,
                                feeToPay,
                                nonce, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no NaN');
        });
        it('Test transfer() w/ NaN', async () => {
                const amount = NaN;
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](user1.address, amount, { from: owner.address });
                        await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no NaN');
        });
        it('Test transferFrom() w/ NaN', async () => {
                const amount = NaN;
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(user1.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(user1).populateTransaction.transferFrom(owner.address, user2.address, amount);
                        await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no NaN');
        });
        it('Test transfer(w/ signature) w/ NaN', async () => {
                const amount = NaN;
                const feeToPay = 10;
                const nonce = Date.now();

                let msg;
                try {
                        const signature = SignHelper.signTransfer(3, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, amount, feeToPay, nonce);
                        let input = await IP3Token.connect(owner).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                        owner.address,
                        user1.address,
                        amount,
                        feeToPay,
                        nonce, 
                        signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no NaN');
        });
        it('Test reserve(w/ signature) w/ NaN', async () => {
                const amount = NaN;

                const feeToPay = 10;
                const nonce = Date.now();
                const blockNumber = await provider.blockNumber;
                const expirationBlock = (blockNumber + 2000);

                let msg;
                try {
                        const signature = SignHelper.signReserve(4, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, owner.address, amount, feeToPay, nonce, expirationBlock);
                        let input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'](
                                owner.address, 
                                user1.address, 
                                owner.address, 
                                amount, 
                                feeToPay, 
                                nonce, 
                                expirationBlock, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no NaN');
        });
        it('Test approve() w/ NaN', async () => {
                const amount = NaN;
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, amount);
                        await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no NaN');
        });
        it('Test increaseAllowance() w/ NaN', async () => {
                const amount = NaN;
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const inputIncreaseAllowance = await IP3Token.connect(owner).populateTransaction.increaseAllowance(IP3Token.address, amount);
                        await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no NaN');
        });
        it('Test decreaseAllowance() w/ NaN', async () => {
                const amount = NaN;
                const inputAprove = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputAprove, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.decreaseAllowance(IP3Token.address, amount);
                        await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no NaN';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no NaN');
        });
});

describe('Test empty string on different fn()', () => {
        it('Test burn() w/ empty string', async () => {
                const emptyString = '';
                let msg;
                try {
                        const inputBurn = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](emptyString);
                        msg = await TestHelper.checkResult(inputBurn, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no empty string');
        });
        it('Test burn(w/ signature) w/ empty string', async () => {
                const emptyString = '';
                const feeToPay = 10;
                const nonce = Date.now();
                const signature = SignHelper.signBurn(1, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, emptyString, feeToPay, nonce);
                
                let msg;
                try {
                        let input = await IP3Token.connect(owner).populateTransaction['burn(address,uint256,uint256,uint256,bytes)'](
                                owner.address,
                                emptyString,
                                feeToPay,
                                nonce, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no empty string');
        });
        it('Test transfer() w/ empty string', async () => {
                const emptyString = '';
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](user1.address, emptyString, { from: owner.address });
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no empty string');
        });
        it('Test transferFrom() w/ empty string', async () => {
                const emptyString = '';
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(user1.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
    
                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(user1).populateTransaction.transferFrom(owner.address, user2.address, emptyString);
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no empty string');
        });
        it('Test transfer(w/ signature) w/ empty string', async () => {
                const emptyString = '';
                const feeToPay = 10;
                const nonce = Date.now();

                let msg;
                try {
                        const signature = SignHelper.signTransfer(3, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, emptyString, feeToPay, nonce);
                        let input = await IP3Token.connect(owner).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                        owner.address,
                        user1.address,
                        emptyString,
                        feeToPay,
                        nonce, 
                        signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no empty string');
        });
        it('Test reserve(w/ signature) w/ empty string', async () => {
                const emptyString = '';

                const feeToPay = 10;
                const nonce = Date.now();
                const blockNumber = await provider.blockNumber;
                const expirationBlock = (blockNumber + 2000);

                let msg;
                try {
                        const signature = SignHelper.signReserve(4, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, owner.address, emptyString, feeToPay, nonce, expirationBlock);
                        let input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'](
                                owner.address, 
                                user1.address, 
                                owner.address, 
                                emptyString, 
                                feeToPay, 
                                nonce, 
                                expirationBlock, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no empty string');
        });
        it('Test approve() w/ empty string', async () => {
                const emptyString = '';
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, emptyString);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no empty string');
        });
        it('Test increaseAllowance() w/ empty string', async () => {
                const emptyString = '';
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const inputIncreaseAllowance = await IP3Token.connect(owner).populateTransaction.increaseAllowance(IP3Token.address, emptyString);
                        msg = await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no empty string');
        });
        it('Test decreaseAllowance() w/ empty string', async () => {
                const emptyString = '';
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.decreaseAllowance(IP3Token.address, emptyString);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no empty string';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no empty string');
        });
});
describe('Test random string on different fn()', () => {
        it('Test burn() w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();
                let msg;
                try {
                        const inputBurn = await IP3Token.connect(owner).populateTransaction['burn(uint256)'](randomString);
                        msg = await TestHelper.checkResult(inputBurn, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no random string');
        });
        it('Test burn(w/ signature) w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();
                
                const feeToPay = 10;
                const nonce = Date.now();
                const signature = SignHelper.signBurn(1, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, randomString, feeToPay, nonce);
                
                let msg;
                try {
                        let input = await IP3Token.connect(owner).populateTransaction['burn(address,uint256,uint256,uint256,bytes)'](
                                owner.address,
                                randomString,
                                feeToPay,
                                nonce, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no random string');
        });
        it('Test transfer() w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();

                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(owner).populateTransaction['transfer(address,uint256)'](user1.address, randomString, { from: owner.address });
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user1.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no random string');
        });
        it('Test transferFrom() w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();

                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(user1.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);

                let msg;
                try {
                        const inputTransfer = await IP3Token.connect(user1).populateTransaction.transferFrom(owner.address, user2.address, randomString);
                        msg = await TestHelper.checkResult(inputTransfer, IP3Token.address, user1, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }
                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no random string');
        });
        it('Test transfer(w/ signature) w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();

                const feeToPay = 10;
                const nonce = Date.now();

                let msg;
                try {
                        const signature = SignHelper.signTransfer(3, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, randomString, feeToPay, nonce);
                        let input = await IP3Token.connect(owner).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                        owner.address,
                        user1.address,
                        randomString,
                        feeToPay,
                        nonce, 
                        signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no random string');
        });
        it('Test reserve(w/ signature) w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();

                const feeToPay = 10;
                const nonce = Date.now();
                const blockNumber = await provider.blockNumber;
                const expirationBlock = (blockNumber + 2000);

                let msg;
                try {
                        const signature = SignHelper.signReserve(4, network.config.chainId, IP3Token.address, owner.address, owner.privateKey, user1.address, owner.address, randomString, feeToPay, nonce, expirationBlock);
                        let input = await IP3Token.connect(owner).populateTransaction['reserve(address,address,address,uint256,uint256,uint256,uint256,bytes)'](
                                owner.address, 
                                user1.address, 
                                owner.address, 
                                randomString, 
                                feeToPay, 
                                nonce, 
                                expirationBlock, 
                                signature, { from: owner.address });
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }

                expect(await IP3Token.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(originalBalance));
                expect(msg).to.equal('no random string');
        });
        it('Test approve() w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, randomString);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(0));
                expect(msg).to.equal('no random string');
        });
        it('Test increaseAllowance() w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();
                const input = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const inputIncreaseAllowance = await IP3Token.connect(owner).populateTransaction.increaseAllowance(IP3Token.address, randomString);
                        msg = await TestHelper.checkResult(inputIncreaseAllowance, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no random string');
        });
        it('Test decreaseAllowance() w/ random string', async () => {
                var chance = new Chance;
                const randomString = chance.string();
                const inputApprove = await IP3Token.connect(owner).populateTransaction.approve(IP3Token.address, ethers.BigNumber.from(10000));
                await TestHelper.checkResult(inputApprove, IP3Token.address, owner, ethers, provider, 0);
                let msg;
                try {
                        const input = await IP3Token.connect(owner).populateTransaction.decreaseAllowance(IP3Token.address, randomString);
                        msg = await TestHelper.checkResult(input, IP3Token.address, owner, ethers, provider, 0);
                } catch(err) {
                        msg = 'no random string';
                }
                expect(await IP3Token.allowance(owner.address, IP3Token.address)).to.equal(ethers.BigNumber.from(10000));
                expect(msg).to.equal('no random string');
        });
    });
});

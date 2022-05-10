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

describe('IP3Token - Ethless Permit functions', function () {
    before(async () => {
        [provider, owner, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3Token - Regular Ethless Permit', async function () {
        const amountToPermit = 100;
        const amountToTransfer = 80;

        it('Test Ethless Permit', async () => {
            const blockNumber = await provider.getBlockNumber();
            const block = await provider.getBlock(blockNumber);
            const expirationTimestamp = block.timestamp + 20000;
            const nonce = await IP3Token.nonces(owner.address);

            const splitSignature = await SignHelper.signPermit(
                TestHelper.NAME,
                TestHelper.VERSION_712,
                IP3Token.address,
                owner,
                user2.address,
                amountToPermit,
                nonce.toNumber(),
                expirationTimestamp
            );
            const input = await IP3Token.connect(user1).populateTransaction.permit(
                owner.address,
                user2.address,
                amountToPermit,
                expirationTimestamp,
                splitSignature.v,
                splitSignature.r,
                splitSignature.s
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect((await IP3Token.allowance(owner.address, user2.address)).toString()).to.equal(
                amountToPermit.toString()
            );
        });

        it('Test Ethless Permit & transferFrom', async () => {
            const blockNumber = await provider.getBlockNumber();
            const block = await provider.getBlock(blockNumber);
            const expirationTimestamp = block.timestamp + 20000;
            const nonce = await IP3Token.nonces(owner.address);

            const splitSignature = await SignHelper.signPermit(
                TestHelper.NAME,
                TestHelper.VERSION_712,
                IP3Token.address,
                owner,
                user2.address,
                amountToPermit,
                nonce.toNumber(),
                expirationTimestamp
            );
            const input = await IP3Token.connect(user1).populateTransaction.permit(
                owner.address,
                user2.address,
                amountToPermit,
                expirationTimestamp,
                splitSignature.v,
                splitSignature.r,
                splitSignature.s
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect((await IP3Token.allowance(owner.address, user2.address)).toString()).to.equal(
                amountToPermit.toString()
            );

            const originalOwnerBalance = await IP3Token.balanceOf(owner.address);
            const originalUser1Balance = await IP3Token.balanceOf(user1.address);

            const inputTransferFrom = await IP3Token.connect(user2).populateTransaction.transferFrom(
                owner.address,
                user1.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransferFrom, IP3Token.address, user2, ethers, provider, 0);

            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalOwnerBalance).sub(amountToTransfer)
            );
            expect((await IP3Token.balanceOf(user1.address)).toString()).to.equal(
                ethers.BigNumber.from(originalUser1Balance).add(amountToTransfer)
            );
        });
    });

    describe('IP3Token - Test expecting failure Ethless Permit', async function () {
        const amountToPermit = 100;
        const amountToTransfer = 80;

        it('Test Ethless Permit while reusing the same nonce (and signature) on the second permit', async () => {
            const blockNumber = await provider.getBlockNumber();
            const block = await provider.getBlock(blockNumber);
            const expirationTimestamp = block.timestamp + 20000;
            const nonce = await IP3Token.nonces(owner.address);

            const signature = await owner._signTypedData(
                {
                    name: TestHelper.NAME,
                    version: TestHelper.VERSION_712,
                    chainId: network.config.chainId,
                    verifyingContract: IP3Token.address
                },
                {
                    // Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)
                    Permit: [
                        {
                            name: 'owner',
                            type: 'address'
                        },
                        {
                            name: 'spender',
                            type: 'address'
                        },
                        {
                            name: 'value',
                            type: 'uint256'
                        },
                        {
                            name: 'nonce',
                            type: 'uint256'
                        },
                        {
                            name: 'deadline',
                            type: 'uint256'
                        }
                    ]
                },
                {
                    owner: owner.address,
                    spender: user2.address,
                    value: amountToPermit,
                    nonce: nonce,
                    deadline: expirationTimestamp
                }
            );
            const splitSignature = ethers.utils.splitSignature(signature);
            const input = await IP3Token.connect(user1).populateTransaction.permit(
                owner.address,
                user2.address,
                amountToPermit,
                expirationTimestamp,
                splitSignature.v,
                splitSignature.r,
                splitSignature.s
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect((await IP3Token.allowance(owner.address, user2.address)).toString()).to.equal(
                amountToPermit.toString()
            );
            await TestHelper.checkResult(
                input,
                IP3Token.address,
                user3,
                ethers,
                provider,
                'ERC20Permit: invalid signature'
            );
        });

        it('Test Ethless Permit & 2x transferFrom, the second one should fail as it will be higher than the remaining allowance', async () => {
            const blockNumber = await provider.getBlockNumber();
            const block = await provider.getBlock(blockNumber);
            const expirationTimestamp = block.timestamp + 20000;
            const nonce = await IP3Token.nonces(owner.address);

            const signature = await owner._signTypedData(
                {
                    name: TestHelper.NAME,
                    version: TestHelper.VERSION_712,
                    chainId: network.config.chainId,
                    verifyingContract: IP3Token.address
                },
                {
                    // Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)
                    Permit: [
                        {
                            name: 'owner',
                            type: 'address'
                        },
                        {
                            name: 'spender',
                            type: 'address'
                        },
                        {
                            name: 'value',
                            type: 'uint256'
                        },
                        {
                            name: 'nonce',
                            type: 'uint256'
                        },
                        {
                            name: 'deadline',
                            type: 'uint256'
                        }
                    ]
                },
                {
                    owner: owner.address,
                    spender: user2.address,
                    value: amountToPermit,
                    nonce: nonce,
                    deadline: expirationTimestamp
                }
            );
            const splitSignature = ethers.utils.splitSignature(signature);
            const input = await IP3Token.connect(user1).populateTransaction.permit(
                owner.address,
                user2.address,
                amountToPermit,
                expirationTimestamp,
                splitSignature.v,
                splitSignature.r,
                splitSignature.s
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect((await IP3Token.allowance(owner.address, user2.address)).toString()).to.equal(
                amountToPermit.toString()
            );

            const originalOwnerBalance = await IP3Token.balanceOf(owner.address);
            const originalUser1Balance = await IP3Token.balanceOf(user1.address);

            const inputTransferFrom = await IP3Token.connect(user2).populateTransaction.transferFrom(
                owner.address,
                user1.address,
                amountToTransfer
            );
            await TestHelper.checkResult(inputTransferFrom, IP3Token.address, user2, ethers, provider, 0);

            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalOwnerBalance).sub(amountToTransfer)
            );
            expect((await IP3Token.balanceOf(user1.address)).toString()).to.equal(
                ethers.BigNumber.from(originalUser1Balance).add(amountToTransfer)
            );

            const inputTransferFrom2 = await IP3Token.connect(user2).populateTransaction.transferFrom(
                owner.address,
                user1.address,
                amountToTransfer
            );
            await TestHelper.checkResult(
                inputTransferFrom2,
                IP3Token.address,
                user2,
                ethers,
                provider,
                'ERC20: insufficient allowance'
            );
        });
    });
});

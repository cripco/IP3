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
        [provider, owner, ownerKey, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3Token - Regular Ethless Permit', async function () {
        const amountToPermit = 100;

        it('Test Ethless Permit', async () => {
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
            await IP3Token.connect(user1).permit(
                owner.address,
                user2.address,
                amountToPermit,
                expirationTimestamp,
                splitSignature.v,
                splitSignature.r,
                splitSignature.s
            );
            expect((await IP3Token.allowance(owner.address, user2.address)).toString()).to.equal(
                amountToPermit.toString()
            );
        });
    });
});
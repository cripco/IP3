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

describe('IP3Token - Ethless Transfer functions', function () {
    before(async () => {
        [provider, owner, user1, user2, user3] = await TestHelper.setupProviderAndWallet();
    });

    beforeEach(async () => {
        [IP3Token] = await TestHelper.setupContractTesting(owner);
    });

    describe('IP3Token - Regular Ethless Transfer', async function () {
        const amountToTransfer = 100;
        const feeToPay = 10;

        it('Test Ethless transfer', async () => {
            const originalBalance = await IP3Token.balanceOf(owner.address);

            const nonce = Date.now();
            const signature = SignHelper.signTransfer(
                3,
                network.config.chainId,
                IP3Token.address,
                owner.address,
                owner.privateKey,
                user2.address,
                amountToTransfer,
                feeToPay,
                nonce
            );
            const input = await IP3Token.connect(user3).populateTransaction['transfer(address,address,uint256,uint256,uint256,bytes)'](
                owner.address,
                user2.address,
                amountToTransfer,
                feeToPay,
                nonce,
                signature
            );
            await TestHelper.checkResult(input, IP3Token.address, user3, ethers, provider, 0);
            expect(await IP3Token.balanceOf(owner.address)).to.equal(
                ethers.BigNumber.from(originalBalance).sub(amountToTransfer).sub(feeToPay)
            );
            expect(await IP3Token.balanceOf(user2.address)).to.equal(ethers.BigNumber.from(amountToTransfer));
            expect(await IP3Token.balanceOf(user3.address)).to.equal(ethers.BigNumber.from(feeToPay));
        });
    });
});

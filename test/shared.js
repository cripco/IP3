require('dotenv').config({ path: __dirname + '/.env.development' });
const { ethers, network, addressBook } = require('hardhat');
const { expect, use } = require('chai');
const { solidity } = require('ethereum-waffle');
use(solidity);
const DECIMALS = 18;

const NAME = 'IP3';
const SYMBOL = 'IP3';
const TOTALSUPPLY = ethers.utils.parseUnits('300000000000', DECIMALS);
const VERSION = '0.1';
const VERSION_712 = '1';

const STANDARD_MINT_AMOUNT = ethers.utils.parseEther('1000');

let skipInitializeContracts = false;

// LogLevel 0: No logs, 1: Recap of expected rewards, 2: full by block expected rewards math
if (process.env.LOGLEVEL == undefined) process.env.LOGLEVEL = 0;

const setupProviderAndWallet = async () => {
    let provider;
    if (network.name === 'hardhat') {
        provider = ethers.provider;
    } else if (network.name === 'kaleido') {
        const rpcUrl = {
            url: `https://${process.env.RPC_KALEIDO_ENDPOINT}`,
            user: process.env.RPC_KALEIDO_USER,
            password: process.env.RPC_KALEIDO_PASS
        };
        provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    } else {
        provider = new ethers.providers.JsonRpcProvider(network.config.url);
    }
    const owner = new ethers.Wallet(
        ethers.Wallet.fromMnemonic(network.config.accounts.mnemonic, `m/44'/60'/0'/0/0`).privateKey,
        provider
    );
    const user1 = new ethers.Wallet(
        ethers.Wallet.fromMnemonic(network.config.accounts.mnemonic, `m/44'/60'/0'/0/1`).privateKey,
        provider
    );
    const user2 = new ethers.Wallet(
        ethers.Wallet.fromMnemonic(network.config.accounts.mnemonic, `m/44'/60'/0'/0/2`).privateKey,
        provider
    );
    const user3 = new ethers.Wallet(
        ethers.Wallet.fromMnemonic(network.config.accounts.mnemonic, `m/44'/60'/0'/0/3`).privateKey,
        provider
    );
    return [provider, owner, user1, user2, user3];
};

const setupContractTesting = async (ownerAddress) => {
    if (network.name !== 'hardhat') {
        initialBlockGATE = await ethers.provider.getBlockNumber();
    }
    const FactoryIP3Token = await ethers.getContractFactory('IP3Token');
    const FactoryIP3VestingBoard = await ethers.getContractFactory('IP3VestingBoard');
    let IP3Token;
    let IP3VestingBoard;
    if (network.name === 'hardhat') {
        IP3Token = await FactoryIP3Token.deploy();
        IP3VestingBoard = await FactoryIP3VestingBoard.deploy();

        await IP3VestingBoard.initialize(IP3Token.address, NAME, SYMBOL, TOTALSUPPLY);
    } else {
        const IP3TokenAddress = await addressBook.retrieveContract('IP3Token', network.name);
        const IP3VestingBoardAddress = await addressBook.retrieveContract('IP3VestingBoard', network.name);

        IP3Token = await new ethers.Contract(IP3TokenAddress, FactoryIP3Token.interface, ownerAddress);
        IP3VestingBoard = await new ethers.Contract(
            IP3VestingBoardAddress,
            FactoryIP3VestingBoard.interface,
            ownerAddress
        );
        if (!skipInitializeContracts) {
            if ((await IP3VestingBoard.ip3Token()) !== IP3Token.address) {
                await IP3VestingBoard.initialize(IP3Token.address, NAME, SYMBOL, TOTALSUPPLY);
            }
        }
    }

    return [IP3Token, IP3VestingBoard];
};

const txn = async (input, to, sender, ethers, provider) => {
    const txCount = await provider.getTransactionCount(sender.address);
    const rawTx = {
        chainId: network.config.chainId,
        nonce: ethers.utils.hexlify(txCount),
        to: to,
        value: 0x00,
        gasLimit: ethers.utils.hexlify(3000000),
        gasPrice: network.name !== 'kaleido' ? ethers.utils.hexlify(25000000000) : ethers.utils.hexlify(0),
        data: input.data
    };
    const rawTransactionHex = await sender.signTransaction(rawTx);
    const { hash } = await provider.sendTransaction(rawTransactionHex);
    return await provider.waitForTransaction(hash);
};

const checkResult = async (input, to, from, ethers, provider, errMsg) => {
    if (network.name === 'hardhat') {
        if (errMsg) {
            await expect(txn(input, to, from, ethers, provider)).to.be.revertedWith(errMsg);
        } else {
            result = await txn(input, to, from, ethers, provider);
            expect(result.status).to.equal(1);
        }
    } else {
        if (errMsg) {
            result = await txn(input, to, from, ethers, provider);
            expect(result.status).to.equal(0);
        } else {
            result = await txn(input, to, from, ethers, provider);
            expect(result.status).to.equal(1);
        }
    }
};

module.exports = {
    // CONSTANTS
    NAME,
    SYMBOL,
    DECIMALS,
    TOTALSUPPLY,
    VERSION,
    VERSION_712,
    STANDARD_MINT_AMOUNT,
    // FUNCTIONS
    setupProviderAndWallet,
    setupContractTesting,
    txn,
    checkResult
};

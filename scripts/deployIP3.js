const { ethers, network, upgrades, addressBook } = require('hardhat');
const ScriptHelper = require('./helper');
const TestHelper = require('../test/shared');
const owner = "0x7B17116c5C56264a70B956FEC54E3a3736e08Af0";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log('\x1b[32m%s\x1b[0m', 'Connected to network: ', network.name);
    console.log('\x1b[32m%s\x1b[0m', 'Account address: ', deployer.address);
    console.log('\x1b[32m%s\x1b[0m', 'Account balance: ', (await deployer.getBalance()).toString());

    // Contract deployed with transparent proxy
    const UpgradeableIP3Token = await ethers.getContractFactory('IP3Token');
    const upgradeableIP3Token = await upgrades.deployProxy(UpgradeableIP3Token, [
        owner,
        TestHelper.NAME,
        TestHelper.SYMBOL,
        TestHelper.TOTALSUPPLY
    ]);
    await upgradeableIP3Token.deployed();
    addressBook.saveContract(
        'UpgradeableIP3Token',
        upgradeableIP3Token.address,
        network.name,
        deployer.address,
        upgradeableIP3Token.blockHash,
        upgradeableIP3Token.blockNumber
    );
    console.log(
        '\x1b[32m%s\x1b[0m',
        'UpgradeableIP3Token deployed at address: ',
        upgradeableIP3Token.address
    );

    // Get ProxyAdmin address from .openzeppelin/
    const ProxyAdmin_Address = await addressBook.retrieveOZAdminProxyContract(network.config.chainId);
    console.log('Deployed using Proxy Admin contract address: ', ProxyAdmin_Address);
    addressBook.saveContract('ProxyAdmin', ProxyAdmin_Address, network.name, deployer.address);
    console.log('\x1b[32m%s\x1b[0m', 'Account balance: ', (await deployer.getBalance()).toString());

    // Get Logic/Implementation address from proxy admin contract
    const LogicIP3Token = await ScriptHelper.getImplementation(
        upgradeableIP3Token.address,
        ProxyAdmin_Address,
        deployer,
        ethers
    );
    console.log('Deployed using Logic/Implementation contract address: ', LogicIP3Token);
    addressBook.saveContract('LogicIP3Token', LogicIP3Token, network.name, deployer.address);
    console.log('\x1b[32m%s\x1b[0m', 'Account balance: ', (await deployer.getBalance()).toString());

    console.log('Contract deployed!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

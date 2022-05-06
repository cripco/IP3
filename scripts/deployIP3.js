const { ethers, network, upgrades, addressBook } = require('hardhat');
const ScriptHelper = require('./helper');
const TestHelper = require('../test/shared');

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log('\x1b[32m%s\x1b[0m', 'Connected to network: ', network.name);
    console.log('\x1b[32m%s\x1b[0m', 'Account address: ', deployer.address);
    console.log('\x1b[32m%s\x1b[0m', 'Account balance: ', (await deployer.getBalance()).toString());

    // Contract deployed with transparent proxy
    const UpgradeableIP3Token = await ethers.getContractFactory('IP3Token');
    const upgradeableIP3Token = await upgrades.deployProxy(UpgradeableIP3Token, [
        owner.address, 
        TestHelper.NAME, 
        TestHelper.SYMBOL, 
        TestHelper.TOTALSUPPLY
    ]);
    await upgradeableIP3Token.deployed();
    addressBook.saveContract(
        'UpgradeableIP3Token',
        upgradeableIP3Token.address,
        network.name,
        deployer.address
    );
    console.log(
        '\x1b[32m%s\x1b[0m',
        'UpgradeableIP3Token deployed at address: ',
        upgradeableIP3Token.address
    );

    console.log('Contract deployed!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

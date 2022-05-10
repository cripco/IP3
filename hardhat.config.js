require('dotenv').config({path:__dirname+'/.env.development'});
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require("hardhat-awesome-cli");
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  networks:{
    hardhat: {
      allowUnlimitedContractSize: true,
      gas: 72_000_000,
      blockGasLimit: 72_000_000,
      gasPrice: 2000,
      initialBaseFeePerGas: 1
    },
    rinkeby:{
      url: `${process.env.RPC_RINKEBY}`,
      chainId: 4,
      gas: "auto",
      gasPrice: 8000000000,
      accounts: {
        mnemonic: `${process.env.RINKEBY_MNEMONIC}`,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: ""
      }
    },
    mumbai: {
      url: `${process.env.RPC_POLYGONMUMBAI}`,
      chainId: 80001,
      accounts: {
        mnemonic: `${process.env.POLYGONMUMBAI_MNEMONIC}`,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: ""
      }
    },
    kaleido: {
      url:  `https://${process.env.RPC_KALEIDO_USER}:${process.env.RPC_KALEIDO_PASS}@${process.env.RPC_KALEIDO_ENDPOINT}`,
      chainId: 1952923003,
      accounts: {
        mnemonic: `${process.env.KALEIDO_MNEMONIC}`,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10,
        passphrase: ""
      }
    },
  },
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        runs:200,
        enabled: true
      }
    }
  },
  mocha: {
    timeout: 2000000
  },
};

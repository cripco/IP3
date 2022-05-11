var fs = require('fs');
const proxyContractsABI = require('./proxyContractsABI');

const getImplementation = async (transparentProxyAddres, proxyAdminAddress, owner, ethers) => {
    const ProxyAdmin = await new ethers.Contract(proxyAdminAddress, proxyContractsABI.ProxyAdmin, owner);
    return await ProxyAdmin.getProxyImplementation(transparentProxyAddres);
}

async function upgradeContract(implement, transparentProxyAddres, proxyAdminAddress, owner,ethers) {
    const ProxyAdmin = await new ethers.Contract(proxyAdminAddress, proxyContractsABI.ProxyAdmin, owner);
    await ProxyAdmin.upgrade(transparentProxyAddres, implement, { from: owner.address, gasLimit: ethers.utils.hexlify(3000000) });
    console.log('\x1b[32m%s\x1b[0m', `
    .d8888b.  .d88888b. 888b    888888888888888888888b.        d8888 .d8888b.88888888888888     8888888888b. 8888888b.        d88888888888888888888888888888888b.  
    d88P  Y88bd88P" "Y88b8888b   888    888    888   Y88b      d88888d88P  Y88b   888    888     888888   Y88b888  "Y88b      d88888    888    888       888  "Y88b 
    888    888888     88888888b  888    888    888    888     d88P888888    888   888    888     888888    888888    888     d88P888    888    888       888    888 
    888       888     888888Y88b 888    888    888   d88P    d88P 888888          888    888     888888   d88P888    888    d88P 888    888    8888888   888    888 
    888       888     888888 Y88b888    888    8888888P"    d88P  888888          888    888     8888888888P" 888    888   d88P  888    888    888       888    888 
    888    888888     888888  Y88888    888    888 T88b    d88P   888888    888   888    888     888888       888    888  d88P   888    888    888       888    888 
    Y88b  d88PY88b. .d88P888   Y8888    888    888  T88b  d8888888888Y88b  d88P   888    Y88b. .d88P888       888  .d88P d8888888888    888    888       888  .d88P 
        "Y8888P"  "Y88888P" 888    Y888    888    888   T88bd88P     888 "Y8888P"    888     "Y88888P" 888       8888888P" d88P     888    888    88888888888888888P"  
    `);
    contract =  await new ethers.Contract(transparentProxyAddres, proxyContractsABI.Token, owner);
    return contract;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  getImplementation,
  upgradeContract,
  delay
}
const { ethers, network } = require('hardhat');
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider);

module.exports = {
    signBurn: function (domain, chainId, contractAddress, sourceAddress, sourcePrivateKey, amount, fee, nonce) {
        var hash = web3.utils.soliditySha3(
            { t: 'uint8', v: domain },
            { t: 'uint256', v: chainId },
            { t: 'address', v: contractAddress },
            { t: 'address', v: sourceAddress },
            { t: 'uint256', v: amount },
            { t: 'uint256', v: fee },
            { t: 'uint256', v: nonce }
        );

        var obj = web3.eth.accounts.sign(hash, sourcePrivateKey);
        var signature = obj.signature;
        return signature;
    },
    signTransfer: function (
        domain,
        chainId,
        contractAddress,
        sourceAddress,
        sourcePrivateKey,
        recipientAddress,
        amount,
        fee,
        nonce
    ) {
        var hash = web3.utils.soliditySha3(
            { t: 'uint8', v: domain },
            { t: 'uint256', v: chainId },
            { t: 'address', v: contractAddress },
            { t: 'address', v: sourceAddress },
            { t: 'address', v: recipientAddress },
            { t: 'uint256', v: amount },
            { t: 'uint256', v: fee },
            { t: 'uint256', v: nonce }
        );

        var obj = web3.eth.accounts.sign(hash, sourcePrivateKey);
        var signature = obj.signature;
        return signature;
    },
    signReserve: function (
        domain,
        chainId,
        contractAddress,
        sourceAddress,
        sourcePrivateKey,
        targetAddress,
        executorAddress,
        amount,
        fee,
        nonce,
        expiryBlockNum
    ) {
        var hash = web3.utils.soliditySha3(
            { t: 'uint8', v: domain },
            { t: 'uint256', v: chainId },
            { t: 'address', v: contractAddress },
            { t: 'address', v: sourceAddress },
            { t: 'address', v: targetAddress },
            { t: 'address', v: executorAddress },
            { t: 'uint256', v: amount },
            { t: 'uint256', v: fee },
            { t: 'uint256', v: nonce },
            { t: 'uint256', v: expiryBlockNum }
        );

        var obj = web3.eth.accounts.sign(hash, sourcePrivateKey);
        var signature = obj.signature;

        return signature;
    },
    signPermit: async function (
        name,
        version,
        contractAddress,
        wallet,
        targetAddress,
        amount,
        nonce,
        expirationTimestamp
    ) {
        const signature = await wallet._signTypedData(
            {
                name,
                version,
                chainId: network.config.chainId,
                verifyingContract: contractAddress
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
                owner: wallet.address,
                spender: targetAddress,
                value: amount,
                nonce,
                deadline: expirationTimestamp
            }
        );
        return ethers.utils.splitSignature(signature);
    }
};

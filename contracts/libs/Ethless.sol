// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title Ethless
 */

import "./Reservable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract Ethless is Reservable {
    using ECDSAUpgradeable for bytes32;

    enum EthlessTxnType {
        NONE,       // 0
        TRANSFER,   // 1
        BURN,       // 2
        RESERVE     // 3
    }
    
    mapping (address => mapping (uint256 => EthlessTxnType)) private _nonceUsed;

    function __Ethless_init_unchained() internal onlyInitializing {
        __Reservable_init_unchained();
    }
    
    function _useNonce(address signer_, uint256 nonce_, EthlessTxnType txnType_) internal {
        require(_nonceUsed[signer_][nonce_] == EthlessTxnType.NONE, "Ethless: nonce already used");
        _nonceUsed[signer_][nonce_] = txnType_;
    }

    function _validateEthlessHash(address signer_, bytes32 structHash_, bytes memory signature_) internal pure {
        bytes32 messageHash = structHash_.toEthSignedMessageHash();
        address signer = messageHash.recover(signature_);
        require(signer == signer_, "Ethless: invalid signature");
    }

    function transfer(
        address signer_,
        address to_,
        uint256 amount_,
        uint256 fee_,
        uint256 deadline_,
        uint256 nonce_,
        bytes memory signature_
    ) external returns (bool succcess) {
        _useNonce(signer_, nonce_, EthlessTxnType.TRANSFER);

        uint256 total = amount_;
        unchecked {
            total += fee_;
        }
        // Verify balance - reserved balance
        _beforeTokenTransfer(signer_, to_, total);

        bytes32 structHash = keccak256(
            abi.encodePacked(
                EthlessTxnType.TRANSFER,
                block.chainid,
                address(this),
                signer_, 
                to_, 
                amount_, 
                deadline_,
                nonce_));
        _validateEthlessHash(signer_, structHash, signature_);

        if(fee_ > 0)
            _transfer(signer_, _msgSender(), fee_);
        _transfer(signer_, to_, amount_);
        return true;
    }

    function burn(
        address signer_,
        uint256 amount_,
        uint256 fee_,
        uint256 deadline_,
        uint256 nonce_,
        bytes memory signature_
    ) external returns (bool succcess) {
        _useNonce(signer_, nonce_, EthlessTxnType.TRANSFER);

        uint256 total = amount_;
        unchecked {
            total += fee_;
        }

        bytes32 structHash = keccak256(
            abi.encodePacked(
                EthlessTxnType.BURN,
                block.chainid,
                address(this),
                signer_, 
                amount_, 
                deadline_,
                nonce_));
        _validateEthlessHash(signer_, structHash, signature_);

        if(fee_ > 0)
            _transfer(signer_, _msgSender(), fee_);
        _burn(signer_, amount_ - fee_);
        return true;
    }

    function reserve(
        address signer_,
        address to_,
        address executor_,
        uint256 amount_,
        uint256 fee_,
        uint256 executionFee_,
        uint256 deadline_,
        uint256 nonce_,
        bytes memory signature_
    ) external returns (bool succcess) {
        _useNonce(signer_, nonce_, EthlessTxnType.TRANSFER);

        uint256 total = amount_;
        unchecked {
            total += fee_;
        }
        // Verify balance - reserved balance
        _beforeTokenTransfer(signer_, to_, total);

        bytes32 structHash = keccak256(
            abi.encodePacked(
                EthlessTxnType.RESERVE,
                block.chainid,
                address(this),
                signer_, 
                to_,
                executor_, 
                amount_, 
                fee_,
                executionFee_,
                deadline_,
                nonce_));
        _validateEthlessHash(signer_, structHash, signature_);

        if(fee_ > 0)
            _transfer(signer_, _msgSender(), fee_);
        _reserve(signer_, to_, executor_, amount_, executionFee_, deadline_);
        return true;
    }
    
    function balanceOf(address account) public override(Reservable) view virtual returns (uint256 amount) {
        return super.balanceOf(account);
    }
    
    uint256[50] private __gap;
}
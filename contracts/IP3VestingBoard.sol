// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title IP3VestingBoard
 */

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./libs/VestingWallet.sol";
import "./interface/IIP3Token.sol";
import "hardhat/console.sol";

contract IP3VestingBoard is AccessControlUpgradeable {

    address public ip3Token;
    uint256 public ip3TokenTotalSupply;
    uint256 public ip3TokenAllocated;

    uint16 public vestingWalletsId;
    mapping (uint16 => VestingWallet) public vestingWallets;
    mapping (address => uint16) public vestingWalletsByBeneficiary;

    function initialize(address IP3Token_, string memory name_, string memory symbol_, uint256 totalSupply_) external initializer {
        __AccessControl_init_unchained();
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        
        ip3TokenTotalSupply = totalSupply_;
        ip3Token = IP3Token_;
        IIP3Token(ip3Token).initialize(address(this), name_, symbol_, totalSupply_);
    }

    function _createVestingWallet(
        address beneficiaryAddress_,
        uint64 startTimestamp_,
        uint64 durationSeconds_,
        uint256 tokenAllocation_
    ) internal {
        require(ip3TokenTotalSupply >= ip3TokenAllocated + tokenAllocation_, "IP3VestingBoard: Not enough IP3 tokens to allocate to the vesting wallet");
        ++vestingWalletsId;
        ip3TokenAllocated += tokenAllocation_;

        VestingWallet newVestingWallet;
        newVestingWallet = new VestingWallet();
        vestingWallets[vestingWalletsId] = newVestingWallet;
        vestingWalletsByBeneficiary[beneficiaryAddress_] = vestingWalletsId;

        newVestingWallet.initialize(
            beneficiaryAddress_, 
            startTimestamp_,
            durationSeconds_
        );
        IIP3Token(ip3Token).transfer(address(vestingWallets[vestingWalletsId]), tokenAllocation_);
    }

    function createVestingWallet(
        address beneficiaryAddress_,
        uint64 startTimestamp_,
        uint64 durationSeconds_,
        uint256 tokenAllocation_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _createVestingWallet(
            beneficiaryAddress_,
            startTimestamp_,
            durationSeconds_,
            tokenAllocation_
        );
    }

    function createVestingWalletBatch(
        address[] calldata beneficiaryAddress_,
        uint64 startTimestamp_,
        uint64[] calldata durationSeconds_,
        uint256[] calldata tokenAllocation_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(beneficiaryAddress_.length == durationSeconds_.length && durationSeconds_.length == tokenAllocation_.length, "IP3VestingBoard: length of arrays must be equal");
        uint256 length = beneficiaryAddress_.length;
        for(uint256 i = 0; i < length;) {
            _createVestingWallet(
                beneficiaryAddress_[i],
                startTimestamp_,
                durationSeconds_[i],
                tokenAllocation_[i]
            );
            unchecked {
                ++i;
            }
        }
    }

    function getVestingWalletAddress(uint16 vestingWalletsId_) external view returns (address) {
        require(vestingWalletsId_ <= vestingWalletsId, "IP3VestingBoard: Vesting wallet id is out of range");
        return address(vestingWallets[vestingWalletsId_]);
    }

    function _getVestingWalletByBeneficiary(address beneficiaryAddress_) internal view returns (uint256, uint256, uint256) {
        uint16 getVestingWalletsId = vestingWalletsByBeneficiary[beneficiaryAddress_];
        return (
            start(getVestingWalletsId),
            duration(getVestingWalletsId),
            released(getVestingWalletsId)
        );
    }

    function getVestingWalletByBeneficiary(address beneficiaryAddress_) external view returns (uint256, uint256, uint256) {
        return _getVestingWalletByBeneficiary(beneficiaryAddress_);
    }

    function getMyVestingWalletByBeneficiary() external view returns (uint256, uint256, uint256) {
        return _getVestingWalletByBeneficiary(_msgSender());
    }

    function beneficiary(uint16 vestingWalletsId_) public view virtual returns (address) {
        return vestingWallets[vestingWalletsId_].beneficiary();
    }

    function start(uint16 vestingWalletsId_) public view virtual returns (uint256) {
        return vestingWallets[vestingWalletsId_].start();
    }

    function duration(uint16 vestingWalletsId_) public view virtual returns (uint256) {
        return vestingWallets[vestingWalletsId_].duration();
    }

    function released(uint16 vestingWalletsId_) public view virtual returns (uint256) {
        return vestingWallets[vestingWalletsId_].released(ip3Token);
    }

    function release(uint16 vestingWalletsId_) public virtual {
        return vestingWallets[vestingWalletsId_].release(ip3Token);
    }

    function vestedAmount(uint16 vestingWalletsId_, uint64 timestamp) public view virtual returns (uint256) {
        return vestingWallets[vestingWalletsId_].vestedAmount(ip3Token, timestamp);}

    function transferToken(address to_, uint256 amount_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ip3TokenTotalSupply >= ip3TokenAllocated + amount_, "IP3VestingBoard: Not enough IP3 tokens left in the contract");
        ip3TokenAllocated += amount_;
        IIP3Token(ip3Token).transfer(to_, amount_);
    }

    function mintToken(address to_, uint256 amount_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        ip3TokenTotalSupply += amount_;
        IIP3Token(ip3Token).mint(to_, amount_);
    }

    function burnToken(uint256 amount_) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ip3TokenTotalSupply - ip3TokenAllocated >= amount_, "IP3VestingBoard: Not enough IP3 tokens left in the contract");
        ip3TokenTotalSupply -= amount_;
        IIP3Token(ip3Token).burn(amount_);
    }

    function burnAllRemainingToken() public onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 amount = IIP3Token(ip3Token).balanceOf(address(this));
        ip3TokenTotalSupply -= amount;
        IIP3Token(ip3Token).burn(amount);
    }
    
    function addAdmin(address newAdmin_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IIP3Token(ip3Token).grantRole(DEFAULT_ADMIN_ROLE, newAdmin_);
    }

    uint256[50] private __gap;
}
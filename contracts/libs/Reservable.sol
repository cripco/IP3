// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title Reservable
 */

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract Reservable is ERC20Upgradeable {

    enum ReservationStatus {
        Active,     // 0
        Reclaimed,  // 1
        Completed   // 2
    }

    struct Reservation {
        uint256 amount;
        uint256 fee;
        address recipient;
        address executor;
        uint256 expiryBlockNum;
        ReservationStatus status;
    }

    // Total balance of all active reservations per address
    mapping (address => uint256) private _totalReserved;

    // Reservation count per address
    mapping (address => uint128) private _reservationCount;

    // Mapping of all reservations per address and nonces
    mapping (address => mapping(uint256 => Reservation)) internal _reservation;

    function __Reservable_init_unchained(address owner_) internal onlyInitializing {
    }

    function _reserve(
        address from_,
        address to_,
        address executor_,
        uint256 amount_,
        uint256 executionFee_,
        uint256 deadline_
    ) internal {
        ++_reservationCount[from_];
        uint256 total = amount_;
        unchecked {
            total += executionFee_;
        }
        _reservation[from_][_reservationCount[from_]] = Reservation(
            amount_, 
            executionFee_, 
            to_, 
            executor_, 
            deadline_, 
            ReservationStatus.Active);
        _totalReserved[from_] += total;
    }

    function reserve(
        address from_,
        address to_,
        address executor_,
        uint256 amount_,
        uint256 executionFee_,
        uint256 deadline_
    ) external returns (bool success) {
        _reserve(from_, to_, executor_, amount_, executionFee_, deadline_);
        return true;
    }

    function reserveOf(address account_) external view returns (uint256 count) {
        return _totalReserved[account_];
    }

    function getReservation(address account_, uint256 nonce_) external view returns (Reservation memory) {
        return _reservation[account_][nonce_];
    }

    function getReservationCount(address account_) external view returns (uint256 count) {
        return _reservationCount[account_];
    }

    function _execute(address from_, Reservation storage reservation) internal returns (bool success) {
        require(reservation.expiryBlockNum != 0, "Reservable: reservation does not exist");
        require(reservation.executor == _msgSender() || from_ == _msgSender(),
            "Reservable: this address is not authorized to execute this reservation");
        require(reservation.expiryBlockNum > block.number,
            "Reservable: reservation has expired and cannot be executed");
        require(reservation.status == ReservationStatus.Active,
            "Reservable: invalid reservation status to execute");
        
        uint256 fee = reservation.fee;
        uint256 amount = reservation.amount;
        address recipient = reservation.recipient;
        address executor = reservation.executor;

        reservation.status = ReservationStatus.Completed;
        unchecked {
            _totalReserved[from_] -= amount + fee;
        }

        _transfer(from_, executor, fee);
        _transfer(from_, recipient, amount);
        return true;
    }

    function execute(address from_, uint256 reservationId_) public returns (bool success) {
        Reservation storage reservation = _reservation[from_][reservationId_];
        _execute(from_, reservation);
        return true;
    }

    function reclaim(address from_, uint256 reservationId_) external returns (bool success) {
        Reservation storage reservation = _reservation[from_][reservationId_];
        address executor = reservation.executor;

        require(reservation.expiryBlockNum != 0, "Reservable: reservation does not exist");
        require(reservation.status == ReservationStatus.Active,
            "Reservable: invalid reservation status to reclaim");
        if (_msgSender() != executor) {
            require(_msgSender() == from_,
                "Reservable: only the sender or the executor can reclaim the reservation back to the sender");
            require(reservation.expiryBlockNum <= block.number,
                "Reservable: reservation has not expired or you are not the executor and cannot be reclaimed");
        }

        reservation.status = ReservationStatus.Reclaimed;
        unchecked {
            _totalReserved[from_] -= reservation.amount + reservation.fee;
        }

        return true;
    }
    
    uint256[50] private __gap;
}
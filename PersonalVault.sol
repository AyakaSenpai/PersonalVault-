// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PersonalVault
 * @dev A time-locked personal savings vault on Ethereum
 * Users can deposit ETH and lock it until a specific time,
 * with the ability to extend (but not reduce) the lock period.
 */
contract PersonalVault {
    // ==================== State Variables ====================
    address public owner;
    uint256 public unlockTime;

    // ==================== Events ====================
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(uint256 amount, uint256 timestamp);
    event LockExtended(uint256 newUnlockTime);

    // ==================== Custom Errors ====================
    error FundsLocked();
    error NotOwner();
    error InvalidUnlockTime();

    // ==================== Modifiers ====================
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ==================== Constructor ====================
    /**
     * @dev Initialize the vault with owner and unlock time
     * @param _unlockTime The timestamp when funds become withdrawable
     */
    constructor(uint256 _unlockTime) payable {
        if (_unlockTime <= block.timestamp) {
            revert InvalidUnlockTime();
        }
        owner = msg.sender;
        unlockTime = _unlockTime;

        // If ETH sent with constructor, emit deposit event
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }

    // ==================== Core Functions ====================

    /**
     * @dev Deposit ETH into the vault
     * Only the owner can deposit
     */
    function deposit() external payable onlyOwner {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw all funds from the vault after unlock time
     * Requirements:
     * - Current time must be >= unlockTime
     * - Caller must be the owner
     * - Contract must have balance > 0
     */
    function withdraw() external onlyOwner {
        // Checks: Verify conditions before state changes
        if (block.timestamp < unlockTime) {
            revert FundsLocked();
        }

        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // Effects: Update state
        uint256 withdrawalTime = block.timestamp;

        // Interactions: Transfer funds (last)
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(balance, withdrawalTime);
    }

    /**
     * @dev Extend the lock period to a new time
     * Can only extend, never reduce the lock time
     * @param newUnlockTime The new unlock timestamp (must be > current unlockTime)
     */
    function extendLock(uint256 newUnlockTime) external onlyOwner {
        // Validate new unlock time
        if (newUnlockTime <= unlockTime) {
            revert InvalidUnlockTime();
        }

        if (newUnlockTime <= block.timestamp) {
            revert InvalidUnlockTime();
        }

        // Update unlock time
        unlockTime = newUnlockTime;

        emit LockExtended(newUnlockTime);
    }

    // ==================== View Functions ====================

    /**
     * @dev Get contract balance
     * @return Current ETH balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Check if funds are currently locked
     * @return true if current time < unlockTime, false otherwise
     */
    function isFundsLocked() external view returns (bool) {
        return block.timestamp < unlockTime;
    }

    /**
     * @dev Get remaining time until unlock (in seconds)
     * @return Time remaining in seconds, or 0 if already unlocked
     */
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= unlockTime) {
            return 0;
        }
        return unlockTime - block.timestamp;
    }

    // ==================== Fallback ====================
    /**
     * @dev Allow receiving ETH without calling deposit()
     * Only owner can send funds this way
     */
    receive() external payable onlyOwner {
        emit Deposit(msg.sender, msg.value);
    }
}

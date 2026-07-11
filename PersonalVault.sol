// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PersonalVault {
    address public owner;
    uint256 public unlockTime;
    
    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(uint256 amount, uint256 timestamp);
    event LockExtended(uint256 newUnlockTime);
    
    error FundsLocked();
    error NotOwner();
    error InvalidUnlockTime();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    
    constructor(uint256 _unlockTime) payable {
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        owner = msg.sender;
        unlockTime = _unlockTime;
    }
    
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw() public onlyOwner {
        if (block.timestamp < unlockTime) {
            revert FundsLocked();
        }
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(balance, block.timestamp);
    }
    
    function extendLock(uint256 newUnlockTime) public onlyOwner {
        if (newUnlockTime <= unlockTime) {
            revert InvalidUnlockTime();
        }
        unlockTime = newUnlockTime;
        emit LockExtended(newUnlockTime);
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

# Personal Vault Smart Contract

A time-locked personal savings vault on Ethereum where users can lock their ETH for a specific period.

## Features
- Lock ETH until a predetermined unlock time
- Only owner can withdraw after unlock time expires
- Extend lock period (cannot shorten)
- Emit events for all state changes
- Custom errors for gas efficiency

## Contract Functions

### `deposit()`
Add ETH to the vault. Any amount > 0 accepted.

### `withdraw()`
Retrieve all funds from vault. Only callable by owner after unlock time.

### `extendLock(uint256 newUnlockTime)`
Extend the lock period. New time must be greater than current unlock time.

### `getBalance()`
Check current vault balance.

## How to Deploy

1. Compile with Solidity 0.8.0+
2. Deploy with constructor parameter `_unlockTime` (Unix timestamp)
3. Done!

## Example

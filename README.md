# Personal Vault Smart Contract

A time-locked personal savings vault on Ethereum where users can lock their ETH for a specific period.

## Features
- **Time-Locked Security**: Users can lock their ETH until a predetermined unlock time.
- **Access Control**: Only the owner can withdraw or extend the lock period.
- **Gas Efficiency**: Implements Custom Errors for all validation checks to optimize gas usage.
- **Event Logging**: Emits events for all critical state changes (Deposit, Withdrawal, Lock Extension).

## Contract Functions

### `deposit()`
Adds ETH to the vault. Any amount > 0 is accepted. Only the owner can call this.

### `withdraw()`
Retrieves all funds from the vault. Only callable by the owner after the unlock time has passed.

### `extendLock(uint256 newUnlockTime)`
Extends the lock period. The `newUnlockTime` must be greater than the current unlock time.

### `getBalance()`
Checks the current ETH balance of the vault.

## Technical Specifications
- **Solidity Version**: 0.8.24
- **License**: MIT

## How to Deploy
1. **Compile**: Use Solidity compiler version `0.8.24`.
2. **Deploy**: Deploy the contract with the `_unlockTime` (timestamp) as a constructor parameter.
3. **Interact**: Once deployed, the owner can use the `deposit`, `withdraw`, and `extendLock` functions.

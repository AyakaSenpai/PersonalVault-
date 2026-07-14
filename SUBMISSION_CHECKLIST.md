# PersonalVault Submission Checklist untuk Mancer

## File Structure
- [ ] `PersonalVault.sol` - Smart contract code
- [ ] `DEPLOYMENT_GUIDE.md` - Deployment instructions
- [ ] `README.md` - Updated dengan deployment info
- [ ] `PersonalVault.test.js` - Test file (optional tapi recommended)

---

## Deployment & Testing Checklist

### 1. Deploy Contract
- [ ] Get testnet ETH dari https://sepoliafaucet.com/
- [ ] Compile di Remix IDE
- [ ] Deploy ke Sepolia testnet
- [ ] **Copy & save contract address**
  - Format: `0x...` (42 characters)

### 2. Test Case 1: Deposit
- [ ] Call `deposit()` dengan 1 ETH
- [ ] Transaksi sukses
- [ ] **Save transaction hash**: `0xdeposit...`
- [ ] Event `Deposit` emitted dengan amount 1 ETH

### 3. Test Case 2: Early Withdrawal (Should Fail)
- [ ] Call `withdraw()` SEBELUM unlock time
- [ ] Transaksi **revert** dengan error `FundsLocked()`
- [ ] **Screenshot error message** atau save txn hash failed attempt
- [ ] **Save failed transaction hash**: `0xfailed_withdraw...`

### 4. Test Case 3: Extend Lock
- [ ] Call `extendLock(newTime)` dengan time 20 minutes dari sekarang
- [ ] Transaksi sukses
- [ ] Event `LockExtended` emitted

### 5. Test Case 4: Successful Withdrawal
- [ ] **Wait until unlock time** (atau fast-forward di testnet)
- [ ] Call `withdraw()` SETELAH unlock time
- [ ] Transaksi sukses ✓
- [ ] Receive ETH ke wallet
- [ ] **Save successful transaction hash**: `0xsuccess_withdraw...`

---

## Etherscan Verification

### Step 1: Verify Contract
- [ ] Go to https://sepolia.etherscan.io/
- [ ] Search contract address kamu
- [ ] Click "Verify and Publish"
- [ ] Fill form:
  - Compiler: 0.8.0+
  - Optimization: No
  - Paste PersonalVault.sol source
- [ ] Submit

### Step 2: Confirm Verification
- [ ] Status berubah ke "Verified" ✓
- [ ] Source code terbaca di Etherscan
- [ ] **Copy Etherscan link**: `https://sepolia.etherscan.io/address/0x...#code`

---

## Update GitHub Repository

### Step 1: Push Smart Contract
```bash
# Navigate to repo directory
cd /path/to/PersonalVault-

# Add files
git add PersonalVault.sol
git add PersonalVault.test.js

# Commit
git commit -m "Add PersonalVault smart contract with tests"

# Push
git push origin main
```

### Step 2: Update README.md
Update dengan info deployment:

```markdown
# Personal Vault Smart Contract

A time-locked personal savings vault on Ethereum.

## Deployment Details

### Sepolia Testnet
- **Contract Address**: 0x...
- **Etherscan Verification**: https://sepolia.etherscan.io/address/0x...#code
- **Deployment Date**: [tanggal]

### Test Transactions
- **Deposit Transaction**: 0x...
- **Failed Withdrawal (Early)**: 0x...
- **Successful Withdrawal**: 0x...

## Features
- Deposit ETH into vault
- Lock funds until specific timestamp
- Prevent withdrawals before unlock time
- Extend (but never reduce) lock period
- Owner-only access

## Testing
Run test suite:
```bash
npx hardhat test
```

## Files
- `PersonalVault.sol` - Main contract code
- `PersonalVault.test.js` - Hardhat test suite
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
```

### Step 3: Commit & Push README Update
```bash
git add README.md
git commit -m "Update README with deployment and test info"
git push origin main
```

---

## Data untuk Mancer Submission

Kumpulkan ini sebelum submit ke Mancer:

### Required Info
```
Contract Address:
0x________________

Etherscan Verification Link:
https://sepolia.etherscan.io/address/0x________________#code

Test Transaction 1 (Deposit):
0x________________

Test Transaction 2 (Failed Early Withdrawal):
0x________________

Test Transaction 3 (Successful Withdrawal):
0x________________

GitHub Repository URL:
https://github.com/AyakaSenpai/PersonalVault-
```

---

## Final Submission

### Before Submitting:
- [ ] Contract deployed ke Sepolia
- [ ] Contract verified di Etherscan ✓
- [ ] Semua 3 test cases selesai
- [ ] Transaction hashes tercatat
- [ ] GitHub updated dengan latest code
- [ ] README updated dengan deployment info
- [ ] Branch `main` ter-push dengan semua changes

### Submit ke Mancer:
1. Go to https://nest.mancer.work/
2. Open "Final Test your fundamental" challenge
3. Paste GitHub URL:
   ```
   https://github.com/AyakaSenpai/PersonalVault-
   ```
4. Click "Check Repository"
5. Tunggu review selesai

---

## Troubleshooting Quick Ref

| Issue | Solution |
|-------|----------|
| "Invalid Unlock Time" error | Ensure _unlockTime > current block.timestamp |
| "FundsLocked()" error (expected) | Means contract working correctly - funds still locked |
| MetaMask won't connect | Refresh Remix, disconnect & reconnect wallet |
| Verification fails | Check compiler version matches, paste full source |
| Transaction fails in withdraw | Likely still before unlock time, wait more |
| Can't extend lock shorter | Working correctly - extendLock only allows increasing time |

---

## Success Criteria (dari Mancer)

✅ Accept ETH deposits from owner
✅ Store unlock time (cannot be shortened)
✅ Prevent withdrawals before unlock time
✅ Allow only owner to withdraw after unlock
✅ Allow owner to extend (not reduce) lock time
✅ Emit proper events for all actions
✅ Use custom errors (gas efficient)
✅ Contract deployed & verified on Sepolia
✅ Test transactions included

Once all above done → Submit & wait for review! 🚀

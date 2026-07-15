// Test suite untuk PersonalVault smart contract
// Run dengan: npx hardhat test

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PersonalVault", function () {
  let vault;
  let owner;
  let otherAccount;
  let unlockTime;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();

    // Set unlock time to 1 hour from now
    const latestBlockTime = await time.latest();
    unlockTime = latestBlockTime + 3600; // +1 hour

    // Deploy contract
    const PersonalVault = await ethers.getContractFactory("PersonalVault");
    vault = await PersonalVault.connect(owner).deploy(unlockTime);
    await vault.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should set the unlock time correctly", async function () {
      expect(await vault.unlockTime()).to.equal(unlockTime);
    });

    it("Should revert if unlock time is in the past", async function () {
      const latestBlockTime = await time.latest();
      const pastTime = latestBlockTime - 100;

      const PersonalVault = await ethers.getContractFactory("PersonalVault");
      await expect(
        PersonalVault.connect(owner).deploy(pastTime)
      ).to.be.revertedWithCustomError(PersonalVault, "InvalidUnlockTime");
    });
  });

  describe("Deposit", function () {
    it("Should accept ETH deposits from owner", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");

      await expect(
        owner.sendTransaction({
          to: vault.address,
          value: depositAmount,
        })
      )
        .to.emit(vault, "Deposit")
        .withArgs(owner.address, depositAmount);

      expect(await vault.getBalance()).to.equal(depositAmount);
    });

    it("Should accept ETH via deposit() function", async function () {
      const depositAmount = ethers.utils.parseEther("2.0");

      await expect(
        vault.connect(owner).deposit({ value: depositAmount })
      )
        .to.emit(vault, "Deposit")
        .withArgs(owner.address, depositAmount);

      expect(await vault.getBalance()).to.equal(depositAmount);
    });

    it("Should revert deposit from non-owner", async function () {
      const depositAmount = ethers.utils.parseEther("1.0");

      await expect(
        vault.connect(otherAccount).deposit({ value: depositAmount })
      ).to.be.revertedWithCustomError(vault, "NotOwner");
    });

    it("Should revert zero deposit", async function () {
      await expect(
        vault.connect(owner).deposit({ value: 0 })
      ).to.be.revertedWith("Deposit amount must be greater than 0");
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      // Deposit 1 ETH
      const depositAmount = ethers.utils.parseEther("1.0");
      await vault.connect(owner).deposit({ value: depositAmount });
    });

    it("Should revert withdrawal before unlock time", async function () {
      await expect(
        vault.connect(owner).withdraw()
      ).to.be.revertedWithCustomError(vault, "FundsLocked");
    });

    it("Should allow withdrawal after unlock time", async function () {
      // Fast forward time
      await time.increaseTo(unlockTime + 1);

      const balanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await vault.connect(owner).withdraw();
      const receipt = await tx.wait();

      // Calculate gas cost
      const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const expectedBalance = balanceBefore
        .add(ethers.utils.parseEther("1.0"))
        .sub(gasCost);

      expect(await ethers.provider.getBalance(owner.address)).to.equal(
        expectedBalance
      );
    });

    it("Should emit Withdrawal event", async function () {
      await time.increaseTo(unlockTime + 1);

      await expect(vault.connect(owner).withdraw())
        .to.emit(vault, "Withdrawal")
        .withArgs(ethers.utils.parseEther("1.0"), unlockTime + 1);
    });

    it("Should revert withdrawal by non-owner", async function () {
      await time.increaseTo(unlockTime + 1);

      await expect(
        vault.connect(otherAccount).withdraw()
      ).to.be.revertedWithCustomError(vault, "NotOwner");
    });

    it("Should revert withdrawal if no balance", async function () {
      await time.increaseTo(unlockTime + 1);

      await vault.connect(owner).withdraw();

      await expect(
        vault.connect(owner).withdraw()
      ).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Extend Lock", function () {
    it("Should extend unlock time to future timestamp", async function () {
      const latestBlockTime = await time.latest();
      const newUnlockTime = unlockTime + 3600; // +1 hour from current unlock time

      await expect(vault.connect(owner).extendLock(newUnlockTime))
        .to.emit(vault, "LockExtended")
        .withArgs(newUnlockTime);

      expect(await vault.unlockTime()).to.equal(newUnlockTime);
    });

    it("Should revert if trying to reduce lock time", async function () {
      const latestBlockTime = await time.latest();
      const shorterTime = unlockTime - 100;

      await expect(
        vault.connect(owner).extendLock(shorterTime)
      ).to.be.revertedWithCustomError(vault, "InvalidUnlockTime");
    });

    it("Should revert if new time is in the past", async function () {
      const latestBlockTime = await time.latest();
      const pastTime = latestBlockTime - 100;

      await expect(
        vault.connect(owner).extendLock(pastTime)
      ).to.be.revertedWithCustomError(vault, "InvalidUnlockTime");
    });

    it("Should revert extendLock from non-owner", async function () {
      const newUnlockTime = unlockTime + 3600;

      await expect(
        vault.connect(otherAccount).extendLock(newUnlockTime)
      ).to.be.revertedWithCustomError(vault, "NotOwner");
    });
  });

  describe("View Functions", function () {
    it("Should return correct balance", async function () {
      const depositAmount = ethers.utils.parseEther("1.5");
      await vault.connect(owner).deposit({ value: depositAmount });

      expect(await vault.getBalance()).to.equal(depositAmount);
    });

    it("Should report funds as locked before unlock time", async function () {
      expect(await vault.isFundsLocked()).to.be.true;
    });

    it("Should report funds as unlocked after unlock time", async function () {
      await time.increaseTo(unlockTime + 1);
      expect(await vault.isFundsLocked()).to.be.false;
    });

    it("Should return correct time remaining", async function () {
      const timeRemaining = await vault.getTimeRemaining();
      const latestBlockTime = await time.latest();
      const expected = unlockTime - latestBlockTime;

      // Allow small variance due to block timing
      expect(timeRemaining).to.be.closeTo(expected, 2);
    });

    it("Should return 0 time remaining when unlocked", async function () {
      await time.increaseTo(unlockTime + 1);
      expect(await vault.getTimeRemaining()).to.equal(0);
    });
  });

  describe("Receive Function", function () {
    it("Should accept ETH via receive function", async function () {
      const sendAmount = ethers.utils.parseEther("0.5");

      await expect(
        owner.sendTransaction({
          to: vault.address,
          value: sendAmount,
        })
      )
        .to.emit(vault, "Deposit")
        .withArgs(owner.address, sendAmount);

      expect(await vault.getBalance()).to.equal(sendAmount);
    });

    it("Should reject receive from non-owner", async function () {
      const sendAmount = ethers.utils.parseEther("0.5");

      await expect(
        otherAccount.sendTransaction({
          to: vault.address,
          value: sendAmount,
        })
      ).to.be.revertedWithCustomError(vault, "NotOwner");
    });
  });
});

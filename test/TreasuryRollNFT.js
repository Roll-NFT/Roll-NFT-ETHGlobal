// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

describe("TreasuryRollNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [treasuryOwner, tokenOwner, participant, address1, address2] = await ethers.getSigners();

    const ethFunding = ethers.utils.parseEther("1.0");

    // Deploy TreasuryContract
    const TreasuryRollNFT = await ethers.getContractFactory("TreasuryRollNFT");
    const treasuryContract = await TreasuryRollNFT.deploy({ value: ethFunding });
    
    // Deploy ERC20 Contract (RollToken)
    const RollToken = (await ethers.getContractFactory("RollToken", tokenOwner));
    const totalSupply = (10 ** 9).toString();
    const rollTokenContract = await RollToken.deploy(ethers.utils.parseEther(totalSupply));

    // Deploy a fake CoreContract for testing purpouses
    const unlockTime = (await time.latest()) + (365 * 24 * 60 * 60);
    const CoreRollNFT = await ethers.getContractFactory("Lock");
    const coreContract = await CoreRollNFT.deploy(unlockTime, { value: ethFunding });

    // Fund the Participant with some ERC20 
    await rollTokenContract.connect(tokenOwner).transfer(participant.address, 10 ** 8);

    // Next is equivalent to Participant buying tickets (transfer ERC20 Token to the CoreContract)
    await rollTokenContract.connect(participant).transfer(coreContract.address, 10 ** 7);

    return { treasuryContract, rollTokenContract, coreContract, treasuryOwner, participant, address1, address2 };
  }

  describe("Access Control", function () {

    it("Should set the owner as admin and manager", async function () {
      const { treasuryContract } = await loadFixture(deployContract);
      
      const adminCount = await treasuryContract.getAdminCount();
      const managerCount = await treasuryContract.getManagerCount();

      expect(adminCount).to.equal(1);
      expect(managerCount).to.equal(1);
    });

    it("Should grant the manager role to a new user", async function () {
      const { treasuryContract, address1 } = await loadFixture(deployContract);

      await treasuryContract.grantManagerRole(address1.address);

      const managerCount = await treasuryContract.getManagerCount();

      expect(managerCount).to.equal(2);
    });

    it("Should revoke the manager role from that user", async function () {
      const { treasuryContract, address1 } = await loadFixture(deployContract);

      await treasuryContract.grantManagerRole(address1.address);
      await treasuryContract.revokeManagerRole(address1.address);

      const managerCount = await treasuryContract.getManagerCount();

      expect(managerCount).to.equal(1);
    });

    it("Should refuse role management if not the admin", async function () {
      const { treasuryContract, address1, address2 } = await loadFixture(deployContract);

      await expect(treasuryContract.connect(address1).grantManagerRole(address2.address)).to.be.reverted;

    });

    it("Should refuse role management even if manager", async function () {
      const { treasuryContract, address1, address2 } = await loadFixture(deployContract);

      await treasuryContract.grantManagerRole(address1.address);

      await expect(treasuryContract.connect(address1).grantManagerRole(address2.address)).to.be.reverted;

    });
  });

  describe("Deposits", function () {

    it("Should deposit 100 LINK into the Treasury", async function () {
      const { treasuryContract, rollTokenContract, coreContract } = await loadFixture(deployContract);

      // Get the signer object of the CoreContract for signing the next 2 transactions
      const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

      // Aprove the TreasuryContract to spend the ERC-20 Token that belongs to the CoreContract
      await rollTokenContract.connect(coreContractSigner).approve(treasuryContract.address, 100, {gasLimit: 100000});

      // Deposit the ERC-20 Token into the TreasuryContract
      await treasuryContract.connect(coreContractSigner).depositERC20(rollTokenContract.address, 100);

      // Check the balance of ERC20 token for the TreasuryContract
      treasuryContractBalance = await rollTokenContract.balanceOf(treasuryContract.address);
      // Check the mapping of ERC20 token inside the TreasuryContract
      RollTokenBalanceInTreasury = await treasuryContract.balanceOf(rollTokenContract.address);

      expect(treasuryContractBalance).to.equal(100);
      expect(RollTokenBalanceInTreasury).to.equal(100);
    });

    it("Should revert deposit if not approved", async function () {
      const { treasuryContract, rollTokenContract, coreContract } = await loadFixture(deployContract);

      // Get the signer object of the CoreContract for signing the next 2 transactions
      const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

      // Tries to deposit the ERC-20 Token into the TreasuryContract
      await expect(treasuryContract.connect(coreContractSigner).depositERC20(rollTokenContract.address, 100)).to.be.reverted;

    });

    it("Should revert deposit if more the amount is bigger than approved", async function () {
      const { treasuryContract, rollTokenContract, coreContract } = await loadFixture(deployContract);

      // Get the signer object of the CoreContract for signing the next 2 transactions
      const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

      // Aprove the TreasuryContract to spend the ERC-20 Token that belongs to the CoreContract
      await rollTokenContract.connect(coreContractSigner).approve(treasuryContract.address, 100, {gasLimit: 100000});

      // Tries to deposit the ERC-20 Token into the TreasuryContract
      await expect(treasuryContract.connect(coreContractSigner).depositERC20(rollTokenContract.address, 200)).to.be.reverted;
    });

  });

  describe("Withdrawals", function () {
    it("Should withdraw 100 LINK from the Treasury if admin", async function () {
      const { treasuryContract, rollTokenContract, coreContract, treasuryOwner } = await loadFixture(deployContract);

      // Get the signer object of the CoreContract for signing the next 2 transactions
      const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

      // Aprove the TreasuryContract to spend the ERC-20 Token that belongs to the CoreContract
      await rollTokenContract.connect(coreContractSigner).approve(treasuryContract.address, 100, {gasLimit: 100000});

      // Deposit the ERC-20 Token into the TreasuryContract
      await treasuryContract.connect(coreContractSigner).depositERC20(rollTokenContract.address, 100);

      // Withdraw ERC-20 Token from the TreasuryContract
      await treasuryContract.connect(treasuryOwner).withdrawERC20(rollTokenContract.address, 100);

      // Check the balance of ERC20 token for the TreasuryContract
      treasuryContractBalance = await rollTokenContract.balanceOf(treasuryContract.address);
      // Check the balance of ERC20 token for the treasuryOwner
      treasuryOwnerBalance = await rollTokenContract.balanceOf(treasuryOwner.address);
      // Check the mapping of ERC20 token inside the TreasuryContract
      RollTokenBalanceInTreasury = await treasuryContract.balanceOf(rollTokenContract.address);

      expect(treasuryContractBalance).to.equal(0);
      expect(RollTokenBalanceInTreasury).to.equal(0);
      expect(treasuryOwnerBalance).to.equal(100);

    });

    it("Should withdraw 100 LINK from the Treasury if manager", async function () {
      const { treasuryContract, rollTokenContract, coreContract, treasuryOwner, address1 } = await loadFixture(deployContract);

      // Get the signer object of the CoreContract for signing the next 2 transactions
      const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

      // Aprove the TreasuryContract to spend the ERC-20 Token that belongs to the CoreContract
      await rollTokenContract.connect(coreContractSigner).approve(treasuryContract.address, 100, {gasLimit: 100000});

      // Deposit the ERC-20 Token into the TreasuryContract
      await treasuryContract.connect(coreContractSigner).depositERC20(rollTokenContract.address, 100);

      // Grant manager role
      await treasuryContract.grantManagerRole(address1.address);

      // Tries to withdraw ERC-20 Token from the TreasuryContract
      await treasuryContract.connect(address1).withdrawERC20(rollTokenContract.address, 100);

      // Check the balance of ERC20 token for the TreasuryContract
      treasuryContractBalance = await rollTokenContract.balanceOf(treasuryContract.address);
      // Check the balance of ERC20 token for the treasuryOwner
      address1Balance = await rollTokenContract.balanceOf(address1.address);
      // Check the mapping of ERC20 token inside the TreasuryContract
      RollTokenBalanceInTreasury = await treasuryContract.balanceOf(rollTokenContract.address);

      expect(treasuryContractBalance).to.equal(0);
      expect(RollTokenBalanceInTreasury).to.equal(0);
      expect(treasuryOwnerBalance).to.equal(100);

    });

    it("Should fail to withdraw if not manager", async function () {
      const { treasuryContract, rollTokenContract, coreContract, address1 } = await loadFixture(deployContract);

      // Get the signer object of the CoreContract for signing the next 2 transactions
      const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

      // Aprove the TreasuryContract to spend the ERC-20 Token that belongs to the CoreContract
      await rollTokenContract.connect(coreContractSigner).approve(treasuryContract.address, 100, {gasLimit: 100000});

      // Deposit the ERC-20 Token into the TreasuryContract
      await treasuryContract.connect(coreContractSigner).depositERC20(rollTokenContract.address, 100);

      // Tries to withdraw ERC-20 Token from the TreasuryContract
      await expect(treasuryContract.connect(address1).withdrawERC20(rollTokenContract.address, 100)).to.be.reverted;

    });

    it("Should fail to withdraw if not manager if balance is not sufficient", async function () {
      const { treasuryContract, rollTokenContract, coreContract, treasuryOwner } = await loadFixture(deployContract);

      // Get the signer object of the CoreContract for signing the next 2 transactions
      const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

      // Aprove the TreasuryContract to spend the ERC-20 Token that belongs to the CoreContract
      await rollTokenContract.connect(coreContractSigner).approve(treasuryContract.address, 100, {gasLimit: 100000});

      // Deposit the ERC-20 Token into the TreasuryContract
      await treasuryContract.connect(coreContractSigner).depositERC20(rollTokenContract.address, 100);

      // Tries to withdraw ERC-20 Token from the TreasuryContract
      await expect(treasuryContract.connect(treasuryOwner).withdrawERC20(rollTokenContract.address, 200)).to.be.reverted;
    });

  });

});

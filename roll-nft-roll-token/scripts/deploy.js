// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const totalSupply = (10 ** 9).toString();
  const RollTokenFactory = await hre.ethers.getContractFactory("RollToken");
  const rollToken = await RollTokenFactory.deploy(totalSupply);
  await rollToken.deployed();
  console.log("Contrato implantado no endereço:", rollToken.address);
  // Last deployed contract: https://mumbai.polygonscan.com/token/0x4E4002420B40d3d6B0AD3E2188Cf818c2Ef0d597
  // Verify: hh verify --contract contracts/RollToken.sol:RollToken --network mumbai 0x4E4002420B40d3d6B0AD3E2188Cf818c2Ef0d597 1000000000
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

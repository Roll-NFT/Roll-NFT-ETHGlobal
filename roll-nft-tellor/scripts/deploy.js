// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

require("dotenv").config();


async function main() {

  const tellor = process.env.TELLOR_ORACLE_CONTRACT; //address of tellor oracle contract
  const autopay = process.env.TELLOR_AUTOPAY_CONTRACT; //address of tellor autopay contract
  const tellorToken = process.env.TELLOR_TRB_TOKEN_CONTRACT; //address of token used for autopay tips
  const tipAmount = "5000000000000000000"; //amount of token to tip (in wei)

  const tellorRNGFactory = await hre.ethers.getContractFactory("TellorRNG");
  const tellorRNG = await tellorRNGFactory.deploy(tellor, autopay, tellorToken, tipAmount);
  await tellorRNG.deployed();
  console.log("Contrato implantado no endereço:", tellorRNG.address);
  // Last deployed contract: https://mumbai.polygonscan.com/address/0x2c8bcFB12CA8D21C87a40C4C6B199d948610C12c#code

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

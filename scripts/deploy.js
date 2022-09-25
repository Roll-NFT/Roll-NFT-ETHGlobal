// npx hardhat run scripts/run.js

const main = async () => {
  // const RollOwnershipTokenV0Factory = await hre.ethers.getContractFactory(
  //   "RollOwnershipTokenV0"
  // );
  // const rollOwnershipToken = await RollOwnershipTokenV0Factory.deploy();
  // await rollOwnershipToken.deployed();
  // console.log("RollOwnershipToken implantado em:", rollOwnershipToken.address);
  // // 0xf888F9BcdD17C6aDbd6733374511A4486A129375

  const RollParticipationTokenV0Factory = await hre.ethers.getContractFactory(
    "RollParticipationTokenV0"
  );
  const rollParticipationToken = await RollParticipationTokenV0Factory.deploy();
  await rollParticipationToken.deployed();
  console.log("RollParticipationToken implantado em:", rollParticipationToken.address);
  // 0xD931Cb4f45Bc5F2EC37fF91EE36dd5713c8090cE

  // const TreasuryFactory = await hre.ethers.getContractFactory(
  //   "TreasuryRollNFT"
  // );
  // const treasuryFactory = await TreasuryFactory.deploy(process.env.MUMBAI_PUBLIC_KEY);
  // await treasuryFactory.deployed();
  // console.log("TreasuryRollNFT implantado em:", treasuryFactory.address);
  // // 0x573EA18457228Bc4215C646D55045083Ec7502fC

};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
runMain();

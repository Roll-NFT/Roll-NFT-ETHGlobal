// npx hardhat run scripts/run.js

const main = async () => {



  // const CoreRollNFTFactory = await hre.ethers.getContractFactory(
  //   "CoreRollNFTV1"
  // );
  const CoreRollNFTFactory = await hre.ethers.getContractFactory(
    "CoreRollNFTV2"
  );
  const coreRollNFT = await CoreRollNFTFactory.deploy(5); // 5% _revenueFee
  await coreRollNFT.deployed();
  console.log("Contrato implantado em:", coreRollNFT.address);

  // let txn;
  // txn = await coreRollNFTV1.getRollTokenContract()
  // console.log("getRollTokenContract: ");
  // console.log(txn);

  // const rollTime = Math.floor(+new Date() / 1000);
  // const rollTitle = "Teste"
  // const minParticipants = 100;
  // const maxParticipants = 100;
  // const participationPrice = 1;
  // const participationToken = "0x4E4002420B40d3d6B0AD3E2188Cf818c2Ef0d597";
  // const prizeAddress = "0x8dba0bed459bb1c0b037ca638f22e224a00e7802";
  // const prizeId = 1;
  // txn = await coreRollNFTV1.createRoll(rollTime,rollTitle,minParticipants,maxParticipants,participationPrice,participationToken,prizeAddress,prizeId)
  // console.log("createRoll txn: ");
  // console.log(txn);

  // txn = await coreRollNFTV1.getRollTicketsContract(uint _rollId)
  // console.log("getRollTokenContract: ");
  // console.log(txn);

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

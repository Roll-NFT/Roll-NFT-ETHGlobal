// npx hardhat run scripts/run.js

const main = async () => {
  const RollOwnershipTokenV0Factory = await hre.ethers.getContractFactory(
    "RollOwnershipTokenV0"
  );
  const rollOwnershipTokenV0 = await RollOwnershipTokenV0Factory.deploy();
  await rollOwnershipTokenV0.deployed();
  console.log("Contrato implantado em:", rollOwnershipTokenV0.address);

  let txn;

  txn = await rollOwnershipTokenV0.mint(
    "123",
    "Teste",
    100,
    "0x4E4002420B40d3d6B0AD3E2188Cf818c2Ef0d597",
    100,
    "0x8dba0bed459bb1c0b037ca638f22e224a00e7802",
    1,
    Math.floor(+new Date() / 1000)
  );

  await txn.wait();
  console.log("ROLT NFT #1 Minted");

  txn = await rollOwnershipTokenV0.tokenURI(1)
  console.log("tokenURI: ");
  console.log(txn);

  //

  const RollParticipationTokenV0Factory = await hre.ethers.getContractFactory(
    "RollParticipationTokenV0"
  );
  const rollParticipationTokenV0 = await RollParticipationTokenV0Factory.deploy();
  await rollParticipationTokenV0.deployed();
  console.log("Contrato implantado em:", rollParticipationTokenV0.address);

  txn = await rollParticipationTokenV0.mint(
    "123",
    "123",
    rollOwnershipTokenV0.address
  );

  await txn.wait();
  console.log("RPT NFT #1 Minted");

  txn = await rollParticipationTokenV0.tokenURI(1)
  console.log("tokenURI: ");
  console.log(txn);  

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

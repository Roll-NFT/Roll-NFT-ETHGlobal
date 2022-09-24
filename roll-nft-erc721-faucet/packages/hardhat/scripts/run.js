// npx hardhat run scripts/run.js

const main = async () => {
  const YourContractFactory = await hre.ethers.getContractFactory(
    "YourContract"
  );
  const YourContract = await YourContractFactory.deploy();
  await YourContract.deployed();
  console.log("Contrato implantado em:", YourContract.address);

  let txn;

  // eslint-disable-next-line global-require
  const countries = require("../countries-test.json");

  console.log(countries);

  for (const country of countries) {
    txn = await YourContract.mintFlagNFT(
      country.code,
      country.name,
      country.ipfsCID,
      country.city
    );
    await txn.wait();
    console.log("NFT Minted for", country.code);
  }

  txn = await YourContract.mintFlagNFT(
    "ad",
    "Andorra",
    "QmZF4zadSZZAdL1aptDiGZBmAeApghXyjeYKkA8JKbPAeS",
    "Andorra la Vella"
  );
  await txn.wait();
  console.log("NFT #1 Minted");

  txn = await YourContract.getCurrentTokenId();
  let currentTokenId = txn;
  let currentTokenIdInt = currentTokenId.toNumber() - 1;
  console.log("currentTokenId: ", currentTokenIdInt);

  txn = await YourContract.ownerOf(currentTokenIdInt);
  console.log("ownerOf #", currentTokenIdInt, "is: ", txn);

  txn = await YourContract.tokenURI(currentTokenIdInt);
  console.log("tokenURI #", currentTokenId, "is: ");
  console.log(txn);

  txn = await YourContract.mintFlagNFT(
    "ae",
    "United Arab Emirates",
    "QmPGhYDpXE8va6feRDBNcUu443hNLqAB9KQgz4htRteNSr",
    "Abu Dhabi"
  );
  await txn.wait();
  console.log("NFT #2 Minted");

  txn = await YourContract.getCurrentTokenId();
  currentTokenId = txn;
  currentTokenIdInt = currentTokenId.toNumber() - 1;
  console.log("currentTokenId: ", currentTokenIdInt);

  txn = await YourContract.ownerOf(currentTokenIdInt);
  console.log("ownerOf #", currentTokenIdInt, "is: ", txn);

  txn = await YourContract.tokenURI(currentTokenIdInt);
  console.log("tokenURI #", currentTokenId, "is: ");
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

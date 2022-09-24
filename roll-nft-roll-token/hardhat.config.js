require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: process.env.GOERLI_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    rinkeby: {
      url: process.env.RINKEBY_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    mumbai: {
      url: process.env.MUMBAI_QUICKNODE_KEY,
      accounts: [process.env.MUMBAI_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      mainnet: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
      goerli: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
      kovan: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
      rinkeby: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
      ropsten: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
      polygonMumbai: process.env.POLYGON_ETHERSCAN_KEY,
      // add other network's API key here
    },
  },
};

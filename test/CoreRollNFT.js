// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

const { keccak256 } = require("@ethersproject/keccak256");
const { toUtf8Bytes } = require("@ethersproject/strings");

describe("CoreRollNFT", function () {

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployContract() {
        
        // Contracts are deployed using the first signer/account by default
        const [coreDeployer, linkOwner, rollHost, rollOwner, participant1, participant2, address1, address2] = await ethers.getSigners();

        const ethFunding = ethers.utils.parseEther("1.0");

        // Deploy CoreRollNFT contract
        const CoreRollNFT = await ethers.getContractFactory("CoreRollNFT");
        const coreContract = await CoreRollNFT.deploy({ value: ethFunding });
    
        // Deploy ERC20 Contract (LINK TOKEN)
        const LinkToken = (await ethers.getContractFactory("LinkToken", linkOwner));
        const totalSupply = (10 ** 9).toString();
        const linkTokenContract = await LinkToken.deploy(ethers.utils.parseEther(totalSupply));

        // Fund the Participants with some ERC20 
        await linkTokenContract.connect(linkOwner).transfer(participant1.address, 10 ** 8);
        await linkTokenContract.connect(linkOwner).transfer(participant2.address, 10 ** 8);

        /// Deploy ERC721 contract (FaucetNFT - FUN) to be used as Prize asset
        const FaucetNFT = await ethers.getContractFactory("FaucetNFT");
        const prizeContract = await FaucetNFT.deploy();
        
        /// Fund Roll host with 2 NFT Prize tokens. Token ID's will be: 0, 1
        await prizeContract.connect(rollHost).safeMint(rollHost.address);
        await prizeContract.connect(rollHost).safeMint(rollHost.address);

        return { coreContract, linkTokenContract, prizeContract, coreDeployer, linkOwner, rollHost, rollOwner, participant1, participant2, address1, address2 };
    }

    describe("Deploy", function () {
        
        it("Should deploy: CoreRollNFT, LinkToken, FaucetNFT contracts", async function () {

            const { coreContract, linkTokenContract, prizeContract, coreDeployer} = await loadFixture(deployContract);

            // Get the signer object of the CoreContract for signing the next 2 transactions
            const coreContractSigner = await ethers.getImpersonatedSigner(coreContract.address);

            expect(coreContractSigner).to.equal(coreDeployer);

        });
    })
});

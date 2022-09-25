# Roll NFT project submission for ETH Global hackathon

https://ethglobal.com/showcase/roll-nft-duj70

Roll NFT is an application that let users to create Rolls (raffles) with any NFT asset they own. And from other side it allows users to participate in existing Rolls to compete for prize pool.

Prize pool could be formed by any kind of NFT, whether it's an Avatar, Game asset, Digital art or Real world asset.

Active Rolls are available on dashboard and could be filtered by NFT collections and/or categories. On profile page available list of current, upcoming and past user Rolls. As well as watch lists of favourite collections and hosts.

For MVP we will cover next user stories:
As a host I can create a Roll (raffle) with any of my NFT assets as a prize
As a user I can see ongoing Rolls on application dashboard
As a user I can participate (mint token) to any ongoing Rolls available on dashboard
As a host I want to claim my revenue from entries sold
As an owner of winning ticket I want to claim my NFT prize
As a Roll owner I want to withdraw prize asset, if Roll was unsuccessful
As a Participant I want to refund participation token asset, if Roll was unsuccessful

# How It's Made - Technologies and hackathon partners we used

On Roll creation main contract (CoreRollNFT.sol) mint a ERC721 token (RollOwnershipToken.sol) and deploy ERC721 contract (RollParticipationToken.sol) which represents NFT collection of tickets.
Chainlink VRF used for RNG and Winning token ID selection.

We also built a variant of that NFT Faucet with NFTPort, that is helpful to mint free NFT token to use as a Prize asset on Roll creation. NFT metadata uploaded to IPFS.

Contracts are deployed on Polygon Mumbai network using hardhat, Quicknode and in some cases Remix.
Quicknode also used as RPC.

Through Covalent API we are fetching ERC20 balances, NFTs and it's metadata from the user's wallet.

Valist solution helped us to deploy a a decentralised version of our frontend. Which is hosted on IPFS.

And we used ENS rollnft.eth domain name to attach our front-end as domain content.

We used Front-end marketplace template, since it implements similar functionality.

# Live demo

https://roll-nft.xyz/
Valist: https://bafybeidrkplw37mhayz7ylhycpuwirbxnm44noe2x3rrfapc2qem2k3ntm.ipfs.gateway.valist.io/
ENS: https://rollnft.eth.limo/

# Brainstorm and workking notes

https://miro.com/app/board/uXjVPax8MnM=/?moveToWidget=3458764532498290731&cot=14

https://www.figma.com/file/xU1tjigb8xT1IDwDecxHHy/Roll-NFT?node-id=0%3A1

# Contracts

### Last version MVP contracts

Available in `contract-mvp-solving-eip-170` branch
https://github.com/Roll-NFT/Roll-NFT-ETHGlobal/tree/contract-mvp-solving-eip-170
With last submission commit `VRF Subscription ID fix`
https://github.com/Roll-NFT/Roll-NFT-ETHGlobal/commit/773b1a1121b4e30d352a7c670afaf13d3fb8613c

Last version of contracts deployed on Mumbai Polygon testned using Remix IDE.

- RollOwnershipToken - 0x19FA5D16Ef5AE2Dd0CEE9bBFDcc59a4ea1f51cc9
- TreasuryRollNFT - 0x15d48B638fFdB009C2634fEb26EFaBcAb197B11e
- FaucetNFT (super simple faucet) - 0x8c51FF9c44faa9Bd32A82d9052a4E84D8FD09B40
- CoreRollNFT - 0x0FCDA4F77BC885A297330a5f7D2e7D2a8dcb96B5

### Deployment flow

- Deploy RollOwnershipToken.sol
- Deploy TreasuryRollNFT.sol
- Deploy CoreRollNFT.sol - Provide constructor arguments: RollOwnershipToken, TreasuryRollNFT and Chainlink VRF parameters.
- TreasuryRollNFT: Grant manager role to CoreRollNFT contract - Call TreasuryRollNFT.grantManagerRoll(CoreRollNFT)
- RollOwnershipToken: Grant manager, minter, burner roles - Call RollOwnershipToken.connectCoreRollNFT(CoreRollNFT)
- Add CoreRollNFT as a consumer to chainlink VRF subscription (https://vrf.chain.link/)
- Unpause CoreRollNFT - Call RollOwnershipToken.unpause()
- Deploy any of NFT faucet contracts

# Respectful mentions:

Teves#2400 - Teves `Golden hands` - For making that project to hit submission. And making ideas to become project product.

2d_eddie#2334 - Connext team and ETH Online Mentor. For mentoring us in many different aspects - brainstorm on product design, logic design, user flow and of course - Solidity!

Jaf | EPNS#7611 - EPNS. For brainstorming with us on feedback session and EPNS office hours

heavychain#9088 - Tellor. For explaining Tellor's features and brainstorming with us during massive office hour

petermdenton|XMTP#3677 - XMTP. For paying attention to our project! For providing ideas, feedback and solutions.

### Those who was helpful around:

shivaliSharma#2596 - For helping to solve EIP-170 issue

equious.eth#6314 - For advices about cloning-with-immutable-args patern issues

Stanislav#6300 - For pointing us to proper partner

NuclearGeek.eth#9119 - For giving suggestions and answers to our questions

### Those hackers who was with us at the begining an helped us to start:

xperiliarmus#9576

electrone#0906

Lisanaaa#1090

Meek#6464

prime#3227

ithinkimrishi#9782

carlosN#7952

Kakashi_Hatake#5416

### And those who react on our requests:

dtb#3153 - Tableland

Irene | APWine 🍇🍷#0777 - APWine

0xJess#2735 - AAVE

farrahmay | Yearn Finance#7790 - Yearn

# Roll NFT ETHGlobal

Roll NFT project submission for ETH Global hackathon

Roll NFT is an application that let users to create Rolls (raffles) with any NFT asset they own.
And from other side it allows users to participate in existing Rolls to compete for prize pool.

Prize pool could be formed by any kind of NFT, whether it's an Avatar, Game asset, Digital art or Real world asset.

Active Rolls are available on dashboard and could be filtered by NFT collections and/or categories.
On profile page available list of current, upcoming and past user Rolls. As well as watch lists of favourite collections and hosts.

Roll NFT extends options for trades with NFT assets and brings game factor to NFT exchanges.

# Technologies and hackathon partners used

Every hosted (created) Roll will be unique ERC721 smart contract - representing NFT entry (ticket) collection for that particular raffle.
We consider to deploy smart contract on Polygon network.
To handle network listening we consider to use TheGraph or Covalent.
We like what Worldcoin offer for web3 developers, and we have ideas on how to implement it.

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# Smart contracts

## Ownable

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.7.3/contracts/access/Ownable.sol

import "@openzeppelin/contracts/access/Ownable.sol";

modifier onlyOwner() - Modifier to make a function callable only by the owner.

function owner() public view virtual returns (address) - Returns the address of the current owner.
function renounceOwnership() public virtual onlyOwner - Leaves the contract without owner.
function transferOwnership(address newOwner) public virtual onlyOwner - Transfers ownership of the contract to a new account (`newOwner`).

event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)

## Pausable

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.7.3/contracts/security/Pausable.sol

import "@openzeppelin/contracts/security/Pausable.sol";

modifier whenNotPaused() - Modifier to make a function callable only when the contract is paused.
modifier whenPaused() - Modifier to make a function callable only when the contract is not paused.

function paused() public view virtual returns (bool) - Returns true if the contract is paused, and false otherwise.

event Paused(address account)
event Unpaused(address account)

## Counters

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.7.3/contracts/utils/Counters.sol

import "@openzeppelin/contracts/utils/Counters.sol";

function current(Counter storage counter) internal view returns (uint256)
function increment(Counter storage counter) internal
function decrement(Counter storage counter) internal
function reset(Counter storage counter) internal

## Context (abstract contract)

https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.7.3/contracts/utils/Context.sol

import "@openzeppelin/contracts/utils/Context.sol";

function _msgSender() internal view virtual returns (address)
function _msgData() internal view virtual returns (bytes calldata)
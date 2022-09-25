pragma solidity 0.8.4;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "hardhat/console.sol";

contract RollOwnershipTokenV0 is ERC721 {

    struct Roll {
        string id;
        string name;
        uint256 ticketSupply;
        address currencyToken;
        uint256 ticketPrice;
        address prizeAddress;
        uint256 prizeTokenId;
        uint256 rng;
        address ticketContract;
        bool prizeClaimed;
        bool revenueClaimed;
        uint64 deadline;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => Roll) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;

    event RollOwnershipTokenMinted(address sender, uint256 tokenId, string rollId);

    event PrizeClaimed(address sender, uint256 tokenId, string rollId);

    event RevenueClaimed(address sender, uint256 tokenId, string rollId);

    event RNGUpdated(address sender, uint256 tokenId, string rollId, uint256 rng);

    constructor() payable ERC721("Roll Ownership Token Collection", "ROLT") {
        console.log("Smart Contract initialized");
        _tokenIds.increment();
    }

    function mint(
        string memory rollId,
        string memory name,
        uint ticketSupply,
        address currencyToken,
        uint256 ticketPrice,
        address prizeAddress,
        uint256 prizeTokenId,
        uint64 deadline
    ) external {
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);

        nftHolderAttributes[newItemId] = Roll({
            id: rollId,
            name: name,
            ticketSupply: ticketSupply,
            currencyToken: currencyToken,
            ticketPrice: ticketPrice,
            prizeAddress: prizeAddress,
            prizeTokenId: prizeTokenId,
            rng: 0,
            ticketContract: address(0),
            deadline: deadline,
            prizeClaimed: false,
            revenueClaimed: false
        });

        nftHolders[msg.sender] = newItemId;

        _tokenIds.increment();

        emit RollOwnershipTokenMinted(msg.sender, newItemId, rollId);
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        Roll memory roll = nftHolderAttributes[_tokenId];

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "Roll Ownership Token for Roll #',
                roll.id,
                '", "description": "',
                roll.name,
                '", "image": "ipfs://Qmb3DhFD4tuvzLUgmExDMDtLbRM7XwKa7Y7w56aR8EQ6cz",',
                '"attributes": [{"attribute": "Prize claimed", "value": "',
                (roll.prizeClaimed ? "1" : "0"),
                '"}, {"attribute": "Revenue Claimed", "value": "',
                (roll.revenueClaimed  ? "1" : "0"),
                '"}, {"attribute": "Ticket Supply", "value": "',
                Strings.toString(roll.ticketSupply),
                '"}, {"attribute": "Prize Address", "value": "',
                toAsciiString(roll.prizeAddress),
                '"}, {"attribute": "Currency Address", "value": "',
                toAsciiString(roll.currencyToken),
                '"}, {"attribute": "Ticket Price", "value": "',
                Strings.toString(roll.ticketPrice),
                '"}, {"attribute": "Prize Token ID", "value": "',
                Strings.toString(roll.prizeTokenId),
                '"}, {"attribute": "RNG", "value": "',
                Strings.toString(roll.rng),
                '"}, {"attribute": "Deadline", "value": "',
                Strings.toString(roll.deadline),
                '"}]}'
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function updateRng(uint256 _tokenId, uint256 rng) public {
        Roll memory roll = nftHolderAttributes[_tokenId];
        roll.rng = rng;
        emit RNGUpdated(msg.sender, _tokenId, roll.id, rng);
    }

    function claimPrize(uint256 _tokenId) external {
        Roll memory roll = nftHolderAttributes[_tokenId];
        roll.prizeClaimed = true;
        emit PrizeClaimed(msg.sender, _tokenId, roll.id);
    }

    function claimRevenue(uint256 _tokenId) external {
        Roll memory roll = nftHolderAttributes[_tokenId];
        roll.revenueClaimed = true;
        emit RevenueClaimed(msg.sender, _tokenId, roll.id);
    }

    receive() external payable {}

    fallback() external payable {}

}
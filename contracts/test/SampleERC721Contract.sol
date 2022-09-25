pragma solidity 0.8.4;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "hardhat/console.sol";

contract SampleERC721Contract is ERC721 {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => uint256) public nftHolders;

    event NFTMinted(address sender, uint256 tokenId);

    constructor() payable ERC721("SampleERC721Contract", "SAMPLE") {
        console.log("Smart Contract initialized");
        _tokenIds.increment();
    }

    // function mint(
    //     string memory ticketlId,
    //     string memory rollId,
    //     address rollContract
    // ) external {
    //     uint256 newItemId = _tokenIds.current();

    //     _safeMint(msg.sender, newItemId);

    //     nftHolderAttributes[newItemId] = Ticket({
    //         id: ticketlId,
    //         rollId: rollId,
    //         rollContract: rollContract,
    //         status: 0
    //     });

    //     nftHolders[msg.sender] = newItemId;

    //     _tokenIds.increment();

    //     emit RollParticipationTokenMinted(msg.sender, newItemId, rollId, ticketlId);
    // }

    // function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    //     Ticket memory ticket = nftHolderAttributes[_tokenId];

    //     string memory json = Base64.encode(
    //         abi.encodePacked(
    //             '{"name": "Roll Participation Token for Roll #',
    //             ticket.rollId,
    //             '", "description": "',
    //             ticket.id,
    //             '", "image": "ipfs://QmeE95PecUUiqioifzkyayLwSP3hLKnVSzRA2vCDVwXqST",',
    //             '"attributes": [{"attribute": "Status", "value": "',
    //             Strings.toString(ticket.status),
    //             '"}]}'
    //         )
    //     );

    //     string memory output = string(
    //         abi.encodePacked("data:application/json;base64,", json)
    //     );

    //     return output;
    // }

    // function claimRevenue(uint256 _tokenId) external {
    //     Ticket memory ticket = nftHolderAttributes[_tokenId];
    //     ticket.status = 1;
    //     emit PrizeClaimed(msg.sender, _tokenId, ticket.rollId, ticket.id);
    // }

    // receive() external payable {}

    // fallback() external payable {}

}
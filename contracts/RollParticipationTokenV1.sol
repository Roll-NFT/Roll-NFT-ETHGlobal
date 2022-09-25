pragma solidity 0.8.4;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IERC721RollTicket.sol";

import "hardhat/console.sol";

contract RollParticipationTokenV1 is ERC721 {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 rollID;

    struct Ticket {
        string id;
        uint256 rollId;
        address rollContract;
        uint status;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => Ticket) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;

    event RollParticipationTokenMinted(address sender, uint256 tokenId, uint256 rollId, string ticketId);

    event PrizeClaimed(address sender, uint256 tokenId, uint256 rollId, string ticketId);

    constructor(uint256 _rollID) payable ERC721("Roll Participation Token Collection", "RPT") {
        console.log("Smart Contract initialized");
        _tokenIds.increment();
        rollID = _rollID;
    }

    function mint(
        string memory ticketlId,
        uint256 rollId,
        address rollContract
    ) external {
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);

        nftHolderAttributes[newItemId] = Ticket({
            id: ticketlId,
            rollId: rollId,
            rollContract: rollContract,
            status: 0
        });

        nftHolders[msg.sender] = newItemId;

        _tokenIds.increment();

        emit RollParticipationTokenMinted(msg.sender, newItemId, rollId, ticketlId);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        Ticket memory ticket = nftHolderAttributes[_tokenId];

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "Roll Participation Token for Roll #',
                ticket.rollId,
                '", "description": "',
                ticket.id,
                '", "image": "ipfs://QmeE95PecUUiqioifzkyayLwSP3hLKnVSzRA2vCDVwXqST",',
                '"attributes": [{"attribute": "Status", "value": "',
                Strings.toString(ticket.status),
                '"}]}'
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function claimRevenue(uint256 _tokenId) external {
        Ticket memory ticket = nftHolderAttributes[_tokenId];
        ticket.status = 1;
        emit PrizeClaimed(msg.sender, _tokenId, ticket.rollId, ticket.id);
    }

    receive() external payable {}

    fallback() external payable {}

}
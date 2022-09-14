// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "clones-with-immutable-args/Clone.sol";


contract RollXxxTicketsCollection is Clone, Initializable, ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Roll #xxx tickets collection", "RTC") {}

    function _baseURI() internal pure override returns (string memory) {
        /// TODO implement auto setting for base URI
        /// 
        return "https://baseURI";
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    /// @dev initialize Tickets collection contract
    function initialize (
        string memory _name,
        IERC721 _prizeAddress,
        uint256 _prizeId,
        address _host,
        uint256 _rollType,
        uint256 _rollID
    ) public initializer {
         __ERC721_init(_name, "RTC");
         host = _host;
         prize.prizeAddress = _prizeAddress;
         prize.prizeId = _prizeId;
         rollType = _rollType;
         rollID = _rollID;
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "clones-with-immutable-args/Clone.sol";


/// @custom:security-contact loizage@icloud.com
contract RollTicketsContract is Clone, Initializable, ERC721, ERC721Burnable, Ownable {
    
    using Strings for uint256;
    
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    string public rollURI;

    constructor(string memory _rollURI) ERC721("Roll #ID Tickets contract", "RTIX") {
        rollURI = _rollURI;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view override returns (string memory) {
        return rollURI;
    }

    /**
     * @dev initialize Tickets collection contract
     */
    function initialize (
        string memory _name,
        IERC721 _prizeAddress,
        uint256 _prizeId,
        address _host,
        uint256 _rollType,
        uint256 _rollID
    ) public initializer {
         __ERC721_init(_name, "RTIX");
         host = _host;
         prize.prizeAddress = _prizeAddress;
         prize.prizeId = _prizeId;
         rollType = _rollType;
         rollID = _rollID;
    }


}
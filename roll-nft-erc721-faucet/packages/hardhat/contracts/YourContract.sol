pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./libraries/Base64.sol";

contract YourContract is ERC721 {
    struct Country {
        string code;
        string name;
        string imageURI;
        string city;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => Country) public nftHolderAttributes;
    mapping(string => address) public nftHolders;

    event CountryFlagNFTNFTMinted(address sender, uint256 tokenId, string code);

    constructor() payable ERC721("Squared Country Flags", "FLAGS") {
        console.log("Smart Contract initialized");
        _tokenIds.increment();
    }

    function mintFlagNFT(
        string memory code,
        string memory name,
        string memory imageURI,
        string memory city
    ) external {
        uint256 newItemId = _tokenIds.current();

        require(nftHolders[code] == address(0), "Country code already taken");

        // A funcao magica! Atribui o tokenID para o endereço da carteira de quem chamou o contrato.
        _safeMint(msg.sender, newItemId);

        // Nos mapeamos o tokenId => os atributos dos personagens. Mais disso abaixo
        nftHolderAttributes[newItemId] = Country({
            code: code,
            name: name,
            imageURI: imageURI,
            // population: population,
            // currency: currency,
            city: city
        });

        console.log("Minted NFT from %s with tokenId %s ", name, newItemId);

        // Mantem um jeito facil de ver quem possui a NFT
        //nftHolders[msg.sender] = newItemId;
        nftHolders[code] = msg.sender;

        // Incrementa o tokenId para a proxima pessoa que usar.
        _tokenIds.increment();

        emit CountryFlagNFTNFTMinted(msg.sender, newItemId, code);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        Country memory nftAttributes = nftHolderAttributes[_tokenId];

        require(bytes(nftAttributes.code).length > 0, "Token ID Not found");

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": " Flag from ',
                nftAttributes.name,
                ' -- NFT #: ',
                Strings.toString(_tokenId),
                '", "description": "This NFT is a unique digital version of the flag of ',
                nftAttributes.name,
                '",',
                '"image": "ipfs://',
                nftAttributes.imageURI,
                '",',
                '"attributes": ['
                '{ "trait_type": "Code", "value": "',
                nftAttributes.code,
                '"},',
                '{ "trait_type": "City", "value": "',
                nftAttributes.city,
                '"}]}'
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIds.current();
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact loizage@icloud.com
contract RollOwnershipToken is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    
    constructor(_coreRollNFTAddr) ERC721("Roll ownership token", "ROLT") {
        
        /// @dev set Core Roll NFT contrast as a owner
        _transferOwnership(_coreRollNFTAddr);
        
    }

    function safeMint(address to, uint256 tokenId, string memory uri)
        external
        onlyOwner
    {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function burn(uint256 tokenId) external override(ERC721Burnable) onlyOwner {
        _burn(tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}

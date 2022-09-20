// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ERC721 interface with URIStorage plus external Mint and Burn functions
 * @author Loizage
 * 
 * @dev safeMint() and burn() entry points made external
 * 
 * MANAGER_ROLE contracts can interact with ERC721Roll NFT collections contract
 * 
 * @notice Defines Mint and Burn functions
 */
interface IERC721RollTicket is IERC721, IERC721URIStorage {

    /**
     * @dev Mint Roll ownership token by it's ID
     * 
     * Requirements:
     * 
     * - the caller must have the `BURNER_ROLE`.
     * 
     * @param to - 
     * @param uri - 
     * 
     * @return minted token ID, same as tokenId
     */
    function safeMint(address to, string memory uri) external returns (uint);

    /**
     * @dev Burns token
     * 
     * Available for caller with proper role set
     */
    function burn(uint256 tokenId) external;
    
    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address)

}
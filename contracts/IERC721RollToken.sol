// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ERC721 interface plus external Mint and Burn functions
 * @author Loizage
 * 
 * @dev safeMint() and burn() entry points made external
 * 
 * @notice Defines Mint and Burn functions
 */
interface IERC721RollToken is IERC721 {

    /**
     * @dev Burn Roll ownership token by it's ID
     * 
     * Requirements:
     * 
     * - the caller must have the `BURNER_ROLE`.
     * 
     * @param tokenId - ID of the token to burn
     */
    function burnRoll(uint256 tokenId) external;
    
    /**
     * @dev Creates new Roll ownership token for `to` with `tokenId` and set it's URI
     * 
     * Requirements:
     * 
     * - the caller must have the `MINTER_ROLE`.
     * 
     * @param to - address to be minted to
     * @param tokenId - ID of the Roll ownership token
     * @param uri - URI with Roll metadata
     */
    function mintRoll(address to, uint256 tokenId, string memory uri) external;

    /// @dev TODO Update doc
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory);

}
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title ERC721 interface plus external Mint and Burn functions
 * @author Loizage
 * 
 * @dev safeMint() and burn() entry points made external
 * 
 * @notice Defines Mint and Burn functions
 */
interface IERC721RollTicket is IERC721 {
    
    function mint(
        string memory ticketlId,
        uint256 rollId,
        address rollContract
    ) external;
    
}
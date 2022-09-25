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

import "./IRoll.sol";

interface IERC721RollToken is IERC721 {
    
    function mint(IRoll.Roll memory rollStruct) external;

}
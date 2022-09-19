// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @custom:security-contact loizage@icloud.com
interface IPrize {
    
    /**
     * @dev Structure that contain crucial Roll parameters and conditions, that are checked on Roll execution
     * 
     * @param collectionAddr NFT collection address of the Prize
     * @param tokenId Prize token ID
     * @param claimAvailable True when prize available to claim by winner or by owner when roll was closed.
     */
    struct Prize {
        IERC721 collectionAddr;
        uint tokenId;
        bool claimAvailable;
    }

}

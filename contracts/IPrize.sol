// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @custom:security-contact loizage@icloud.com
interface IPrize {
    
    struct Prize {
        IERC721 collectionAddr;
        uint tokenId;
        bool claimAvailable;
    }

}

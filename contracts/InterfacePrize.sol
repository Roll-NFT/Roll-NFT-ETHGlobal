// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @custom:security-contact loizage@icloud.com
interface InterfacePrize {
    
    struct Prize {
        IERC721 collection;
        uint tokenId;
        bool available;
    }

}

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @custom:security-contact loizage@icloud.com
interface IRollAssets {
    
    struct RollAssets {
        IERC721 prizeAddress;
        uint prizeId;
        bool prizeAvailable;
        IERC20 entryToken;
        uint entryPrice;
        bool revenueAvailable;
    }

}

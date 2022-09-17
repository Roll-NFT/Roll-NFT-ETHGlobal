// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./InterfaceRollAssets.sol";

/// @custom:security-contact loizage@icloud.com
interface InterfaceRollData {
    /// 
    struct Roll {
        uint type;
        uint id;
        address host;
        uint hostRoyalty;
        uint64 endTimestamp;
        uint minParticipants;
        uint maxParticipants;
        IERC20 entryToken;
        uint entryPrice;

        InterfaceRollAssets.RollAssets Assets;

    }    
}

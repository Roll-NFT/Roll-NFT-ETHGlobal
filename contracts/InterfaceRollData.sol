// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./InterfaceRollAssets.sol";

/// @custom:security-contact loizage@icloud.com
interface IRoll {
    /// 
    struct Roll {
        uint type;
        uint id;
        InterfaceRollAssets.RollAssets Assets;

    }    
}

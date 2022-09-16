// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @custom:security-contact loizage@icloud.com
interface InterfaceRevenue {
    /// 
    struct Revenue {
        IERC20 revenueToken;
        uint entryPrice;
        uint revenueAmount;
        bool revenueAvailable;
    }    
}

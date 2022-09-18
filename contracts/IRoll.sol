// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @custom:security-contact loizage@icloud.com
interface IRoll {
    
    /**
     * @dev Structure that contain crucial Roll parameters and conditions, that are checked on Roll execution
     * 
     * @param rollType define logic to be cheked on roll execution. Determinated on Roll creatinon according to provided arguments minParticipants, maxParticipants
     * @param host address who created the Roll
     * @param rollTimestamp block that will stop Roll entries sales, and to select winner or close the Roll
     * @param minParticipants Roll participants minimum amount 
     * @param maxParticipants Roll participants maximum amount
     * @param entryToken address of erc20 token that is used to participate in that Roll
     * @param entryPrice amount to be paid to mint one participation ticket
     */
    struct Roll {
        uint rollType;
        address host;
        uint64 rollTime;
        uint minParticipants;
        uint maxParticipants;
        IERC20 participationToken;
        uint participationPrice;
    }

}

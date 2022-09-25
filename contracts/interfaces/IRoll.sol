// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @custom:security-contact loizage@icloud.com
interface IRoll {
    
    /**
     * @dev Roll statuses and possible variations
     * 
     * @param SalesOpen (Open) - Roll is on going and available to participate. Tix sales are open.
     * @param SalesClosed (Closed) - Ready to select winner. Roll is on going and is not available to participate. Tix sales are closed.
     * @param RollFinished (Succeed) - Winner selected. Roll is finished and is not available to participate. Tix sales are closed. Winner can claim the Prize. Roll owner can claim Revenue.
     * @param RollClosed (Unsucceed) - No winner selected. Roll is finished and is not available to participate. Tix sales are closed. Roll owner can withdraw the Prize. Participant can refund Tix.
     * 
     */
    enum Status {
        
        SalesOpen,
        SalesClosed,
        RollFinished,
        RollClosed

    }

    /**
     * @dev Structure that contain crucial Roll parameters and conditions, that are checked on Roll execution
     * 
     * @param rollType - define logic to be cheked on roll execution. Determinated on Roll creatinon according to provided arguments minParticipants, maxParticipants
     * @param host - address who created the Roll
     * @param rollTimestamp - block that will stop Roll entries sales, and to select winner or close the Roll
     * @param minParticipants - Roll participants minimum amount 
     * @param maxParticipants - Roll participants maximum amount
     * @param participationToken - address of erc20 token that is used to participate in that Roll
     * @param participationPrice - amount to be paid to mint one participation ticket
     */
    struct Roll {
        uint256 id;
        uint8 rollType;
        address host;
        string title;
        uint64 rollTime;
        uint256 minParticipants;
        uint256 maxParticipants;
        address participationToken;
        uint256 participationPrice;
        Status status;
        address prizeAddress;
        uint256 prizeTokenId;
        uint256 winnerTokenId; // set when winner selected. Defaul value is 0
        bool prizeClaimed; // set True - on Prize withdrawal and when winner claims the Prize. Default value is "False"
        bool revenueClaimed; // set True - on revenue claim. Default value is "False"
    }

}

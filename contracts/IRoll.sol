// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @custom:security-contact loizage@icloud.com
interface IRoll {
    
    /**
     * @dev Structure that contain crucial Roll parameters and conditions, that are checked on Roll execution
     * 
     * @param host - address who created the Roll
     * @param rollTime - block that will stop Roll entries sales, and to select winner or close the Roll
     * @param fixParticipants - Roll participants fixed amount
     * @param participationToken - address of erc20 token that is used to participate in that Roll
     * @param participationPrice - amount to be paid to mint one participation ticket
     */
    struct Roll {
        address host;
        uint256 rollTime;
        uint256 fixParticipants;
        address participationToken;
        uint256 participationPrice;
        address prizeCollection;
        uint256 prizeTokenId;
        bool prizeClaimed; // set True - on Prize withdrawal and when winner claims the Prize. Default value is "False"
        uint256 winnerTokenId; // set when winner selected. Defaul value is 0
        bool revenueClaimed; // set True - on revenue claim. Default value is "False"
    }

}

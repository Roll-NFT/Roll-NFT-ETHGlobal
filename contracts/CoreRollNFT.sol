// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CoreRollNFT {
    
    //

    // Events

    // rollCreated
    // It makes sense to provide Condition parameters, such as:
    // endTime, minTickets, maxTickets
    // Should we provide information about prize / prizes? Contract, TokenID
    event rollCreated(uint indexed rollTypeID, uint indexed rollID, address rollTicketsContract, address rollHost, address indexed prizeCollectionAddress, uint prizeTokenID);

    // mintTickets / ticketsMint / newParticipant
    // ??? What type should be amount?
    event ticketsMinted(uint indexed rollTypeID, uint indexed rollID, address rollTicketsContract, address participant, uint amount);

    // claimPrize
    // ?? Provide information about claimed NFT? address prizeCollectionAddress, uint prizeTokenID
    // ?? Provide address rollTicketsContract
    event prizeClaimed(uint indexed rollTypeID, uint indexed rollID, address winner, address indexed prizeCollectionAddress, uint prizeTokenID);

    // claimRevenue
    // ?? Provide address rollTicketsContract
    event revenueClaimed(uint indexed rollTypeID, uint indexed rollID, address rollOwner, address revenueTokenAddress, uint amount);

    // withdrawPrize - looks similar to claimPrize event
    // ?? Provide address rollTicketsContract
    event prizeWithdrawn(uint indexed rollTypeID, uint indexed rollID, address rollOwner, address indexed prizeCollectionAddress, uint prizeTokenID);

    // ticketsRefunded
    // ?? Provide address rollTicketsContract
    event ticketsRefunded(uint indexed rollTypeID, uint indexed rollID, address participant, address refundTokenAddress, uint refundAmount, uint ticketsAmount);
    
    constructor()  {
        //
    }

}
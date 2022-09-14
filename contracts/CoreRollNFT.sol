// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CoreRollNFT {
    
    /// @dev owner
    address public owner;
    /// @dev fee percentage i.e 1%(100/10000)
    uint256 public feePercent;

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
        owner = msg.sender;
    }

    /// @dev create new raffle 
    function createRoll(
        uint64 _startTime,
        uint64 _endTime,
        uint256 _minParticipants,
        uint256 _maxParticipants,
        uint256 _participationCost,
        address _participationToken,
        // Array of prizes
        IERC721 _prizeAddress,
        uint256 _prizeId
    ) external returns(Raffle raffle){
        
        /// @dev mint Roll ownership token for caller

        /// @dev deploy / clone Roll tickets contract
        
    }

}
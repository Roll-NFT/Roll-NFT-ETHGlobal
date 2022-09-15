// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./TicketsNFT.sol";
import "./IddleAssets.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CoreRollNFT {
    using Counters for Counters.Counter;

    /// @dev Current Roll ID
    Counters.Counter private _currentRollID;
    
    /// @dev Owner
    address public owner;
    /// @dev Fee percentage i.e 1%(100/10000)
    uint256 public feePercent;
    /// @dev Ticket's NFT collection contract
    address internal immutable contractTicketsTemplate;
    /// @dev Ticket's NFT collection contract
    address internal immutable contractIddleAssets;
    
    /// @dev event on successful Roll creation
    /// 
    event RollCreated(uint indexed rollType, uint indexed rollID, address ticketsContract, address rollHost, address indexed prizeAddress, uint prizeID);

    // mintTickets / ticketsMint / newParticipant
    // ??? What type should be amount?
    event TicketsMinted(uint indexed rollType, uint indexed rollID, address ticketsContract, address participant, uint amount);
    
    /// @dev announce about Roll's claimed prize
    event PrizeClaimed(uint indexed rollType, uint indexed rollID, address ticketsContract, uint256 winningTicketID, address winner, address indexed prizeAddress, uint prizeID);
    
    /// @dev announce about Roll's claimed revenue
    event RevenueClaimed(uint indexed rollType, uint rollID, address indexed rollHost, address indexed rollOwner, address tokenAddress, uint amount);
    
    /// @dev announce about withdrawn prize from unsuccessful Roll
    event PrizeWithdrawn(uint indexed rollType, uint indexed rollID, address rollHost, address rollOwner, address indexed prizeAddress, uint prizeID);
    
    /// @dev announce about refunded tickets from unsuccessful Roll
    event TicketsRefunded(uint indexed rollType, uint indexed rollID, address rollHost, address participant, address tokenAddress, uint refundAmount, uint ticketsAmount);

    // 
    event FeeSet(uint256 newFee);

    /// @dev anounce roll results
    /// ? ticketsContract / 
    event RollPlayed(bool success, uint indexed rollType, uint indexed rollID, address ticketsContract, uint256 winningTicket, address indexed prizeAddress, uint prizeID, address host, address owner);
    
    constructor()  {
        owner = msg.sender;
        contractTicketsTemplate = address(new TicketsNFT());
        contractIddleAssets = address(new IddleAssets());
    }

    /// @dev function to host (create) a new Roll 
    function createRoll(
        uint64 _startTime,
        uint64 _endTime,
        uint256 _minParticipants,
        uint256 _maxParticipants,
        uint256 _participationCost,
        address _participationToken,
        /// TODO Array of prizes
        IERC721 _prizeAddress,
        uint256 _prizeId
    ) external returns(TicketsNFT ticketsContract){
        
        /// @dev mint Roll ownership token for caller
        
        /// @dev define Roll type / variation
        /// TODO implement function
        uint rollType;

        /// @dev form abi data for Tickets NFT contract to be cloned
        /// TODO define parameters to provide
        bytes memory data = abi.encodePacked(
        );
        
        /// @dev clone Roll's Tickets NFT contract
        ticketsNFTContract = TicketsNFT(contractTicketsTemplate.clone(data));

        /// @dev initialize Roll's Tickets NFT contract
        /// @param 
        ticketsNFTContract.initialize(
            string(abi.encodePacked("Roll #",_currentRollID," tickets collection")),
            /// TODO form base URI with Roll's metadata and provide it instead of next perameters
            _prizeAddress, 
            _prizeId,
            msg.sender,
            rollType,
            _currentRollID
        );

        /// @dev transfer Prize to CoreRollNFT contract
        _prizeAddress.transferFrom(msg.sender, address(this), _prizeId);

        /// @dev approve NFT prize token to IddleAssets contract
        _prizeAddress.approve(contractIddleAssets, _prizeId);

        /// @dev transfer NFT prize token to IddleAssets contract
        _prizeAddress.transferFrom(address(this), contractIddleAssets, _prizeId);

        /// @dev emit event about hosted Roll
        emit RollCreated(rollType, _currentRollID, ticketsNFTContract, msg.sender, _prizeAddress, _prizeId);

        /// @dev increment _currentRollID
        _currentRollID.increment();

    }

    /// @dev function to participate in a Roll
    function participate(uint256 _rollType, uint256 _rollID, uint256 _amount) external {
        
        /// @dev check that sales are open
        
        /// @dev check that _amount would not overflow maxParticipants
        
        /// @dev send payment to core contract

        /// @dev send pyment to Iddle assets contract

        /// @dev mint participation tokens
        
        /// @dev get Tickets contract address
        address ticketsContract;

        /// @dev emit event about minted tickets
        /// ? add minted token IDs
        emit TicketsMinted(_rollType, _rollID, ticketsContract, msg.sender, _amount);
    
    }

    /// @dev function to claim prize from successfull Roll
    function claimPrize(uint256 _rollType, uint256 _rollID) external {
        
        /// @dev get roll details

        /// @dev check that sales are closed

        /// @dev check that roll is successful

        /// @dev check that prize is available to claim

        /// @dev get winner ticket ID

        /// @dev check that caller is a owner of winning ticket

        /// @dev send prize token to caller

        /// @dev change prize / roll status - prize claimed

        /// @dev anounce about claimed prize - where who what
        event PrizeClaimed(_rollType, _rollID, ticketsContract, winningTicketID, winner, prizeAddress, prizeID);
        
    }

    /// @dev function to claim revenue from successfull Roll
    function claimRevenue(uint256 _rollType, uint256 _rollID) external {
        
        /// @dev get roll details

        /// @dev check that caller is a owner of the Roll
        
        /// @dev check that sales are closed

        /// @dev check that roll is successful
        
        /// @dev check that revenue is available to claim

        /// @dev calculate revenue to claim
        /// @dev (participantsAmount * _participationCost)
        /// @dev include protocol fee
        
        /// @dev set revenue status to claimed

        /// @dev send revenue to caller

        /// @dev transfer fees to treasury

        /// @dev announce about Roll's claimed revenue - where who what
        emit RevenueClaimed(_rollType, _rollID, rollHost, rollOwner, tokenAddress, amount);

    }

    /// @dev function to withdraw prize from unsuccessful Roll
    function withdrawPrize(uint256 _rollType, uint256 _rollID) external {
        
        /// @dev get roll details

        /// @dev check that caller is a owner of the Roll
        
        /// @dev check that sales are closed

        /// @dev check that roll is unsuccessful
        
        /// @dev check that prize is available to withdraw

        /// @dev send prize token to caller
        
        /// @dev set prize status to unavailable to withdraw / claimed 

        /// @dev announce about withdrawn prize from unsuccessful Roll - where who what
        emit PrizeWithdrawn(_rollType, _rollID, rollHost, rollOwner, prizeAddress, prizeID);

    }

    /// @dev function to refund tickets from unsuccessful Roll
    function refundTickets(uint256 _rollType, uint256 _rollID, uint256[] calldata _ticketIds) external {
        
        /// @dev get roll details

        /// @dev check that sales are closed

        /// @dev check that roll is unsuccessful
        
        /// @dev Potentially:
        /// @dev get list of ticket's IDs belonging to caller
        /// @dev otherwise that provided ticket's IDs are belonging to caller

        /// @dev burn tokens

        /// @dev calculate amount to refund
        /// @dev (ticketsAmount * _participationCost)
        
        /// @dev send refund to caller

        /// @dev announce about refunded tickets from unsuccessful Roll
        emit TicketsRefunded(_rollType, _rollID, rollHost, msg.sender, tokenAddress, refundAmount, ticketsAmount);

    }

    /// @dev function to define a winner

    /// @dev set fee
    function setFee(uint256 _newFee) external {
        if(owner != msg.sender){ 
            revert();
        }
        feePercent = _newFee;
        emit FeeSet(_newFee);
    }

}
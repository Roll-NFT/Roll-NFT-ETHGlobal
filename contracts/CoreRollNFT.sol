// SPDX-License-Identifier: UNLICENSED
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
    event RollCreated(uint indexed rollTypeID, uint indexed rollID, address rollTicketsContract, address rollHost, address indexed prizeAddress, uint prizeID);

    // mintTickets / ticketsMint / newParticipant
    // ??? What type should be amount?
    event TicketsMinted(uint indexed rollTypeID, uint indexed rollID, address rollTicketsContract, address participant, uint amount);

    // claimPrize
    // ?? Provide information about claimed NFT? address prize's Collection Address, uint prize's Token ID
    // ?? Provide address rollTicketsContract
    event PrizeClaimed(uint indexed rollTypeID, uint indexed rollID, address winner, address indexed prizeAddress, uint prizeID);

    // claimRevenue
    // ?? Provide address rollTicketsContract
    event RevenueClaimed(uint indexed rollTypeID, uint indexed rollID, address rollOwner, address revenueTokenAddress, uint amount);

    // withdrawPrize - looks similar to claimPrize event
    // ?? Provide address rollTicketsContract
    event PrizeWithdrawn(uint indexed rollTypeID, uint indexed rollID, address rollOwner, address indexed prizeAddress, uint prizeID);

    // ticketsRefunded
    // ?? Provide address rollTicketsContract
    event TicketsRefunded(uint indexed rollTypeID, uint indexed rollID, address participant, address refundTokenAddress, uint refundAmount, uint ticketsAmount);

    // 
    event FeeSet(uint256 newFee);
    
    constructor()  {
        owner = msg.sender;
        contractTicketsTemplate = address(new TicketsNFT());
        contractIddleAssets = address(new IddleAssets());
    }

    /// @dev create new raffle 
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
        uint rollTypeID;

        /// @dev form abi data for Tickets NFT contract to be cloned
        /// TODO define parameters to provide
        bytes memory data = abi.encodePacked(
        );
        
        /// @dev clone Roll's Tickets NFT contract
        ticketsNFTContract = TicketsNFT(contractTicketsTemplate.clone(data));

        /// @dev initialize Roll's Tickets NFT contract
        ticketsNFTContract.initialize(
            string(abi.encodePacked("Roll #",_currentRollID," tickets collection")),
            string(abi.encodePacked("RTC")),
            _prizeAddress, 
            _prizeId,
            msg.sender,
            rollTypeID,
            _currentRollID
        );

        /// @dev transfer Prize to CoreRollNFT contract
        _prizeAddress.transferFrom(msg.sender, address(this), _prizeId);

        /// @dev approve NFT prize token to IddleAssets contract
        _prizeAddress.approve(contractIddleAssets, _prizeId);

        /// @dev transfer NFT prize token to IddleAssets contract
        _prizeAddress.transferFrom(address(this), contractIddleAssets, _prizeId);

        /// @dev emit event about hosted Roll
        emit RollCreated(rollTypeID, _currentRollID, ticketsNFTContract, msg.sender, _prizeAddress, _prizeId);

        /// @dev increment _currentRollID
        _currentRollID.increment();

    }

    /// @dev set fee
    function setFee(uint256 _newFee) external {
        if(owner != msg.sender){ 
            revert();
        }
        feePercent = _newFee;
        emit FeeSet(_newFee);
    }

}
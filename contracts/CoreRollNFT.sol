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
    event RollCreated(uint indexed rollType, uint indexed rollID, address ticketsContract, address rollHost, address indexed prizeAddress, uint prizeID);

    // mintTickets / ticketsMint / newParticipant
    // ??? What type should be amount?
    event TicketsMinted(uint indexed rollType, uint indexed rollID, address ticketsContract, address participant, uint amount);
    
    // claimPrize
    // ?? Provide information about claimed NFT? address prize's Collection Address, uint prize's Token ID
    // ?? Provide ticketsContract address
    event PrizeClaimed(uint indexed rollType, uint indexed rollID, address winner, address indexed prizeAddress, uint prizeID);
    
    // claimRevenue
    // ?? Provide ticketsContract address
    event RevenueClaimed(uint indexed rollType, uint indexed rollID, indexed address rollOwner, address tokenAddress, uint amount);
    
    // withdrawPrize - looks similar to claimPrize event
    // ?? Provide ticketsContract address
    event PrizeWithdrawn(uint indexed rollType, uint indexed rollID, address rollOwner, address indexed prizeAddress, uint prizeID);
    
    // ticketsRefunded
    // ?? Provide ticketsContract address
    event TicketsRefunded(uint indexed rollType, uint indexed rollID, address participant, address tokenAddress, uint refundAmount, uint ticketsAmount);

    // 
    event FeeSet(uint256 newFee);

    /// @dev event emited upon winner definition
    /// ? ticketsContract / 
    event WinnerRolled(uint indexed rollType, uint indexed rollID, address ticketsContract, uint256 winningTicket, address indexed prizeAddress, uint prizeID, address host, address owner);
    
    constructor()  {
        owner = msg.sender;
        contractTicketsTemplate = address(new TicketsNFT());
        contractIddleAssets = address(new IddleAssets());
    }

    /// @dev host a Roll 
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

    /// @dev participate in Roll
    function participate(uint256 _rollType, uint256 _rollID, uint256 _amount) external {
        
        /// @dev check that sales are open
        
        /// @dev check that _amount would not overflow maxParticipants
        
        /// @dev send payment to core contract

        /// @dev send pyment to Iddle assets contract

        /// @dev mint participation tokens
        
        /// @dev get Tickets contract address
        address ticketsContract;

        /// @dev emit event about minted tickets
        emit TicketsMinted(_rollType, _rollID, ticketsContract, msg.sender, _amount);
    
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
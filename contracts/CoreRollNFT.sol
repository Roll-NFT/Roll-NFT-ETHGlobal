// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./RollTickets.sol";
import "./IddleAssets.sol";
import "./IRoll.sol"; // IRoll.Roll IRoll.Status
import "./IPrize.sol"; // IPrize.Prize
import "./IRollAssets.sol"; // IRollAssets.RollAssets
import "./RollOwnershipToken.sol"; // RollOwnershipToken.

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @custom:security-contact loizage@icloud.com
contract CoreRollNFT is Pausable, Ownable, Context {
    using Counters for Counters.Counter;

    /// @dev Roll ID counter
    Counters.Counter private _rollIdCounter;
    
    /// @dev Fee percentage i.e 1%(100/10000)
    uint256 public protocolFee;
    
    /// @dev Wirefram - Ticket's (Tix) NFT collection contract 
    IERC721 internal immutable contractTicketsTemplate;
    
    /**
     * @dev Contract that will hold assets
     * To implement logic for assets in future
     */
    address internal immutable contractIddleAssets;
    
    /**
     * @dev Contract that is ERC721 NFT collection of Roll Ownership Tokens (ROT)
     */
    address internal immutable contractRollOwnershipToken;

    /**
     * @dev Mapping rollId to tixContract
     * 
     * @notice To get anddress of NFT smart contract of Tickets for provided Roll ID
     */
    mapping (uint => IERC721) ticketsAddr;
    
    /**
     * @dev Mapping rollId to Roll data
     * 
     * @notice To get Roll data for provided Roll ID
     */
    mapping (uint => IRoll.Roll) rolls;
    
    /**
     * @dev Mapping rollId to Prize data
     * 
     * @notice To get Prize data for provided Roll ID
     */
    mapping (uint => IPrize.Prize) prizes;
    
    /// @dev announce about successful Roll creation
    event RollCreated(uint256 indexed rollType, uint256 indexed rollID, address ticketsContract, address rollHost, address indexed prizeAddress, uint prizeID, uint256 minParticipants, uint256 maxParticipants, uint256 rollTime, address paymentToken, uint256 entryPrice);
    
    /// @dev announce about Roll's new participants / minted tickets
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
    
    constructor() {
        owner = msg.sender;
        contractTicketsTemplate = address(new RollTickets());
        contractIddleAssets = address(new IddleAssets());
    }

    /**
     * @dev set _paused state of the contract to True
     * @dev has modifier whenNotPaused
     * 
     * @notice Trigger pause. The contract must not be paused.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev set _paused state of the contract to False
     * @dev has modifier whenPaused
     * 
     * @notice Lift pause. The contract must be paused.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /// @dev function to host (create) a new Roll 
    function createRoll(
        uint64 _rollTime,
        uint _minParticipants,
        uint _maxParticipants,
        uint _participationPrice,
        IERC20 _participationToken,
        IERC721 _prizeAddress,
        uint _prizeId
    ) external returns(TicketsNFT ticketsContract){

        /// @dev check that _prizeAddress is set and is not 0
        require(_prizeAddress != address(0), 'Missing Prize collection address')

        /// @dev check that _prizeAddress is set and is not 0
        require(_participationToken != address(0), 'Missing participation token address')

        /// @dev check that _rollTime is provided and is in future
        require(_rollTime > 0 && _rollTime > block.timestamp, 'End time should be in feature')

        /// @dev define host
        address host = _msgSender();
        
        /// @dev transfer NFT prize to CoreRollNFT contract
        _prizeAddress.transferFrom(msg.sender, address(this), _prizeId);

        /// @dev approve NFT prize token to IddleAssets contract
        _prizeAddress.approve(contractIddleAssets, _prizeId);

        /// @dev transfer NFT prize token to IddleAssets contract
        _prizeAddress.transferFrom(address(this), contractIddleAssets, _prizeId);

        /// @dev declare rollType variable
        uint rollType;

        /// @dev define Roll type / variation
        if (_maxParticipants == 0) {
            
            if (_minParticipants == 0) {
                rollType = 1;
            } else {
                rollTyoe = 2;
            }

        } else {
            require(_maxParticipants > _minParticipants)

            if (_minParticipants == 0) {
                rollType = 3;
            } else {
                rollTyoe = 4;
            }
            
        }
        
        /// @dev increment Roll ID counter
        _rollIdCounter.increment();

        /// @dev get current Roll ID
        uint rollId = _rollIdCounter.current();

        /**
         * @dev define and store Prize structure to prizes mapping
         * 
         * @dev Structure that contain crucial Roll parameters and conditions, that are checked on Roll execution
         * 
         * @param collectionAddr NFT collection address of the Prize
         * @param tokenId Prize token ID
         * @param claimAvailable True when prize available to claim by winner or by owner when roll was closed.
         */
        prizes[rollId] = IPrize.Prize(_prizeAddress, _prizeId, false);

        /**
         * @dev get rollURI
         * TODO
         * 
         * @param rollType
         * @param host
         * @param rollTimestamp
         * @param minParticipants
         * @param maxParticipants
         * @param 
         */
        string memory rollURI = 'rollURI';
        
        /// @dev mint Roll ownership token for caller
        rollToken().safeMint(host, rollId, rollURI)
        
        /// @dev clone tickets NFT contract
        address ticketsNFTContract = cloneTicketsContract(rollId, rollURI);

        /// @dev store tickets NFT contract address at ticketsAddr mapping
        ticketsAddr[rollId] = ticketsNFTContract;

        /// @dev define and store Roll structure to rolls mapping
        rolls[rollId] = IRoll.Roll(rollType, host, _rollTime, _minParticipants, _maxParticipants, _participationToken, _participationPrice, IRoll.Status.SalesOpen);
        
        /// @dev emit event about hosted Roll
        emit RollCreated(rollType, rollId, ticketsNFTContract, msg.sender, _prizeAddress, _prizeId, minParticipants, maxParticipants, rollTime, paymentToken, entryPrice);

    }

    /// @dev function to participate in a Roll
    function participate(uint256 _rollType, uint256 _rollID, uint256 _ticketsAmount, address paymentToken,uint256 _tokenAmoun) external {
        
        /// @dev check that sales are open
        
        /// @dev check that _ticketsAmount would not overflow maxParticipants
        
        /// @dev send payment to core contract

        /// @dev send payment to Iddle assets contract

        /// @dev mint participation tokens
        
        /// @dev get Tickets contract address
        address ticketsContract;

        /// @dev emit event about minted tickets
        /// ??? add minted token IDs
        /// ??? emit event for every minted token
        emit TicketsMinted(_rollType, _rollID, ticketsContract, msg.sender, _amount);
    
    }

    /// @dev function to claim prize from successfull Roll
    function claimPrize(uint256 _rollType, uint256 _rollID, uint256 _ticketID) external {
        
        /// @dev get roll details

        /// @dev check that sales are closed

        /// @dev check that roll is successful

        /// @dev check that prize is available to claim

        /// @dev get winner ticket ID

        /// @dev check that provided ticket is a winning ticket

        /// @dev check that caller is a owner of winning ticket

        /// @dev burn winning ticket

        /// @dev send prize token to caller

        /// @dev change prize / roll status - prize claimed

        /// @dev anounce about claimed prize - where who what
        event PrizeClaimed(_rollType, _rollID, ticketsContract, winningTicketID, msg.sender, prizeAddress, prizeID);
        
    }

    /// @dev function to claim revenue from successfull Roll
    function claimRevenue(uint256 _rollType, uint256 _rollID) external {
        
        /// @dev get roll details

        /// @dev check that sales are closed

        /// @dev check that roll is successful
        
        /// @dev check that revenue is available to claim

        /// @dev check that caller is a owner of the Roll

        /// @dev burn ownership token
        rollToken().burn(_rollID);
        
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
        
        /// @dev check that owner's assets are available to withdraw

        /// @dev burn roll ownership token
        rollToken().burn(_rollID);
        
        /// @dev send prize token to caller
        
        /// @dev set owner's assets status to unavailable to withdraw / claim

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
        rollToken().burn(_rollID);

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

    /// @dev get Roll ownership NFT contract address
    function getRollToken() public pure returns(IERC721){
        return IERC721(contractRollOwnershipToken);
    }

    /// @dev get Roll tickets NFT contract address
    function getTicketsAddr(uint _rollId) public pure return(IERC721){
        return IERC721(ticketsAddr[_rollId]);
    }

    /// @dev 
    function cloneTicketsContract(string memory rollURI) {
        
        /// @dev form abi data for Tickets NFT contract to be cloned
        /// TODO define parameters to provide
        bytes memory data = abi.encodePacked(
        );
        
        /// @dev clone Roll's Tickets NFT contract
        ticketsNFTContract = TicketsNFT(contractTicketsTemplate.clone(data));

        /**
         * @dev get current roll ID
         */
        

        /// @dev initialize Roll's Tickets NFT contract
        /// @param 
        ticketsNFTContract.initialize(
            string(abi.encodePacked("Roll #",rollId," tickets collection")),
            /// TODO form base URI with Roll's metadata and provide it instead of next perameters
            _prizeAddress, 
            _prizeId,
            msg.sender,
            rollType,
            rollId
        );

    }
}
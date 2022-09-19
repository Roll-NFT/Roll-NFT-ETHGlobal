// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import {ClonesWithImmutableArgs} from "clones-with-immutable-args/ClonesWithImmutableArgs.sol";
import "./TicketsContract.sol";
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
    using ClonesWithImmutableArgs for address;

    /**
     * @dev declare Roll tickets contract implementation to be cloned
     * That contract will be cloned with immutable arguments pattern implementation
     */
    TicketsContract public implementationTickectsContract;

    /// @dev Roll ID counter
    Counters.Counter private _rollIdCounter;
    
    /**
     *  @dev Fee percentage i.e 1%(100/10000)
     * 
     *  @notice percentage fee that applied when Roll owner claim Revenue
     */
    uint256 public protocolFee;
    
    /// @dev Wirefram - Ticket's NFT collection contract 
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

    /**
     * @dev anounce about closed Roll (unsucceed)
     * 
     * @notice Announced when Roll conditions are not met. There is no winner selected. Prize is available to withdraw by Roll owner. Tickets are available to refund to participants.
     * 
     * @param rollType - Roll type, defines Roll executinion logic
     * @param rollID - Roll ID, unique number of every Roll and it's ownership token
     * @param ticketsContract - tickets collection address, for participants to be informed that they have tickets in the collection to refund
     * @param owner - Roll owner address, for owner to be informed that Prize is available to withdraw
     * @param prizeAddress - Prize token collection address
     * @param prizeID - Prize token ID
     */
    event RollClosed(uint rollType, uint rollID, address indexed ticketsContract, address indexed owner, address indexed prizeAddress, uint prizeID);
    
    /**
     * @dev announce about successfuly finished Roll
     * 
     * @notice Announced when Roll conditions are met. Winning token is selected. Prize is available to claim by winning token owner. Revenue available to claim by Roll owner.
     * 
     * @param rollType - Roll type, defines Roll executinion logic
     * @param rollID - Roll ID, unique number of every Roll and it's ownership token
     * @param winnerToken - Winner token ID
     * @param winnerAddr - Winner token owner's address, for winner to be informed that Prize is available to claim
     * @param owner - Roll owner address, for owner to be informed that Revenue is available to claim
     * @param ticketsContract - tickets collection address, for participants to be informed that they have tickets in the collection to refund
     * @param host - Roll host address
     */
    event RollFinsihed(uint rollType, uint rollID, uint winnerToken, address winnerAddr, address owner, address ticketsContract, address host);
    
    constructor(TicketsContract _implementationTickectsContract;) {
        owner = msg.sender;
        implementationTickectsContract = _implementationTickectsContract;
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
    ) external returns(TicketsContract ticketsContract){

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

        /// @dev form Roll URI
        string memory rollURI = getRollURI(rollId, rollType, host, _rollTime, _minParticipants, _maxParticipants, _prizeAddress, _prizeId);
        
        /// @dev mint Roll ownership token for caller
        rollToken().safeMint(host, rollId, rollURI)
        
        /// @dev clone tickets NFT contract
        address TicketsContract = cloneTicketsContract(rollId, rollURI);

        /// @dev store tickets NFT contract address at ticketsAddr mapping
        ticketsAddr[rollId] = TicketsContract;

        /// @dev define and store Roll structure to rolls mapping
        rolls[rollId] = IRoll.Roll(rollType, host, _rollTime, _minParticipants, _maxParticipants, _participationToken, _participationPrice, IRoll.Status.SalesOpen);
        
        /// @dev emit event about hosted Roll
        emit RollCreated(rollType, rollId, TicketsContract, msg.sender, _prizeAddress, _prizeId, minParticipants, maxParticipants, rollTime, paymentToken, entryPrice);

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

    /**
     * @dev 
     */
    function cloneTicketsContract(uint _rollId, string memory _rollURI) internal {
        
        /// @dev form abi data for Tickets NFT contract to be cloned
        /// TODO define parameters to provide
        bytes memory data = abi.encodePacked(
            _rollId,
            _rollURI
        );
        
        /// @dev clone Roll's Tickets NFT contract
        ticketsContract = TicketsNFT(contractTicketsTemplate.clone(data));
        implementationTickectsContract
        clone = ExampleClone(address(implementation).clone(data));

        /// @dev initialize Roll's Tickets NFT contract
        /// @param 
        ticketsContract.initialize(
            string(abi.encodePacked("Roll #",rollId," tickets collection")),
            /// TODO form base URI with Roll's metadata and provide it instead of next perameters
            
        );

    }

    /**
     * @dev Function that creates Roll metadata and forms URI
     * 
     * @param rollId
     * @param rollType
     * @param host
     * @param _rollTime
     * @param _minParticipants
     * @param _maxParticipants
     * @param _prizeAddress, 
     * @param _prizeId,
     * 
     * @return 
     */
    function makeRollURI(
        uint _rollId,
        uint _rollType,
        address _host,
        uint64 _rollTime,
        uint _minParticipants,
        uint _maxParticipants,
        IERC721 _prizeAddress,
        uint _prizeId
    ) internal returns(string memory rollURI) {
        
        /// @dev create Tableland table with Roll metadata
        /// TODO

    };

    /**
     * @dev function that return Roll URI according to provided Roll ID
     */
    function getRollURI(uint _rollId) public view pure return(string memory rollURI) {
        
        /// @dev get tickets contract address
        tickets


    }
        
}
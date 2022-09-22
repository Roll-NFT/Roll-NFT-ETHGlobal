// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IERC721RollToken.sol";
import "./IERC721RollTicket.sol";
import "./RollParticipationToken.sol";
import "./RollOwnershipToken.sol";
import "./IRoll.sol";
import "./TreasuryRollNFT.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @custom:security-contact loizage@icloud.com
contract CoreRollNFT is Pausable, Ownable, Context {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using Strings for uint256;

    /**
     * @dev declare Roll tickets contract implementation to be cloned
     * That contract will be cloned with immutable arguments pattern implementation
     */
    // TicketsContract public implementationTickectsContract;

    /// @dev Roll ID counter
    Counters.Counter private _rollIdCounter;
    
    /**
     *  @dev Fee percentage i.e 1%(100/10000)
     * 
     *  @notice percentage fee that applied when Roll owner claim Revenue
     */
    uint256 public revenuePercentageFee;
    
    /// @dev Wirefram - Ticket's NFT collection contract 
    // IERC721 internal immutable contractTicketsTemplate;
    
    /**
     * @dev Contract that will hold assets
     * To implement logic for assets in future
     */
    address public immutable contractIddleAssets;

    /**
     * @dev Contract that will hold and operate with treasury assets
     */
    address public immutable contractTreasury;
    
    /**
     * @dev Roll ownership Token collection (ROLT) - ERC721 contract
     * 
     * Minted:
     * - To host on Roll creation
     * 
     * Burned:
     * - On claiming Revenue
     * - On prize withdrawal
     * 
     * @notice Roll ownership Token collection (ROLT) address
     */
    address public immutable rollOwnershipToken;

    /**
     * @dev Mapping rollId to tixContract
     * 
     * @notice To get anddress of NFT smart contract of Tickets for provided Roll ID
     */
    mapping (uint => address) ticketsAddr;
    
    /**
     * @dev Mapping rollId to Roll data
     * 
     * @notice Store Roll data for provided Roll ID
     */
    mapping (uint => IRoll.Roll) rolls;
    
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

    /// @dev announce about updated Revenue fee
    event RevenueFeeUpdated(uint256 newFee, uint256 oldFee);
    
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
    event RollClosed(uint rollType, uint indexed rollID, address indexed prizeAddress, uint prizeID);
    // address indexed ticketsContract, address indexed owner
    
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
    
    /**
     * @dev Set the owner 
     * 
     * @param baseTokenURI - to set base token URI for Roll ownership tokens
     */
    constructor(
        string memory _baseTokenURI,
        uint256 _revenueFee
    ) {
        /**
         * @dev Deploy Roll ownership Token contract and save it's address
         * 
         * @param _baseTokenURI - Roll ownership token Base URI
         * @param _msgSender - address to grant MANAGER_ROLE
         */
        rollOwnershipToken = address(new RollOwnershipToken(_baseTokenURI,_msgSender()));
        
        /**
         * @dev Deploy Treasury contract and save it's address
         * 
         * @param _msgSender - address to grant MANAGER_ROLE
         */
        contractTreasury = address(new TreasuryRollNFT(_msgSender()));

        /// @dev set initial Revenue fee
        /// TODO use internal function instead
        revenuePercentageFee = _revenueFee;
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
        /// To start first Roll with ID 1
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
        /// TODO
        string memory rollURI = makeRollURI(rollId, rollType, host, _rollTime, _minParticipants, _maxParticipants, _prizeAddress, _prizeId);
        
        /// @dev mint Roll ownership token for caller
        getRollTokenContract().safeMint(host, rollId, rollURI);
        
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
        require(_msgSender() == roll.prizeCollection.ownerOf(roll.winnerTokenId), "CoreRollNFT: Should be an owner of winning token to claim Roll Prize");

        /// @dev burn winning ticket

        /// @dev send prize token to caller

        /// @dev change prize / roll status - prize claimed

        /// @dev anounce about claimed prize - where who what
        event PrizeClaimed(_rollType, _rollID, ticketsContract, winningTicketID, msg.sender, prizeAddress, prizeID);
        
    }

    /**
     * @dev function to claim revenue from successfull Roll
     * 
     * TODO UPDATE DOC
     * 
     * Return true on successful operation
     */
    function claimRevenue(uint256 _rollType, uint256 _rollID) public returns (bool) {

        /// @dev check that caller is a owner of the Roll
        require(_msgSender() == getRollTokenContract().ownerOf(_rollID), "CoreRollNFT: Caller should be the Roll owner to claim Revenue");

        /// @dev get Roll parameters structure
        var roll = rolls[_rollID];

        /// @dev check that Roll status is "RollFinished"
        require(roll.status == IRoll.Status.RollFinished, "CoreRollNFT: Roll status should be RollFinished to claim Revenue");

        /// @dev check that revenue is available to claim
        require(!roll.revenueClaimed, "CoreRollNFT: Revenue available to claim only once");

        /// @dev set revenue status to claimed
        roll.revenueClaimed = true;

        /// @dev burn Roll ownership token
        getRollTokenContract().burn(_rollID);

        /// @dev calculate Revenue to claim
        uint256 revenue = calculateRevenue(getRollTicketsContract(_rollID).totalSupply(), roll.participationPrice);
        
        /// @dev calculate Revenue fee
        uint256 fee = calculateRevenueFee(revenue);

        /// @dev calculate total amount to be claimed
        uint256 total = revenue.sub(fee);

        /**
         * @dev send revenue to caller
         * 
         * roll.participationToken is IERC20
         */
        roll.participationToken.transfer(_msgSender(), fee);
        
        /**
         * @dev transfer fees to treasury
         * 
         * roll.participationToken is IERC20
         */
        roll.participationToken.transfer(getTreasuryContract(), fee);

        /// @dev announce about Roll's claimed revenue - where who what
        /// TODO REWORK EVENT
        emit RevenueClaimed(_rollType, _rollID, rollHost, rollOwner, tokenAddress, amount);

        return true;

    }

    /**
     * @dev function to withdraw prize from Closed (unsuccessful) Roll
     * 
     * TODO UPDATE DOC
     * 
     * Return true on successful operation
     */
    function withdrawPrize(uint256 _rollType, uint256 _rollID) public returns(bool) {
        
        /// @dev get Roll parameters structure
        var roll = rolls[_rollID];

        /// @dev check that caller is a owner of the Roll
        require(_msgSender() == getRollTokenContract().ownerOf(_rollID), "CoreRollNFT: Caller should be the Roll owner to withdraw Prize asset");

        /// @dev check that Roll status is "RollClosed"
        require(roll.status == IRoll.Status.RollClosed, "CoreRollNFT: Roll status should be RollClosed to withdraw Prize asset");

        /// @dev check that Prize assets are available to withdraw
        require(!roll.prizeClaimed, "CoreRollNFT: Prize available to withdraw only once");

        /// @dev burn Roll ownership token
        getRollTokenContract().burn(_rollID);
        
        /**
         * @dev send Prize asset to caller
         * 
         * roll.prizeCollection - IERC721
         */
        roll.prizeCollection.safeTransferFrom(address(this), _msgSender(), roll.prizeTokenId);
        
        /// @dev set Prize status to "Claimed"
        roll.prizeClaimed = true;

        /// @dev announce about withdrawn prize from unsuccessful Roll - where who what
        /// TODO REWORK EVENT
        emit PrizeWithdrawn(_rollType, _rollID, rollHost, rollOwner, prizeAddress, prizeID);

        return true;

    }

    /**
     * @dev refund tickets for Closed Roll
     * 
     * Return true on successful operation
     * 
     * TODO UPDATE DESCRIPTION
     * 
     * TODO implememnt Multi Call pattern on backend for banch refund
     */
    function refundParticipation(uint256 _rollType, uint256 _rollID, uint256 _ticketId) public returns(bool) {
        
        /// @dev get Roll parameters structure
        var roll = rolls[_rollID];

        /// @dev check that Roll status is "RollClosed"
        require(roll.status == IRoll.Status.RollClosed, "CoreRollNFT: Roll status should be RollClosed to refund Participation price");

        /// @dev check that caller is a owner of the _ticketId
        require(_msgSender() == getRollTicketsContract(_rollID).ownerOf(_ticketId), "CoreRollNFT: Caller should be the _ticketId owner to refund Participation price");

        /// @dev burn Participation tokens
        getRollTicketsContract(_rollID).burn(_ticketId);
        
        /**
         * @dev send Participation amount to caller
         * 
         * roll.participationToken - IERC20
         */
        roll.participationToken.transfer(_msgSender(), roll.participationPrice);

        /// @dev announce about refunded tickets from unsuccessful Roll
        emit TicketsRefunded(_rollType, _rollID, rollHost, msg.sender, tokenAddress, refundAmount, ticketsAmount);

        return true;

    }

    /**
     * @dev set Revenue fee represented in %
     * 
     * 1 = 0.01%
     * 10 = 0.1%
     * 100 = 1%
     * 1000 = 10%
     * 10000 = 100%
     * 
     * @notice Set percentage Revenue fee. 10% = 1000
     * @param _fee - new percentage Revenue fee value
     */
    function setPercentageRevenueFee(uint256 _fee) public onlyOwner {
        uint256 oldValue = revenuePercentageFee;
        revenuePercentageFee = _fee;
        emit RevenueFeeUpdated(_fee, oldValue);
    }

    /**
     * @dev get Roll ownership NFT contract address
     * 
     * That implements interface {IERC721Roll - safeMint, burn}
     */
    function getRollTokenContract() internal pure returns(IERC721RollToken){
        return IERC721RollToken(rollOwnershipToken);
    }

    /// 
    /**
     * @dev get Roll tickets NFT contract address
     * 
     * That implements interface {IERC721Roll - safeMint, burn}
     */
    function getRollTicketsContract(uint _rollId) internal pure returns(IERC721RollTicket){
        return IERC721RollTicket(ticketsAddr[_rollId]);
    }

    /**
     * @dev get Roll NFT treasury contract address
     * 
     * TODO MENTION INTERFACE
     */
    function getTreasuryContract() internal pure returns(address) {
        return contractTreasury;
    }

    /**
     * @dev deploy Roll participation token contract for the _rollId
     * 
     * @param _rollId - Roll ID
     * @param _rollURI - Roll metadata URI
     * 
     * @return address of newly deployed tickets contract
     */
    function cloneTicketsContract(uint256 _rollId, string memory _rollURI) internal returns(address) {
        
        /// TODO IMPLEMENT CLONING PATTERN

        /// @dev deploy ERC721 Roll participation token contract
        return address(new RollParticipationToken(_rollId, _rollURI);

    }

    /**
     * @dev Function that creates Roll metadata and forms URI
     * 
     * TODO UPDATE DESCRIPTION
     * 
     * @param rollId
     * @param rollType
     * @param host
     * @param _rollTime
     * @param _minParticipants
     * @param _maxParticipants
     * @param _participationToken
     * @param _participationPrice
     * @param _prizeAddress 
     * @param _prizeId 
     * @param _ticketsContract - Roll tickets collection address
     * 
     * @return - URI address to Roll metadata
     */
    function makeRollURI(
        uint256 _rollId,
        uint256 _rollType,
        address _host,
        uint64 _rollTime,
        uint256 _minParticipants,
        uint256 _maxParticipants,
        IERC20 _participationToken,
        uint256 participationPrice
        IERC721 _prizeAddress,
        uint256 _prizeId,
        IERC721RollTicket _ticketsContract
    ) internal returns(string memory rollURI) {
        
        /// TODO FINISH FUNCTION IMPLEMENTATION
        
        /// @dev create Tableland table with Roll metadata

        /// @dev Do we want to add Tickets collection address to metadata after creating one?

        /// @dev we need to do it step by step. Since we want to provide URI to tickets contract 

    };

    /**
     * @dev function that return Roll URI according to provided Roll ID
     * 
     * TODO UPDATE DESCRIPTION
     */
    function getRollURI(uint256 _rollId) public view pure returns(string memory rollURI) {
        
        /// @dev get tickets contract address
        tickets


    }

    /**
     * @dev return Fee amount that will be applied to Revenue amount
     * 
     * revenue * revenuePercentageFee / 10000
     * 
     * @notice Calculates fee that will be applied to provided Revenue amount
     * 
     * @param revenue - collected revenue amount
     */
    function calculateRevenueFee(uint256 revenue) public view returns(uint256) {
        
        return (revenue.mul(revenuePercentageFee)).div(10000);

    }

    /**
     * @dev return Revenue amount collected from Roll participants
     * 
     * Participants amount * Participation price
     * Participants amount could be know by getting Ticket's contract totalSupply
     * 
     * @param _participantsAmount - Amount of participants
     * @param _participationPrice - Participation price
     * 
     * @notice Calculate total revenue according to Participants amount and Participation price
     */
    function calculateRevenue(uint256 _participantsAmount, uint256 _participationPrice) public view returns(uint256) {
        
        return _participantsAmount.mul(roll.participationPrice);
    }

    /**
     * TODO IERC721Receiver-onERC721Received
     */

    /**
     * TODO Function to select a winner
     */

}
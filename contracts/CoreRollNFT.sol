// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IERC721RollToken.sol";
import "./IERC721RollTicket.sol";
import "./RollParticipationToken.sol";
import "./RollOwnershipToken.sol";
import "./IRoll.sol";
import "./TreasuryRollNFT.sol";

/**
 * @dev Chainlink VRF imports
 * 
 * TODO Solve npm install conflicts. Install it properly. Update imports.
 */

import "./ChainlinkVRF/VRFConsumerBaseV2.sol";


// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @custom:security-contact loizage@icloud.com
contract CoreRollNFT is Pausable, AccessControlEnumerable, Context, VRFConsumerBaseV2 {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using Strings for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    /// @dev Roll ID counter
    Counters.Counter private _rollIdCounter;
    
    /**
     *  @dev Fee percentage i.e 1%(100/10000)
     * 
     *  @notice percentage fee that applied when Roll owner claim Revenue
     */
    uint256 public revenuePercentageFee;
    
    /**
     * @dev Contract that will hold assets
     * To implement logic for assets in future
     */
    address public immutable contractIddleAssets;

    /**
     * @dev Contract that will hold and operate with treasury assets. Such as Revenue fee and unclaimed assets.
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
     * @dev Mapping rollId to RollParticipationToken contract address
     * 
     * @notice To get Participation token (tickets) contract anddress for provided Roll ID
     */
    mapping (uint256 => address) ticketsAddr;
    
    /**
     * @dev Mapping rollId to Roll parameters structure
     * 
     * @notice To get Roll parameters for provided Roll ID
     */
    mapping (uint256 => IRoll.Roll) rolls;
    
    /// @dev announce about successful Roll creation
    // event RollCreated(uint8 indexed rollType, uint256 indexed rollID, address ticketsContract, address rollHost, address indexed prizeAddress, uint256 prizeID, uint256 minParticipants, uint256 maxParticipants, uint256 rollTime, address paymentToken, uint256 entryPrice);
    event RollCreated(uint256 indexed rollID, address indexed rollHost, address indexed prizeAddress);
    
    /// @dev announce about new participant (participation token minted)
    // event NewParticipant(uint8 indexed rollType, uint256 indexed rollID, address ticketsContract, address participant, uint256 amount);
    // event NewParticipant(uint256 indexed rollID, uint256 indexed participantId, address indexed participant);
    event NewParticipant(uint256 _rollID, uint256 ticketId, address participant);
    
    /// @dev announce about Roll's claimed prize
    event PrizeClaimed(uint8 indexed rollType, uint256 indexed rollID, address ticketsContract, uint256 winningTicketID, address winner, address indexed prizeAddress, uint256 prizeID);
    
    /// @dev announce about Roll's claimed revenue
    event RevenueClaimed(uint8 indexed rollType, uint256 rollID, address indexed rollHost, address indexed rollOwner, address tokenAddress, uint256 amount);
    
    /// @dev announce about withdrawn prize from unsuccessful Roll
    event PrizeWithdrawn(uint8 indexed rollType, uint256 indexed rollID, address rollHost, address rollOwner, address indexed prizeAddress, uint256 prizeID);
    
    /// @dev announce about refunded tickets from unsuccessful Roll
    event TicketsRefunded(uint8 indexed rollType, uint256 indexed rollID, address rollHost, address participant, address tokenAddress, uint256 refundAmount, uint256 ticketsAmount);

    /// @dev announce about updated Revenue fee
    event RevenueFeeUpdated(uint256 newFee, uint256 oldFee);
    
    /**
     * @dev anounce about closed Roll (unsucceed)
     * 
     * @notice Announced when Roll conditions are not met. There is no winner selected. Prize is available to withdraw by Roll owner. Tickets are available to refund for participants.
     * 
     * @param rollType - Roll type, defines Roll executinion logic
     * @param rollID - Roll ID, unique number of every Roll and it's ownership token
     * @param ticketsContract - tickets collection address, for participants to be informed that they have tickets in the collection to refund
     * @param owner - Roll owner address, for owner to be informed that Prize is available to withdraw
     * @param prizeAddress - Prize token collection address
     * @param prizeID - Prize token ID
     */
    // event RollClosed(uint8 rollType, uint256 indexed rollID, address indexed prizeAddress, uint256 prizeID);
    // event RollClosed(uint256 indexed rollID, address indexed prizeAddress, address indexed ticketsContract, address indexed owner);
    // address indexed ticketsContract, address indexed owner
    event RollClosed(uint256 indexed rollID);
    
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
    // event RollFinished(uint8 rollType, uint256 rollID, uint256 winnerToken, address winnerAddr, address owner, address ticketsContract, address host);
    event RollFinished(uint256 indexed rollID, uint256 indexed winnerTokenId);

    /// TODO DOC
    event SalesOpen(uint256 indexed rollID);
    
    /// TODO DOC
    event SalesClosed(uint256 indexed rollID);
    
    /**
     * @dev Set Roll NFT infrastracture.
     * Set initial parameters.
     * Grant roles
     * 
     * @param baseTokenURI - to set base token URI for Roll ownership tokens
     * @param _revenueFee - percentage Revenue fee applaied to on "claimRevenue()"
     */
    constructor(
        string memory _baseTokenURI,
        uint256 _revenueFee
    ) {
        
        address sender = _msgSender();
        
        /**
         * @dev Deploy Roll ownership Token contract and save it's address
         * 
         * @param _baseTokenURI - Roll ownership token Base URI
         * @param _msgSender - address to grant MANAGER_ROLE
         */
        rollOwnershipToken = address(new RollOwnershipToken(_baseTokenURI, sender));
        
        /**
         * @dev Deploy Treasury contract and save it's address
         * 
         * @param sender - address to grant MANAGER_ROLE
         */
        contractTreasury = address(new TreasuryRollNFT(sender));

        /// @dev set initial Revenue fee
        /// TODO use internal function instead
        revenuePercentageFee = _revenueFee;

        /**
         * TODO
         * @dev Deploy Iddle Assets contract and save it's address
         * 
         * @param sender - address to grant MANAGER_ROLE
         */

        /**
         * @dev grant to deployer address a `MANAGER_ROLE` and `DEFAULT_ADMIN_ROLE`
         */
        _setupRole(DEFAULT_ADMIN_ROLE, sender);
        _setupRole(MANAGER_ROLE, sender);
    }

    /**
     * @dev set _paused state of the contract to True
     * @dev has modifier whenNotPaused
     * 
     * @notice Trigger pause. The contract must not be paused.
     */
    function pause() public onlyRole(MANAGER_ROLE) {
        _pause();
    }

    /**
     * @dev set _paused state of the contract to False
     * @dev has modifier whenPaused
     * 
     * @notice Lift pause. The contract must be paused.
     */
    function unpause() public onlyRole(MANAGER_ROLE) {
        _unpause();
    }

    /**
     * @dev Creates new Roll available to participate in.
     * 
     * @param _rollTime - Block time stamp when Roll participation will be closed and winning selection process will be initialized
     * @param _minParticipants - Minimum amount of participants (tickets) for the Roll to be played
     * @param _maxParticipants - Maximum amount of participants (tickets) that Roll can fit in
     * @param _fixParticipants - Fixed amount of participants (tickets) for Roll to be played. When set - Min and Max are not considered
     * @param _participationPrice - Amount of "_participationToken" to be paid for 1 ticket to participate in the Roll
     * @param _participationToken - Address of ERC20 token, that is used as currency for participation in the Roll
     * @param _prizeAddress - Address of Prize NFT collection (ERC721)
     * @param _prizeId - ID number of the token from "_prizeAddress" NFT collection, that is provded as the Prize of the Roll
     * 
     * @return Roll ID number, which is equal to RollOwnershipToken ID
     * 
     * @notice Function to create new Raffle with provided parameters. Prize token ID should be approved to Core Roll NFT contract.
     */
    function createRoll(
        uint64 _rollTime,
        uint256 _minParticipants,
        uint256 _maxParticipants,
        uint256 _fixParticipants,
        uint256 _participationPrice,
        address _participationToken,
        address _prizeAddress,
        uint256 _prizeId
    ) public whenNotPaused returns(uint256){

        /// @dev check that _prizeAddress is set and is not 0
        require(_prizeAddress != address(0), 'CoreRollNFT: Prize collection address should be different from "0" to create Roll');

        /// @dev check that _participationToken is set and is not 0
        require(_participationToken != address(0), 'CoreRollNFT: Participation token address should be different from "0" to create Roll');

        /// @dev check that _rollTime is provided and is in future
        /// TODO IMPLEMENT MINIMUM ROLL TIME - 1 HOUR / 1 DAY etc
        require(_rollTime > 0 && _rollTime > block.timestamp, 'CoreRollNFT: Roll time should be in feature to create Roll');

        /// @dev define host
        address host = _msgSender();
        
        /// @dev get ERC721 interface for Prize collection contract
        IERC721 prizeContractInterface = IERC721(_prizeAddress);

        /**
         * @dev transfer NFT prize to CoreRollNFT contract
         * 
         * Host should approve Prize token ID to CoreRollNFT contract before calling createRoll function
         */
        prizeContractInterface.transferFrom(host, address(this), _prizeId);

        
        /// TODO Implement Iddle assets contract and it's logic
        // /// @dev approve NFT prize token to IddleAssets contract
        // prizeContractInterface.approve(contractIddleAssets, _prizeId);

        // /// @dev transfer NFT prize token to IddleAssets contract
        // prizeContractInterface.transferFrom(address(this), contractIddleAssets, _prizeId);

        /// @dev define rollType variable
        uint8 rollType = defineRollType(_minParticipants, _maxParticipants, _fixParticipants);

        /// @dev increment Roll ID counter
        /// To start first Roll with ID 1
        _rollIdCounter.increment();

        /// @dev get current Roll ID
        uint rollId = _rollIdCounter.current();

        /// TODO IMPLEMENT ROLL ASSETS STRUCTURE AND INFRASTRUCTURE FOR IT
        // /**
        //  * @dev define and store Prize structure to prizes mapping
        //  * 
        //  * @dev Structure that contain crucial Roll parameters and conditions, that are checked on Roll execution
        //  * 
        //  * @param collectionAddr NFT collection address of the Prize
        //  * @param tokenId Prize token ID
        //  * @param claimAvailable True when prize available to claim by winner or by owner when roll was closed.
        //  */
        // prizes[rollId] = IPrize.Prize(_prizeAddress, _prizeId, false);

        /// @dev form Roll URI
        /// TODO
        string memory rollURI = makeRollURI(rollId, rollType, host, _rollTime, _minParticipants, _maxParticipants, _fixParticipants, _participationToken, _participationPrice, _prizeAddress, _prizeId);
        
        /// @dev mint Roll ownership token for caller
        getRollTokenContract().safeMint(host, rollId, rollURI);
        
        /// @dev clone tickets NFT contract
        address TicketsContract = cloneTicketsContract(rollId, rollURI);

        /// @dev store tickets NFT contract address at ticketsAddr mapping
        ticketsAddr[rollId] = TicketsContract;

        /**
         * @dev update metadata with Participation token address (TicketsContract)
         * 
         * TODO 
         */

        /// @dev define and store Roll structure to rolls mapping
        rolls[rollId] = IRoll.Roll(rollType, host, _rollTime, _minParticipants, _maxParticipants, _fixParticipants, _participationToken, _participationPrice, IRoll.Status.SalesOpen, _prizeAddress, _prizeId, false, uin256(0), false);

        /// @dev emit event about hosted Roll
        emit RollCreated(rollId, host, _prizeAddress);

        /// TODO Rethink if we have to emit this event
        emit SalesOpen(rollId);

        return rollId;

    }

    /**
     * @dev function to participate in a Roll
     * 
     * TODO UPDATE DOC
     * 
     * @return Participation token ID number
     * 
     * @notice Function that allow to participate in Roll with _rollID number. Mints Participation token to caller. Payment token should be approved in amount of Roll participation price. 
     * 
     * TODO IMPLEMENT MULTI CALL BACK END PATTERN
     */
    function participate(uint256 _rollID) public whenNotPaused returns(uint256) {
        
        /// @dev get Roll parameters structure
        var roll = rolls[_rollID];

        /// @dev check that Roll status is "SalesOpen"
        require(roll.status == IRoll.Status.SalesOpen, "CoreRollNFT: Roll status should be SalesOpen to participate");

        /// @dev get Tickets contract interface
        IERC721RollTicket ticketsContract = getRollTicketsContract(_rollID);

        /// @dev get totalSupply of Participantion token collection - amount of participants
        uint256 participantsBeforeMint = ticketsContract.totalSupply();
        
        /// @dev initiate limit local variable that represent participants cap
        uint256 limit;
        
        /// @dev check that minting Participation token would not overflow maxParticipants
        if (
            roll.rollType == uint8(3)
            && roll.rollType == uint8(4)
        ) {
            
            /// @dev get limit value
            limit = roll.maxParticipants;
            
            /// @dev execute check
            require(participantsBeforeMint < limit, "CoreRollNFT: RPT totalSupply() should be less then maximum participants amount");
            
        }

        /// @dev check that minting Participation token would not overflow fixParticipants
        if (roll.rollType == uint8(5)) {
            
            /// @dev get limit value
            limit = roll.fixParticipants;
            
            /// @dev execute check
            require(participantsBeforeMint < limit, "CoreRollNFT: RPT totalSupply() should be less then fixed participants amount");
            
        }
        
        /// @dev send payment to core contract
        (success) = IERC20(roll.participationToken).transferFrom(_msgSender(), address(this), roll.participationPrice);

        require(success, "CoreRollNFT: Failed to transfer participation price amount of payment token");

        /// @dev TODO approve and send payment to Iddle assets contract
        
        /// @dev mint participation tokens
        (ticketId) = ticketsContract.mintToken(_msgSender());

        /// @dev check if was minted last ticket
        if (ticketId == limit) {
            
            statusSalesClosed(_rollID);
            
            /// @dev initiate winner selection
            /// TODO Rethink how we can do it otherwise
            playRoll(_rollID);
        }
        
        /// @dev emit event about new Participant
        /// TODO REWORK EVENT
        emit NewParticipant(_rollID, ticketId, _msgSender());

        return ticketId;
    
    }

    /**
     * @dev function to claim prize from successfull Roll
     * 
     * TODO UPDATE DOC
     * 
     * @return "true" on successful function call
     */
    function claimPrize(uint256 _rollID, uint256 _ticketID) external whenNotPaused returns(bool) {
        
        /// @dev get Roll parameters structure
        var roll = rolls[_rollID];

        /// @dev check that Roll status is "RollFinished"
        require(roll.status == IRoll.Status.RollFinished, "CoreRollNFT: Roll status should be RollFinished to claim Prize");

        /// @dev check that Prize asset is available to withdraw
        require(!roll.prizeClaimed, "CoreRollNFT: Prize available to claim only once");

        /// @dev check that caller is a owner of the _ticketId
        require(_msgSender() == getRollTicketsContract(_rollID).ownerOf(_ticketId), "CoreRollNFT: Caller should be the _ticketId owner to claim Prize");

        /// @dev check that provided ticket is a winning ticket
        require(_ticketID == roll.winnerTokenId, "CoreRollNFT: _ticketID should be equal Roll winner token ID to claim Prize")

        /// @dev burn winner token
        getRollTicketsContract(_rollID).burnToken(_ticketId);

        /**
         * @dev send Prize asset to caller
         */
        IERC721(roll.prizeCollection).safeTransferFrom(address(this), _msgSender(), roll.prizeTokenId);
        
        /// @dev set Prize status to "Claimed"
        roll.prizeClaimed = true;

        /// @dev anounce about claimed prize - where who what
        /// TODO REWORK EVENT
        event PrizeClaimed(roll.rollType, _rollID, ticketsContract, winningTicketID, msg.sender, prizeAddress, prizeID);

        return true;
        
    }

    /**
     * @dev function to claim revenue from successfull Roll
     * 
     * TODO UPDATE DOC
     * 
     * @return "true" on successful function call
     */
    function claimRevenue(uint256 _rollID) public whenNotPaused returns(bool) {

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
         * TODO transferFrom
         */
        IERC20(roll.participationToken).transfer(_msgSender(), total);
        
        /**
         * @dev transfer fees to treasury
         * 
         * TODO transferFrom
         */
        IERC20(roll.participationToken).transfer(getTreasuryContract(), fee);

        /// @dev announce about Roll's claimed revenue - where who what
        /// TODO REWORK EVENT
        emit RevenueClaimed(roll.rollType, _rollID, rollHost, rollOwner, tokenAddress, amount);

        return true;

    }

    /**
     * @dev function to withdraw prize from Closed (unsuccessful) Roll
     * 
     * TODO UPDATE DOC
     * 
     * @return "true" on successful function call
     */
    function withdrawPrize(uint256 _rollID) public whenNotPaused returns(bool) {
        
        /// @dev get Roll parameters structure
        var roll = rolls[_rollID];

        /// @dev check that caller is a owner of the Roll
        require(_msgSender() == getRollTokenContract().ownerOf(_rollID), "CoreRollNFT: Caller should be the Roll owner to withdraw Prize asset");

        /// @dev check that Roll status is "RollClosed"
        require(roll.status == IRoll.Status.RollClosed, "CoreRollNFT: Roll status should be RollClosed to withdraw Prize asset");

        /// @dev check that Prize asset is available to withdraw
        require(!roll.prizeClaimed, "CoreRollNFT: Prize available to withdraw only once");

        /// @dev burn Roll ownership token
        getRollTokenContract().burn(_rollID);
        
        /**
         * @dev send Prize asset to caller
         */
        IERC721(roll.prizeCollection).safeTransferFrom(address(this), _msgSender(), roll.prizeTokenId);
        
        /// @dev set Prize status to "Claimed"
        roll.prizeClaimed = true;

        /// @dev announce about withdrawn prize from unsuccessful Roll - where who what
        /// TODO REWORK EVENT
        emit PrizeWithdrawn(roll.rollType, _rollID, rollHost, rollOwner, prizeAddress, prizeID);

        return true;

    }

    /**
     * @dev refund tickets for Closed Roll
     * 
     * @return "true" on successful function call
     * 
     * TODO UPDATE DESCRIPTION
     * 
     * TODO implememnt Multi Call pattern on backend for banch refund
     */
    function refundParticipation(uint256 _rollID, uint256 _ticketId) public whenNotPaused returns(bool) {
        
        /// @dev get Roll parameters structure
        var roll = rolls[_rollID];

        /// @dev check that Roll status is "RollClosed"
        require(roll.status == IRoll.Status.RollClosed, "CoreRollNFT: Roll status should be RollClosed to refund Participation price");

        /// @dev check that caller is a owner of the _ticketId
        require(_msgSender() == getRollTicketsContract(_rollID).ownerOf(_ticketId), "CoreRollNFT: Caller should be the _ticketId owner to refund Participation price");

        /// @dev burn Participation tokens
        getRollTicketsContract(_rollID).burnToken(_ticketId);
        
        /**
         * @dev send Participation amount to caller
         */
        IERC20(roll.participationToken).transfer(_msgSender(), roll.participationPrice);

        /// @dev announce about refunded tickets from unsuccessful Roll
        emit TicketsRefunded(roll.rollType, _rollID, rollHost, msg.sender, tokenAddress, refundAmount, ticketsAmount);

        return true;

    }

    /**
     * @dev set Revenue fee represented in %
     * 
     * @param _fee - new percentage Revenue fee value
     * 
     * @notice Set Revenue fee in percentage.
     * 
     * 1 = 0.01%
     * 10 = 0.1%
     * 100 = 1%
     * 1000 = 10%
     * 10000 = 100%
     */
    function setPercentageRevenueFee(uint256 _fee) public onlyRole(MANAGER_ROLE) {
        uint256 oldValue = revenuePercentageFee;
        revenuePercentageFee = _fee;
        emit RevenueFeeUpdated(_fee, oldValue);
    }

    /**
     * @dev get Roll ownership token contract address
     * 
     * That implements interface {IERC721RollToken - mintToken, burnToken}
     */
    function getRollTokenContract() internal pure returns(IERC721RollToken){
        return IERC721RollToken(rollOwnershipToken);
    }

    /// 
    /**
     * @dev get Roll participation token contract address
     * 
     * That implements interface {IERC721RollTicket - safeMint, burn}
     */
    function getRollTicketsContract(uint _rollId) internal pure returns(IERC721RollTicket){
        return IERC721RollTicket(ticketsAddr[_rollId]);
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
     * @dev return Fee amount that will be applied to Revenue amount
     * 
     * revenue * revenuePercentageFee / 10000
     * 
     * @param revenue - collected revenue amount
     * 
     * @notice Calculates fee that will be applied to provided Revenue amount
     * 
     * @return Fee amount applied on Revenue
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
     * 
     * @return Pure revenue without fees being applied
     */
    function calculateRevenue(uint256 _participantsAmount, uint256 _participationPrice) public view returns(uint256) {
        
        return _participantsAmount.mul(roll.participationPrice);
    }

    /**
     * @dev Define Roll type according to set Min and Max participants values
     * 
     * Check if parameters are provided and assign Roll type ID, according to combination of parameters.
     * 
     * @param _minParticipants - Minimum amount of participants that Host set for the Roll
     * @param _maxParticipants - Maximum amount of participants that Host set for the Roll
     * 
     * @return Roll type ID
     */
    function defineRollType(uint256 _minParticipants,uint256 _maxParticipants, uint256 _fixParticipants) internal return(uint8) {

        /**
         * Roll type #5 - When fixed participants amount is set.
         * 
         * To initiate winner selection - Roll should have exact amount of participants (_fixParticipants)
         * 
         * Roll time will define when to Close participation sales and set Roll status to closed.
         * 
         * In that scenario Minimum and Maximum participants limits are not considered.
         */
        if (_fixParticipants != 0) {
            return uint8(5);
        }
        
        /// @dev define Roll type
        if (_maxParticipants == 0) {
            
            if (_minParticipants == 0) {

                /**
                 * Roll type #1 - When no participation limits are set.
                 * 
                 * Roll time will define when to Close participation sales and initiate winner selection.
                 * 
                 * That type of Roll will be finished in most scenarios, since there is no requirements to Minimum participants.
                 * However - Roll of the type #1 will be closed, without selected winner, if there is no participants at all at the moment of Roll time.
                 */
                return uint8(1);

            } else {
                
                /**
                 * Roll type #2 - When minimum participants limit is set. No maximum participants limit.
                 * 
                 * Roll time will define when to Close participation sales.
                 * 
                 * To initiate winner selection - amount of participants should be more or equal to minimum participants limit.
                 */
                return uint8(2);

            }

        };
        
        if (_maxParticipants != 0) {
            
            /**
             * @dev check that _maxParticipants is more then _minParticipants
             * 
             * _maxParticipants == _minParticipants scenario is not covered.
             * Because we can not be sure what Host wanted to set - minimum or maximum limit.
             */
            require(_maxParticipants > _minParticipants, "CoreRollNFT: Maximum participants should be less than Minimum participant to create Roll");

            if (_minParticipants == 0) {
                
                /**
                 * Roll type #3 - When Maximum participants limit is set. No Minimum participants limit.
                 * 
                 * When Maximum participants limit is reached - Close participation sales and initiate winner selection process.
                 * 
                 * Roll time will define when to Close participation sales and set Roll status to Closed.
                 * Prize will become available to withdraw by Roll owner.
                 * Roll participation tokens (RPT) will become available to be refunded by participants.
                 */
                return uint8(3);

            } else {
                
                /**
                 * Roll type #4 - When both Minimum and Maximum participants limits are set.
                 * 
                 * When Maximum participants limit is reached - Close participation sales and initiate winner selection process.
                 * 
                 * Roll time will define when to Close participation sales as well.
                 * 
                 * If Minimum participants limit is reached - Roll status will be set to "Finished" and winner selection process will be initialized.
                 * 
                 * Otherwise - set Roll status to Closed.
                 */
                return uint8(4);

            }
            
        }

        require(false, "CoreRollNFT: Failed to define Roll type");
    }

    /**
     * @dev set SalesOpen status to Roll with _rollID number
     * 
     * @param _rollID - Roll ID number
     */
    function statusSalesOpen(uint256 _rollID) internal {
        
        /// @dev open participation sales
        rolls[_rollID] = IRoll.Status.SalesOpen;

        /// TODO rework event
        emit SalesOpen(_rollID);
    }

    /**
     * @dev set SalesClosed status to Roll with _rollID number
     * 
     * @param _rollID - Roll ID number
     */
    function statusSalesClosed(uint256 _rollID) internal {
        
        /// @dev open participation sales
        rolls[_rollID] = IRoll.Status.SalesClosed;

        /// TODO rework event
        emit SalesClosed(_rollID);
    }

    /**
     * @dev set RollFinished status to Roll with _rollID number
     * 
     * @param _rollID - Roll ID number
     */
    function statusRollFinished(uint256 _rollID) internal {
        
        /// @dev open participation sales
        rolls[_rollID] = IRoll.Status.RollFinished;

        /// TODO rework event
        emit RollFinished(_rollID, rolls[_rollID].winnerTokenId);
    }

    /**
     * @dev set RollClosed status to Roll with _rollID number
     * 
     * @param _rollID - Roll ID number
     */
    function statusRollClosed(uint256 _rollID) internal {
        
        /// @dev open participation sales
        rolls[_rollID] = IRoll.Status.RollClosed;

        /// TODO rework event
        emit RollClosed(_rollID);
    }

    /**
     * @dev Initiates winner selection process
     */
    function playRoll(_rollID) public whenNotPaused {

        /// @dev request random number

    }

    /**
     * @dev function that is called by chainlink VRF
     * 
     * Select winner for the Roll ID == requestId
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        
        /// @dev get total amount of participants
        uint256 totalParticipants = getRollTicketsContract(requestId).totalSupply();
        
        /**
         * @dev get a random value in totalParticipants range
         * @dev set recieved winnerTokenId value to Roll parameters structure
         */
        rolls[requestId].winnerTokenId = (randomWords[0] % totalParticipants) + 1;

        /// @dev update Roll status and emit RollFinished event
        statusRollFinished(requestId);

    }

    /// TODO
    
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
        uint8 _rollType,
        address _host,
        uint64 _rollTime,
        uint256 _minParticipants,
        uint256 _maxParticipants,
        uint256 _fixParticipants,
        address _participationToken,
        uint256 _participationPrice,
        address _prizeAddress,
        uint256 _prizeId
    ) internal returns(string memory rollURI) {
        
        /// Status
        IRoll.Status.SalesOpen

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
     * @dev get Roll NFT treasury contract address
     * 
     * TODO MENTION INTERFACE
     */
    function getTreasuryContract() internal pure returns(address) {
        /// TODO IMPLEMENT INTERFACE
        /// TODO RETURN INTERFACE INSTEAD
        return contractTreasury;
    }

    /**
     * TODO IERC721Receiver-onERC721Received
     */

    /**
     * TODO Function to select a winner
     */

}
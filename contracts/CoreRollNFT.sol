// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/// @dev Roll NFT infrastructure
import "./IERC721RollToken.sol";
import "./IERC721RollTicket.sol";
import "./RollParticipationToken.sol";
import "./IRoll.sol";
import "./ITreasury.sol";

/**
 * @dev Chainlink VRF imports
 * 
 * TODO Solve npm install conflicts. Install it properly. Update imports.
 */
import "./ChainlinkVRF/VRFConsumerBaseV2.sol";
import "./ChainlinkVRF/LinkTokenInterface.sol";
import "./ChainlinkVRF/VRFCoordinatorV2Interface.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @custom:security-contact loizage@icloud.com
contract CoreRollNFT is Context, Pausable, AccessControl, VRFConsumerBaseV2 {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    /// @dev Roll ID counter
    Counters.Counter private _rollIdCounter;

    /// @dev Chainlinl VRF state variables
    // mapping(uint256 => uint256[]) public vrfRollIdToRandomWords;
    mapping(uint256 => uint256) public vrfRequestIdToRollID;
    /// @dev link token contract address
    LinkTokenInterface public immutable VRF_LINK_TOKEN;
    /// @dev VRF Coordinator address
    VRFCoordinatorV2Interface public immutable VRF_COORDINATOR;
    /// @dev VRF key hash
    bytes32 internal vrfKeyHash;
    /// @dev VRF subscription id
    uint64 public vrfSubscriptionId;
    /// @dev VRF Request confirmations. By default is 3
    uint16 public vrfRequestConfirmations;
    /// @dev VRF Callback Gas Limit. We can use 50_000
    uint32 public vrfCallbackGasLimit;
    
    /**
     *  @dev Fee percentage i.e 1%(100/10000)
     * 
     *  @notice percentage fee that applied when Roll owner claim Revenue
     */
    uint256 public revenuePercentageFee;
    
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
    address public rollOwnershipToken;

    /// @dev 
    address public addrTreasury;

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
    event RollCreated(uint256 indexed rollID, address indexed rollHost, address indexed prizeAddress);
    
    /// @dev announce about new participant (participation token minted)
    event NewParticipant(uint256 _rollID, uint256 ticketId, address participant);
    
    /// @dev announce about Roll's claimed prize
    event PrizeClaimed(uint256 indexed rollID, address indexed prizeOwner, address indexed prizeAddress);
    
    /// @dev announce about Roll's claimed revenue
    event RevenueClaimed(uint256 indexed rollID, address indexed tokenAddress, uint256 indexed amount);
    
    /// @dev announce about withdrawn prize from unsuccessful Roll
    event PrizeReturned(uint256 indexed rollID, address indexed rollOwner, address indexed prizeAddress);
    
    /// @dev announce about refunded tickets from unsuccessful Roll
    event ParticipationRefunded(uint256 indexed rollID, address indexed tokenAddress, uint256 indexed refundAmount);

    /// @dev announce about updated Revenue fee
    event RevenueFeeUpdated(uint256 indexed newFee, uint256 indexed oldFee);
    
    /**
     * @dev announce about successfuly finished Roll
     * 
     * @notice Announced when Roll conditions are met. Winning token is selected. Prize is available to claim by winning token owner. Revenue available to claim by Roll owner.
     * 
     * @param rollID - Roll ID, unique number of every Roll and it's ownership token
     * @param winnerTokenId - Winner token ID
     */ 
    event RollPlayed(uint256 indexed rollID, uint256 indexed winnerTokenId);

    /// TODO DOC
    event PendingResult(uint256 indexed rollID, uint256 indexed requerstID);

    /**
     * @dev Set Roll NFT infrastracture.
     * Set initial parameters.
     * Grant roles
     * 
     * @param _revenueFee - percentage Revenue fee applaied to on "claimRevenue()"
     * @param _vrfCoordinator - VRF: coordinator address
     * @param _vrfLinkToken - VRF: LINK token address
     * @param _vrfKeyHash - VRF: key hash
     * @param _vrfCallbackGasLimit - VRF: Callback gas limit (we can set  50000)
     * @param _vrfRequestConfirmations - VRF: Request confirmations (3 by default)
     * @param _rollOwnershipToken - ROLT contract address
     * @param _addrTreasury - Treasury contract address
     */
    constructor(
        uint256 _revenueFee,
        address _vrfCoordinator,
        address _vrfLinkToken,
        bytes32 _vrfKeyHash,
        uint32 _vrfCallbackGasLimit,
        uint16 _vrfRequestConfirmations,
        uint64 _vrfSubscriptionId,
        address _rollOwnershipToken,
        address _addrTreasury
    ) VRFConsumerBaseV2(_vrfCoordinator) {

        /// @dev Chainlink VRF
        VRF_COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        VRF_LINK_TOKEN = LinkTokenInterface(_vrfLinkToken);
        vrfKeyHash = _vrfKeyHash;
        vrfCallbackGasLimit = _vrfCallbackGasLimit;
        vrfRequestConfirmations = _vrfRequestConfirmations;
        vrfSubscriptionId = _vrfSubscriptionId;
        
        rollOwnershipToken = _rollOwnershipToken;
        addrTreasury = _addrTreasury;
        
        /// @dev set initial Revenue fee
        revenuePercentageFee = _revenueFee;

        /**
         * @dev grant to deployer address a `MANAGER_ROLE` and `DEFAULT_ADMIN_ROLE`
         */
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());

        /// @dev keep contract paused untill we will set CoreContract as manager for rollOwnershipToken
        pause();

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
        uint256 _fixParticipants,
        uint256 _participationPrice,
        address _participationToken,
        address _prizeAddress,
        uint256 _prizeId
    ) public whenNotPaused returns(uint256){

        /// @dev MVP restriction
        require(_fixParticipants != 0, "CoreRollNFT: Fixed participants amount should be specified for MVP");
        
        /// @dev check that _prizeAddress is set and is not 0
        require(_prizeAddress != address(0), 'CoreRollNFT: Prize collection address should be different from "0" to create Roll');

        /// @dev check that _participationToken is set and is not 0
        require(_participationToken != address(0), 'CoreRollNFT: Participation token address should be different from "0" to create Roll');

        uint256 rollTime = block.timestamp + 1 days;

        /// @dev define host
        address host = _msgSender();
        
        /**
         * @dev transfer NFT prize to CoreRollNFT contract
         * 
         * Host should approve Prize token ID to CoreRollNFT contract before calling createRoll function
         */
        IERC721(_prizeAddress).transferFrom(host, address(this), _prizeId);

        /// @dev increment Roll ID counter
        /// To start first Roll with ID 1
        _rollIdCounter.increment();

        /// @dev get current Roll ID
        uint rollId = _rollIdCounter.current();

        /// @dev form Roll URI
        string memory rollURI = makeRollURI();
        
        /// @dev mint Roll ownership token for caller
        getRollTokenContract().mintRoll(host, rollId, rollURI);
        
        /// @dev clone tickets NFT contract
        address TicketsContract = cloneTicketsContract(rollId, rollURI);

        /// @dev store tickets NFT contract address at ticketsAddr mapping
        ticketsAddr[rollId] = TicketsContract;

        /// @dev define and store Roll structure to rolls mapping
        rolls[rollId].host = host;
        rolls[rollId].rollTime = rollTime;
        rolls[rollId].fixParticipants = _fixParticipants;
        rolls[rollId].participationToken = _participationToken;
        rolls[rollId].participationPrice = _participationPrice;
        rolls[rollId].prizeCollection = _prizeAddress;
        rolls[rollId].prizeTokenId = _prizeId;

        /// @dev emit event about hosted Roll
        emit RollCreated(rollId, host, _prizeAddress);

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
        
        /// @dev check that Roll status is "SalesOpen"
        /// @dev check that Roll time is not passed
        require(rolls[_rollID].rollTime > block.timestamp, "CoreRollNFT: Roll time expire - sales are closed");

        /// @dev get Tickets contract interface
        IERC721RollTicket ticketsContract = getRollTicketsContract(_rollID);

        /// @dev get totalSupply of Participantion token collection - amount of participants
        uint256 participantsBeforeMint = ticketsContract.totalSupply();
        
        require(participantsBeforeMint < rolls[_rollID].fixParticipants, "CoreRollNFT: Reached max participants - sales are closed");
        
        /// @dev send payment to core contract. IERC20 Token should be approved
        (bool success) = IERC20(rolls[_rollID].participationToken).transferFrom(_msgSender(), address(this), rolls[_rollID].participationPrice);
        
        require(success, "CoreRollNFT: Failed to transfer participation price amount of payment token");

        /// @dev mint participation tokens
        (uint256 ticketId) = ticketsContract.mintToken(_msgSender());

        require(ticketId != 0, "CoreRollNFT: Failed to mint participation token");

        /// @dev emit event about new Participant
        emit NewParticipant(_rollID, ticketId, _msgSender());

        /// @dev check if was minted last ticket
        if (ticketId == rolls[_rollID].fixParticipants) {
            
            /// @dev initiate winner selection
            /// TODO Rethink how we can do it otherwise
            drawRoll(_rollID);
        }
        
        return ticketId;
    
    }

    /**
     * @dev function to claim prize from successfull Roll
     * 
     * TODO UPDATE DOC
     * 
     * @return "true" on successful function call
     */
    function claimPrize(uint256 _rollID) external whenNotPaused returns(bool) {
        
        /// @dev check that Roll winner token ID is known
        require(rolls[_rollID].winnerTokenId != 0, "CoreRollNFT: Winner is not announced yet");

        /// @dev check that Prize asset is available to withdraw
        require(!rolls[_rollID].prizeClaimed, "CoreRollNFT: Prize available to claim only once");

        /// @dev get Roll participation token contract interface
        IERC721RollTicket participationTokenContract = getRollTicketsContract(_rollID);
        
        /// @dev get owner of the winning token ID
        address winTokenOwner = participationTokenContract.ownerOf(rolls[_rollID].winnerTokenId);

        /// @dev check that caller is a owner of the _ticketId
        require(_msgSender() == winTokenOwner, "CoreRollNFT: Caller is not the owner of the winning token ID");

        /// @dev burn winner token
        participationTokenContract.burnToken(rolls[_rollID].winnerTokenId);

        /**
         * @dev send Prize asset to caller
         */
        IERC721(rolls[_rollID].prizeCollection).safeTransferFrom(address(this), _msgSender(), rolls[_rollID].prizeTokenId);
        
        /// @dev set Prize status to "Claimed"
        rolls[_rollID].prizeClaimed = true;

        /// @dev anounce about claimed prize - where who what
        /// TODO REWORK EVENT
        emit PrizeClaimed(_rollID, _msgSender(), rolls[_rollID].prizeCollection);
        
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

        /// @dev check that Roll winner token ID is known
        require(rolls[_rollID].winnerTokenId != 0, "CoreRollNFT: Roll not finished");

        /// @dev check that caller is a owner of the Roll
        require(_msgSender() == getRollTokenContract().ownerOf(_rollID), "CoreRollNFT: Caller should be the Roll owner to claim Revenue");

        /// @dev check that revenue is available to claim
        require(!rolls[_rollID].revenueClaimed, "CoreRollNFT: Revenue available to claim only once");

        /// @dev set revenue status to claimed
        rolls[_rollID].revenueClaimed = true;

        /// @dev burn Roll ownership token
        getRollTokenContract().burnRoll(_rollID);

        /// @dev calculate Revenue to claim
        uint256 revenue = calculateRevenue(getRollTicketsContract(_rollID).totalSupply(), rolls[_rollID].participationPrice);
        
        /// @dev calculate Revenue fee
        uint256 fee = calculateRevenueFee(revenue);

        /// @dev calculate total amount to be claimed
        uint256 total = revenue.sub(fee);

        /**
         * @dev send revenue to caller
         * 
         * TODO transferFrom
         */
        IERC20(rolls[_rollID].participationToken).transfer(_msgSender(), total);
        
        /**
         * @dev transfer fees to treasury
         * 
         * TODO transferFrom
         */
        IERC20(rolls[_rollID].participationToken).approve(addrTreasury, fee);
        getTreasuryInterface().deposit(rolls[_rollID].participationToken, fee);

        /// @dev announce about Roll's claimed revenue - where who what
        /// TODO REWORK EVENT
        emit RevenueClaimed(_rollID, rolls[_rollID].participationToken, total);
        
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
        
        /// @dev check that Roll winner is not defined
        require(rolls[_rollID].winnerTokenId == 0, "CoreRollNFT: Roll should has no winner to withdraw");

        /// @dev check that Roll time is expired
        require(block.timestamp > rolls[_rollID].rollTime, "CoreRollNFT: Roll time should expire to withdraw");

        /// @dev get Tickets contract interface
        IERC721RollTicket ticketsContract = getRollTicketsContract(_rollID);

        /// @dev get totalSupply of Participantion token collection - amount of participants
        uint256 totalParticipants = ticketsContract.totalSupply();
        
        require(totalParticipants < rolls[_rollID].fixParticipants, "CoreRollNFT: Roll sales should be failed to withdraw");
        
        /// @dev get ROLT contract interface
        IERC721RollToken ROLTContract = getRollTokenContract();

        /// @dev get Roll owner
        address rollOwner = ROLTContract.ownerOf(_rollID);

        /// @dev check that caller is a owner of the Roll
        require(_msgSender() == rollOwner, "CoreRollNFT: Caller should be the Roll owner to withdraw Prize asset");

        /// @dev check that Prize asset is available to withdraw
        require(!rolls[_rollID].prizeClaimed, "CoreRollNFT: Prize available to withdraw only once");

        /// @dev burn Roll ownership token
        ROLTContract.burnRoll(_rollID);
        
        /**
         * @dev send Prize asset to caller
         */
        IERC721(rolls[_rollID].prizeCollection).safeTransferFrom(address(this), _msgSender(), rolls[_rollID].prizeTokenId);
        
        /// @dev set Prize status to "Claimed"
        rolls[_rollID].prizeClaimed = true;

        /// @dev announce about withdrawn prize from unsuccessful Roll - where who what
        /// TODO REWORK EVENT
        emit PrizeReturned(_rollID, rollOwner, rolls[_rollID].prizeCollection);
        
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
        
        /// @dev check that Roll winner is not defined
        require(rolls[_rollID].winnerTokenId == 0, "CoreRollNFT: Roll should has no winner to refund");

        /// @dev check that Roll time is expired
        require(block.timestamp > rolls[_rollID].rollTime, "CoreRollNFT: Roll time should expire to refund");

        /// @dev get Tickets contract interface
        IERC721RollTicket ticketsContract = getRollTicketsContract(_rollID);

        /// @dev get totalSupply of Participantion token collection - amount of participants
        uint256 totalParticipants = ticketsContract.totalSupply();
        
        require(totalParticipants < rolls[_rollID].fixParticipants, "CoreRollNFT: Roll sales should be failed to refund");
        
        /// @dev check that caller is a owner of the _ticketId
        require(_msgSender() == getRollTicketsContract(_rollID).ownerOf(_ticketId), "CoreRollNFT: Caller should be the _ticketId owner to refund Participation price");

        /// @dev burn Participation tokens
        getRollTicketsContract(_rollID).burnToken(_ticketId);
        
        /**
         * @dev send Participation amount to caller
         */
        IERC20(rolls[_rollID].participationToken).transfer(_msgSender(), rolls[_rollID].participationPrice);

        /// @dev announce about refunded tickets from unsuccessful Roll
        emit ParticipationRefunded(_rollID, rolls[_rollID].participationToken, rolls[_rollID].participationPrice);
        
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
     * That implements interface {IERC721RollToken - mintRoll, burnRoll}
     */
    function getRollTokenContract() internal view returns(IERC721RollToken){
        return IERC721RollToken(rollOwnershipToken);
    }

    /// 
    /**
     * @dev get Roll participation token contract address
     * 
     * That implements interface {IERC721RollTicket - mintToken, burnToken}
     */
    function getRollTicketsContract(uint _rollId) internal view returns(IERC721RollTicket){
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
        return address(new RollParticipationToken(_rollId, _rollURI));

    }

    /**
     * @dev return Fee amount that will be applied to Revenue amount
     * 
     * revenue * revenuePercentageFee / 10000
     * 
     * @param _revenue - collected revenue amount
     * 
     * @notice Calculates fee that will be applied to provided Revenue amount
     * 
     * @return Fee amount applied on Revenue
     */
    function calculateRevenueFee(uint256 _revenue) public view returns(uint256) {
        
        return (_revenue.mul(revenuePercentageFee)).div(10000);

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
    function calculateRevenue(uint256 _participantsAmount, uint256 _participationPrice) public pure returns(uint256) {
        
        return _participantsAmount.mul(_participationPrice);
    }

    /**
     * @dev Draw the Roll. Initiates winner selection process.
     * 
     * Requests RNG from chainlink VRF.
     * 
     * Set status - "PendingResult"
     * 
     * Requirement:
     * 
     * Roll status  - "SalesClosed"
     * 
     * @param _rollID - Roll ID number
     */
    function drawRoll(uint256 _rollID) internal {

        /// @dev request RNG from chainlink VRF
        uint256 requerstId = requestRandomWords(_rollID);

        /// @dev check that RNG request is successful
        require(requerstId != uint256(0), "CoreRollNFT: Failed to request random words from chainlink VRF");

        emit PendingResult(_rollID, requerstId);

    }

    /**
     * @dev function to request RNG from chainlink VRF
     * 
     * Assumes the subscription is funded sufficiently.
     * 
     * @return VRF request ID
     */
    function requestRandomWords(uint256 _rollID) internal returns(uint256) {
        // Will revert if subscription is not set and funded.
        uint256 requestId = VRF_COORDINATOR.requestRandomWords(
        vrfKeyHash,
        vrfSubscriptionId,
        vrfRequestConfirmations,
        vrfCallbackGasLimit,
        uint32(1) /* TODO Implement multiple RNG request for multiple winner / prize */
        );

        /// @dev make mapping relation for Request ID vs Roll ID
        vrfRequestIdToRollID[requestId] = _rollID;

        return requestId;

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

        /// @dev get Roll ID related to Request ID
        uint256 rollID = vrfRequestIdToRollID[requestId];

        /// @dev get total amount of participants
        uint256 totalParticipants = getRollTicketsContract(rollID).totalSupply();
        
        /**
         * @dev get a random value in totalParticipants range
         * @dev set recieved winnerTokenId value to Roll parameters structure
         */
        rolls[rollID].winnerTokenId = (randomWords[0] % totalParticipants) + 1;

        /// @dev update Roll status and emit RollFinished event
        emit RollPlayed(rollID, rolls[rollID].winnerTokenId);

    }

    function makeRollURI() internal pure returns(string memory) {
        
        /// Status
        // IRoll.Status.SalesOpen

        /// TODO FINISH FUNCTION IMPLEMENTATION
        
        /// @dev create Tableland table with Roll metadata

        /// @dev Do we want to add Tickets collection address to metadata after creating one?

        /// @dev we need to do it step by step. Since we want to provide URI to tickets contract 

        return "";

    }

    /**
     * @dev function that return Roll URI according to provided Roll ID
     * 
     * TODO UPDATE DESCRIPTION
     */
    function getRollURI(uint256 _rollId) public view returns(string memory rollURI) {
        
        /// @dev get Roll ownership token 
        IERC721RollToken ROLTContract = getRollTokenContract();

        /// @dev request Roll token URI
        rollURI = ROLTContract.tokenURI(_rollId);

    }
    
    function getTreasuryInterface() internal view returns (ITreasury) {
        return ITreasury(addrTreasury);
    }
    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./RollParticipationTokenV1.sol";
import "./RollOwnershipTokenV1.sol";
import "./TreasuryRollNFT.sol";
import "./interfaces/IRoll.sol";
import "./interfaces/IERC721RollTicket.sol";
import "./interfaces/IERC721RollToken.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @custom:security-contact loizage@icloud.com
contract CoreRollNFTV1 is Context, AccessControlEnumerable {
    using Counters for Counters.Counter;

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
    event RollCreated(IRoll.Roll rollStruct);
    
    /// @dev announce about Roll's new participants / minted tickets
    event TicketsMinted(uint8 indexed rollType, uint256 indexed rollID, address ticketsContract, address participant, uint256 amount);

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
    event RollFinished(uint8 rollType, uint256 rollID, uint256 winnerToken, address winnerAddr, address owner, address ticketsContract, address host);
    
    /**
     * @dev Set Roll NFT infrastracture.
     * Set initial parameters.
     * Grant roles
     * 
     * @param _revenueFee - percentage Revenue fee applaied to on "claimRevenue()"
     */
    constructor(
        uint256 _revenueFee
    ) {
        
        address sender = _msgSender();
        
        /**
         * @dev Deploy Roll ownership Token contract and save it's address
         * 
         * @param _msgSender - address to grant MANAGER_ROLE
         */
        //rollOwnershipToken = address(new RollOwnershipTokenV1());
        rollOwnershipToken = address(0);
        
        /**
         * @dev Deploy Treasury contract and save it's address
         * 
         * @param sender - address to grant MANAGER_ROLE
         */
        //contractTreasury = address(new TreasuryRollNFT(sender));
        contractTreasury = address(0);

        /// @dev set initial Revenue fee
        /// TODO use internal function instead
        revenuePercentageFee = _revenueFee;

        /**
         * @dev grant to deployer address a `MANAGER_ROLE`
         */
        _setupRole(DEFAULT_ADMIN_ROLE, sender);
        _setupRole(MANAGER_ROLE, sender);
    }

    /**
     * @dev Creates new Roll available to participate in.
     * 
     * @param _rollTime - Block time stamp when Roll participation will be closed and winning selection process will be initialized
     * @param _rollTitle - Title
     * @param _minParticipants - Minimum amount of participants (tickets) for the Roll to be played
     * @param _maxParticipants - Maximum amount of participants (tickets) that Roll can fit in
     * @param _participationPrice - Amount of "_participationToken" to be paid for 1 ticket to participate in the Roll
     * @param _participationToken - Address of ERC20 token, that is used as currency for participation in the Roll
     * @param _prizeAddress - Address of Prize NFT collection (ERC721)
     * @param _prizeId - ID number of the token from "_prizeAddress" NFT collection, that is provded as the Prize of the Roll
     * 
     * @return Roll ID number, which is equal to RollOwnershipToken ID
     * 
     * @notice Function to create new Raffle with provided parameters
     */
    function createRoll(
        uint64 _rollTime,
        string memory _rollTitle,
        uint _minParticipants,
        uint _maxParticipants,
        uint _participationPrice,
        address _participationToken,
        address _prizeAddress,
        uint _prizeId
    ) public returns(uint256){

        /// @dev check that _prizeAddress is set and is not 0
        require(_prizeAddress != address(0), 'CoreRollNFT: Prize collection address should be different from "0" to create Roll');

        /// @dev check that _participationToken is set and is not 0
        require(_participationToken != address(0), 'CoreRollNFT: Participation token address should be different from "0" to create Roll');

        /// @dev check that _rollTime is provided and is in future
        /// TODO IMPLEMENT MINIMUM ROLL TIME - 1 HOUR / 1 DAY etc
        require(_rollTime > 0 && _rollTime > block.timestamp, 'CoreRollNFT: Roll time should be in future to create Roll');

        /// @dev define host
        address host = _msgSender();
        
        /// @dev get ERC721 interface for Prize collection contract
        IERC721 prizeContractInterface = IERC721(_prizeAddress);

        /**
         * @dev transfer NFT prize to CoreRollNFT contract
         * 
         */
        prizeContractInterface.transferFrom(msg.sender, address(this), _prizeId);

        /// @dev define rollType variable
        uint8 rollType = 1;

        /// @dev increment Roll ID counter
        /// To start first Roll with ID 1
        _rollIdCounter.increment();

        /// @dev get current Roll ID
        uint rollId = _rollIdCounter.current();

        IRoll.Roll memory rollStruct = IRoll.Roll(rollId, rollType, host, _rollTitle, _rollTime, _minParticipants, _maxParticipants, _participationToken, _participationPrice, IRoll.Status.SalesOpen, _prizeAddress, _prizeId, 0, false, false);

        /// @dev store Roll structure to rolls mapping
        rolls[rollId] = rollStruct;

        /// @dev mint Roll ownership token for caller
        getRollTokenContract().mint(rollStruct);
        
        /// @dev clone tickets NFT contract
        address TicketsContract = cloneTicketsContract(rollId);

        /// @dev store tickets NFT contract address at ticketsAddr mapping
        ticketsAddr[rollId] = TicketsContract;

        /// @dev emit event about hosted Roll
        emit RollCreated(rollStruct);

        return rollId;

    }

    /**
     * @dev get Roll ownership NFT contract address
     * 
     * That implements interface {IERC721Roll - safeMint, burn}
     */
    function getRollTokenContract() public view returns(IERC721RollToken){
        return IERC721RollToken(rollOwnershipToken);
    }

    /**
     * @dev get Roll tickets NFT contract address
     * 
     * That implements interface {IERC721Roll - safeMint, burn}
     */
    function getRollTicketsContract(uint _rollId) public view returns(IERC721RollTicket){
        return IERC721RollTicket(ticketsAddr[_rollId]);
    }

    /**
     * @dev get Roll tickets NFT contract address
     * 
     * That implements interface {IERC721Roll - safeMint, burn}
     */
    function getTreasuryContract(uint _rollId) public view returns(address){
        return contractTreasury;
    }

    /**
     * @dev deploy Roll participation token contract for the _rollId
     * 
     * @param _rollId - Roll ID
     * 
     * @return address of newly deployed tickets contract
     */
    function cloneTicketsContract(uint256 _rollId) internal returns(address) {
        
        /// TODO IMPLEMENT CLONING PATTERN

        /// @dev deploy ERC721 Roll participation token contract
        return address(new RollParticipationTokenV1(_rollId));

    }
}
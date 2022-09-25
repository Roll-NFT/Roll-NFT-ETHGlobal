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

contract CoreRollNFTV2 is Context, AccessControlEnumerable {
    using Counters for Counters.Counter;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    Counters.Counter private _rollIdCounter;
    
    uint256 public revenuePercentageFee;

    address public immutable contractTreasury;
    
    address public immutable rollOwnershipToken;

    mapping (uint256 => address) ticketsAddr;
    
    mapping (uint256 => IRoll.Roll) rolls;
    
    event RollCreated(IRoll.Roll rollStruct);
    
    constructor(
        uint256 _revenueFee
    ) {
        address sender = _msgSender();
        rollOwnershipToken = address(new RollOwnershipTokenV1());
        contractTreasury = address(new TreasuryRollNFT(sender));
        revenuePercentageFee = _revenueFee;
        _setupRole(DEFAULT_ADMIN_ROLE, sender);
        _setupRole(MANAGER_ROLE, sender);
    }

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
        require(_prizeAddress != address(0), 'CoreRollNFT: Prize collection address should be different from "0" to create Roll');

        require(_participationToken != address(0), 'CoreRollNFT: Participation token address should be different from "0" to create Roll');

        require(_rollTime > 0 && _rollTime > block.timestamp, 'CoreRollNFT: Roll time should be in future to create Roll');

        address host = _msgSender();

        IERC721 prizeContractInterface = IERC721(_prizeAddress);

        prizeContractInterface.transferFrom(msg.sender, address(this), _prizeId);

        uint8 rollType = 1;

        _rollIdCounter.increment();

        uint rollId = _rollIdCounter.current();

        IRoll.Roll memory rollStruct = IRoll.Roll(rollId, rollType, host, _rollTitle, _rollTime, _minParticipants, _maxParticipants, _participationToken, _participationPrice, IRoll.Status.SalesOpen, _prizeAddress, _prizeId, 0, false, false);

        rolls[rollId] = rollStruct;

        getRollTokenContract().mint(rollStruct);
        
        address TicketsContract = cloneTicketsContract(rollId);

        ticketsAddr[rollId] = TicketsContract;

        emit RollCreated(rollStruct);

        return rollId;

    }

    function getRollTokenContract() public view returns(IERC721RollToken){
        return IERC721RollToken(rollOwnershipToken);
    }

    function getRollTicketsContract(uint _rollId) public view returns(IERC721RollTicket){
        return IERC721RollTicket(ticketsAddr[_rollId]);
    }

    function getTreasuryContract(uint _rollId) public view returns(address){
        return contractTreasury;
    }

    function cloneTicketsContract(uint256 _rollId) internal returns(address) {
        return address(new RollParticipationTokenV1(_rollId));
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 @author Tellor Inc.
 @title TellorRNG
 @dev This is a contract which requests and retrieves a pseudorandom number
 * from the tellor oracle. Requesting a value from tellor means sending a tip to the
 * autopay contract to incentivize reporters. After the value has been reported, there
 * is a 30 minute waiting period built into this contract to allow time for disputes.
 * Then this contract can retrieve the random number. The TellorRNG query type takes
 * a timestamp as its only input. Tellor reporters then find the next bitcoin and
 * ethereum blockhashes after that timestamp, hash them together, and then report
 * this hash as the pseudorandom number.
*/
import "usingtellor/contracts/UsingTellor.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAutopay.sol";
import "./interfaces/IERC20.sol";

contract TellorRNG is UsingTellor, Ownable {
  IAutopay public autopay;
  IERC20 public tellorToken;
  uint256 public tipAmount;
  mapping (address => bool) public authorizedAddresses;

  /**
   * @dev Initializes parameters
   * @param _tellor address of tellor oracle contract
   * @param _autopay address of tellor autopay contract
   * @param _tellorToken address of token used for autopay tips
   * @param _tipAmount amount of token to tip
   */
  constructor(address payable _tellor, address _autopay, address _tellorToken, uint256 _tipAmount) UsingTellor(_tellor) {
    autopay = IAutopay(_autopay);
    tellorToken = IERC20(_tellorToken);
    tipAmount = _tipAmount;
    authorizedAddresses[msg.sender] = true;
  }

  modifier onlyAuthorized() {
    require(authorizedAddresses[msg.sender] == true, "Not authorized");
    _;
  }

  /**
   * @dev Request a random number by sending a tip
   * @param _timestamp input to TellorRNG query type
   */
   //TODO: Check if we can add extra data to _queryData in order to diferentiate two rolls that are being drawn at the same time
   //TODO: Check if is it possible for the oracle reporter to call a function in our contract whenever the RNG number is ready
   //      That way he would be playing both a reporter role and a "keeper" role.

  function requestRandomNumber(uint256 _timestamp) public onlyAuthorized {
    bytes memory _queryData = abi.encode("TellorRNG", abi.encode(_timestamp));
    bytes32 _queryId = keccak256(_queryData);
    tellorToken.approve(address(autopay), tipAmount);
    autopay.tip(_queryId, tipAmount, _queryData);
  }

  /**
   * @dev Retrieve a random number from tellor oracle
   * @param _timestamp input to TellorRNG query type
   * @return uint256 random number reported to tellor oracle
   */
  //TODO: Check why do we need to subtract 30 min here
  function retrieveRandomNumber(uint256 _timestamp) public view returns(uint256) {
    bytes memory _queryData = abi.encode("TellorRNG", abi.encode(_timestamp));
    bytes32 _queryId = keccak256(_queryData);
    bytes memory _randomNumberBytes;
    (, _randomNumberBytes, ) = getDataBefore(_queryId, block.timestamp - 30 minutes);
    uint256 _randomNumber = abi.decode(_randomNumberBytes, (uint256));
    return _randomNumber;
  }

  function updateTip(uint256 _tipAmount) public onlyOwner {
    tipAmount = _tipAmount;
  }

  function addAuthorizedAddresses(address _authAddress) public onlyOwner {
    authorizedAddresses[_authAddress] = true;
  }

  function removeAuthorizedAddresses(address _authAddress) public onlyOwner {
    authorizedAddresses[_authAddress] = false;
  }

// Gelato 1 @ 00:00: CoreRollNFT#requestRandomNumber()
// -> Check if there is any Roll ready to be drawn
// -> If so, calls TellorRNG#requestRandomNumber(timestamp=Roll.rollTimestamp)
// -> Updates Roll.status = "RNGnumberRequested"

// Gelato 2 @ 01:00: CoreRollNFT#drawRolls()
// -> Check if there is any Roll with status "RNGnumberRequested"
// -> If so, calls TellorRNG#retrieveRandomNumber(timestamp=Roll.rollTimestamp)
// -> If RNG is available, updates the winner tickets inside of the RPTContract
// -> Updates the status of the roll as well
// -> The prize and revenue from ticket sales is now available to be claimed 

// Problem: in the interval between 1 and 2, the RNG could ready & public, thus everybody would know who is the winner in advance
// Is it possible for the oracle reporter to call a function in our contract whenever the RNG number is ready? 
// That way he would be playing both a reporter role and a "keeper" role.

}

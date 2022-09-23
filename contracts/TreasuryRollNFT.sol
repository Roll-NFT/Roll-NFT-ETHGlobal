// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract TreasuryRollNFT is AccessControlEnumerable {
    
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /**
     * @dev mapping with erc20 token addresses and current treasury balance
     */
    mapping(address => uint256) public balance;

    constructor() payable {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, msg.sender);
    }

    // CoreRollNFT: IERC20(tokenAddress).approve(address treasuryRollNFTAddress, uint amount)
    function deposit(address _tokenAddress, uint256 _amount) external {
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        balance[_tokenAddress] += _amount;
    }

    function withdraw(address _tokenAddress, uint256 _amount) external onlyRole(MANAGER_ROLE) {
        require(balance[_tokenAddress] >= _amount, "Balance is insufficient");
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
        balance[_tokenAddress] -= _amount;
    }

    function grantManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MANAGER_ROLE, account);
    }

    function revokeManagerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MANAGER_ROLE, account);
    }

    function balanceOf(address _tokenAddress) public view returns(uint256) {
        return balance[_tokenAddress];
    }

    function getManagerCount() public view returns(uint256) {
        return getRoleMemberCount(MANAGER_ROLE);
    }

    function getAdminCount() public view returns(uint256) {
        return getRoleMemberCount(DEFAULT_ADMIN_ROLE);
    }

    receive() external payable {}

    fallback() external payable {}

}
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

interface ITreasury {

    function deposit(address _tokenAddress, uint256 _amount) external;

    function withdraw(address _tokenAddress, uint256 _amount) external;

}
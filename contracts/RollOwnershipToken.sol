// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// @custom:security-contact loizage@icloud.com
contract RollOwnershipToken is IERC721 {
    constructor(_coreRollNFTAddr) {
        
        /// @dev set core contract as an owner
        owner = _coreRollNFTAddr;
        
    }

    /// @dev mint only owner (Core Roll NFT contract)
    function mint(address _host, string memory tokenURI, uint newRollId)
        external
    {
        _mint(_host, newRollId);
        _setTokenURI(newRollId, tokenURI);
    }

    /// @dev burn only owner

    /// @dev on burn
    /// @dev check that roll is finished
    /// @dev check that prize or revenue is claimed
    /// @dev otherwise do not allow to burn
}
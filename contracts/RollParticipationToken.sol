// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./IERC721RollTicket.sol";

/**
 * @title {ERC721} contract representing collection of Roll participation tokens (tickets)
 * @author Loizage
 * 
 * @dev Contract include:
 * 
 *  - a minter role that allows for token minting (creation)
 *  - a burner role that allows for token burning
 *  - a manager role that allows to pause / unpause all token transfers and set BaseURI
 *  - token ID autogeneration
 *  - URI is set on contract creation for all the token IDs. Contain Roll metadata
 * 
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter, burner and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to other accounts.
 * 
 * 
 * Contract is pausable - that stops ERC721 transfers. Mint and Burn functions are not affected by Pause trigger
 * See {ERC721Pausable - _beforeTokenTransfer}
 * 
 * @notice 
 * @custom:security-contact loizage@icloud.com
 */
contract RollParticipationToken is Context, ERC721, AccessControlEnumerable, Pausable, IERC721RollTicket {
    
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string private _baseTokenURI;
    
    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `BURNER_ROLE` and `PAUSER_ROLE` to the
     * account that deploys the contract.
     *
     * Token URIs will be set as Base token URI. Representing Roll metadata
     * See {ERC721-tokenURI}.
     */
    constructor(
        uint256 _rollID,
        string memory baseTokenURI
    ) ERC721(string(abi.encodePacked("Roll participation token collection #",_rollID)), "RPT") {
        
        /**
         * @dev set base Token URI
         */
        _baseTokenURI = baseTokenURI;

        /**
         * @dev grant contract deployer a `DEFAULT_ADMIN_ROLE`, `MANAGER_ROLE`, `MINTER_ROLE` and `BURNER_ROLE`
         * 
         * Roll core contract is a _msgSender()
         */
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

    }
    
    /**
     * @dev See {IERC721RollTicket-safeMint}
     */
    function mintToken(address to) external override returns (uint256) {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721RollMinterBurnerPauser: must have minter role to mint");
        
        /// @dev increment _tokenIdCounter first, so numeration of tickets will start from 1.
        /// @dev it will be easier to select winner and calculate chances 
        _tokenIdCounter.increment();
        _safeMint(to, _tokenIdCounter.current());

        return _tokenIdCounter.current();
    }

    /**
     * @dev See {IERC721RollTicket-burn}.
     */
    function burnToken(uint256 tokenId) external virtual override {
        require(hasRole(BURNER_ROLE, _msgSender()), "ERC721RollMinterBurnerPauser: must have burner role to burn");
        _burn(tokenId);
    }

    /**
     * @dev Returns collection's base URI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `MANAGER_ROLE`.
     */
    function pause() public virtual {
        require(hasRole(MANAGER_ROLE, _msgSender()), "ERC721RollMinterBurnerPauser: must have manager role to pause");
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `MANAGER_ROLE`.
     */
    function unpause() public virtual {
        require(hasRole(MANAGER_ROLE, _msgSender()), "ERC721RollMinterBurnerPauser: must have manager role to unpause");
        _unpause();
    }

    /**
     * @dev Return Base URI
     */
    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControlEnumerable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
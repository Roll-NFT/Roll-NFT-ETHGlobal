// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./IERC721RollToken.sol";

/**
 * @title NFT contract representing collection of Roll ownerships
 * @author Loizage
 * 
 * @dev Implements ERC721 contract with URIStorage, AccessControlEnumerable
 * 
 * Contract is {ERC721URIStorage} - to set individual URIs with Roll metadata
 * 
 * Contract is pausable - that stops ERC721 transfers. Mint and Burn functions are not affected by Pause trigger
 * See {ERC721Pausable - _beforeTokenTransfer}
 * 
 * @notice 
 * @custom:security-contact loizage@icloud.com
 */
contract RollOwnershipToken is Context, ERC721, ERC721URIStorage, AccessControlEnumerable, Pausable, IERC721RollToken {

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string private _baseTokenURI;
    
    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `BURNER_ROLE` and `MANAGER_ROLE` to the
     * account that deploys the contract.
     * 
     * Grant `MANAGER_ROLE` to _manager address. To provide power to `Pause` / `Unpause` token transfers and to set BaseURI
     *
     * Token URIs will be autogenerated based on `baseURI` and their token IDs.
     * See {ERC721-tokenURI}.
     */
    constructor(
        string memory baseTokenURI,
        address _manager
    ) ERC721("Roll ownership Token collection", "ROLT") {

        /**
         * @dev set base Token URI
         */
        _setBaseURI(baseTokenURI);
        
        /**
         * @dev grant contract deployer a `DEFAULT_ADMIN_ROLE`, `MANAGER_ROLE`, `MINTER_ROLE` and `BURNER_ROLE`
         * 
         * Roll core contract is a _msgSender()
         */
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MANAGER_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        /**
         * @dev grant to _manager address a `MANAGER_ROLE`
         */
        _setupRole(MANAGER_ROLE, _manager);
        
    }

    /**
     * @dev See {IERC721RollToken-safeMint}
     */
    function mintRoll(address to, uint256 tokenId, string memory uri) external override whenNotPaused {
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721RollMinterBurnerPauser: must have minter role to mint");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev See {IERC721RollToken-burn}.
     */
    function burnRoll(uint256 tokenId) external override whenNotPaused {
        require(hasRole(BURNER_ROLE, _msgSender()), "ERC721RollMinterBurnerPauser: must have burner role to burn");
        _burn(tokenId);
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
     * @dev Returns collection's base URI
     * 
     * That is used to autogenerate Token URIs - using `baseURI` and their token IDs.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Return Base URI
     */
    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    /**
     * @dev Set _baseTokenURI
     * 
     * Requirements:
     * 
     * - the caller must have the `MANAGER_ROLE`.
     */
    function setBaseURI(string memory baseTokenURI) public virtual {
        require(hasRole(MANAGER_ROLE, _msgSender()), "ERC721RollMinterBurnerPauser: must have manager role to set BaseURI");
        _setBaseURI(baseTokenURI);
    }

    /**
     * @dev Set _baseTokenURI
     * 
     * Internal use 
     */
    function _setBaseURI(string memory baseTokenURI) internal {
        _baseTokenURI = baseTokenURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage, IERC721RollToken)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}

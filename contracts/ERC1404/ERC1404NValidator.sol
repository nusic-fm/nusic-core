// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./IERC1404N.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1404NValidator is IERC1404N, Ownable  {
    
    uint8 public constant SUCCESS_CODE = 0;
    uint8 public constant TRANSFER_TO_RESTRICTION_CODE = 1;
    uint8 public constant TRANSFER_FROM_RESTRICTION_CODE = 2;
    string public constant UNKNOWN_MESSAGE = "UNKNOWN";
    string public constant SUCCESS_MESSAGE = "SUCCESS";
    string public constant TRANSFER_TO_RESTRICTION_MESSAGE = "ILLEGAL_TRANSFER_TO_ADDRESS";
    string public constant TRANSFER_FROM_RESTRICTION_MESSAGE = "ILLEGAL_TRANSFER_FROM_ADDRESS";

    mapping(address => bool) public whitelist;

    function detectTransferRestriction (address from, address to, uint256 tokenId)
        public virtual override view returns (uint8 restrictionCode) {
        restrictionCode = SUCCESS_CODE; // success
        if (!whitelist[to]) {
            restrictionCode = TRANSFER_TO_RESTRICTION_CODE; // illegal transfer to address
        }
        else if(from != address(0) && !whitelist[from]) {
            restrictionCode = TRANSFER_FROM_RESTRICTION_CODE; // illegal transfer from address
        }
    }

    function messageForTransferRestriction (uint8 restrictionCode)
        public virtual override view returns (string memory message) {
        message = UNKNOWN_MESSAGE;
        if (restrictionCode == SUCCESS_CODE) {
            message = SUCCESS_MESSAGE;
        } else if (restrictionCode == TRANSFER_TO_RESTRICTION_CODE) {
            message = TRANSFER_TO_RESTRICTION_MESSAGE;
        }
        else if (restrictionCode == TRANSFER_FROM_RESTRICTION_CODE) {
            message = TRANSFER_FROM_RESTRICTION_MESSAGE;
        }
    }

    function addToWhitelist(address[] memory _whitelistAddresses) public onlyOwner {
        for (uint256 i = 0; i < _whitelistAddresses.length; i++) {
            require(_whitelistAddresses[i] != address(0),"NULL Address Provided");
            whitelist[_whitelistAddresses[i]] = true;
        }
    }

    function removeFromWhitelist(address[] memory _whitelistAddresses) public onlyOwner {
        for (uint256 i = 0; i < _whitelistAddresses.length; i++) {
            require(_whitelistAddresses[i] != address(0),"NULL Address Provided");
            delete whitelist[_whitelistAddresses[i]];
        }
    }
}
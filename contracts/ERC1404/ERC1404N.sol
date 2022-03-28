// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./IERC1404N.sol";

contract ERC1404N is IERC1404N {
    
    uint8 public constant SUCCESS_CODE = 0;
    uint8 public constant TRANSFER_TO_RESTRICTION_CODE = 1;
    uint8 public constant TRANSFER_FROM_RESTRICTION_CODE = 2;
    string public constant UNKNOWN_MESSAGE = "UNKNOWN";
    string public constant SUCCESS_MESSAGE = "SUCCESS";
    string public constant TRANSFER_TO_RESTRICTION_MESSAGE = "ILLEGAL_TRANSFER_TO_ADDRESS";
    string public constant TRANSFER_FROM_RESTRICTION_MESSAGE = "ILLEGAL_TRANSFER_FROM_ADDRESS";

    mapping(address => bool) public restrictedList;

    /// @notice Checks if a transfer is restricted, reverts if it is
    /// @param from Sending address
    /// @param to Receiving address
    /// @param tokenId tokenId being transferred
    /// @dev Defining this modifier is not required by the standard, using detectTransferRestriction and appropriately emitting TransferRestricted is however
    modifier notRestricted (address from, address to, uint256 tokenId) {
        uint8 restrictionCode = detectTransferRestriction(from, to, tokenId);
        require(restrictionCode == SUCCESS_CODE, messageForTransferRestriction(restrictionCode));
        _;
    }

    function detectTransferRestriction (address from, address to, uint256 tokenId)
        public virtual override view returns (uint8 restrictionCode) {
        restrictionCode = SUCCESS_CODE; // success
        if (restrictedList[to]) {
            restrictionCode = TRANSFER_TO_RESTRICTION_CODE; // illegal transfer to address
        }
        else if(restrictedList[from]) {
            restrictionCode = TRANSFER_FROM_RESTRICTION_CODE; // illegal transfer from address
        }
    }

    function messageForTransferRestriction (uint8 restrictionCode)
        public virtual override pure returns (string memory message) {
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
}
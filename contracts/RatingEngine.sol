// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract RatingEngine is Ownable {

    
    uint256 public riskPremium;

    function setRiskPremium(uint256 _riskPremium) public onlyOwner() {
        riskPremium = _riskPremium;
    }

    function getRating() public view returns (string memory){
        riskPremium;
        return "BBB";
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BondNFT.sol";
import "./AssetPool.sol";
import "hardhat/console.sol";

contract RatingEngine is Ownable {

    
    uint256 public riskPremium;

    function setRiskPremium(uint256 _riskPremium) public onlyOwner() {
        riskPremium = _riskPremium;
    }
    
    function allocateRatingByAssetPoolAddress(address _assetPoolAddress, uint256 _couponRate) public view returns(string memory){
        AssetPool assetPool = AssetPool(payable(_assetPoolAddress));
        BondNFT bondNFT = BondNFT(assetPool.nftAddress());
        uint256 totalListeners = bondNFT.totalListeners();
        uint256 assetPoolBalance = _assetPoolAddress.balance;
        uint256 bondValue = assetPool.bondValue();
        uint256 totalValueWithInterest = bondValue + calculateYiedPayment(bondValue, _couponRate, assetPool.numberOfQuarters());

        bool _isOvercollateralized = isOvercollateralized(assetPoolBalance, totalValueWithInterest);
        // If payment is up to date than expectedNextPaymentBlock will be higher then current block number
        // If payment is not up to date than expectedNextPaymentBlock will be lower then current block number which shows payment time has already passed
        bool _isCollateralUpToDate = assetPool.expectedNextPaymentBlock() > block.number;
        uint256 _numberOfQuarterDelayed = _isCollateralUpToDate? 0 : calculateDelayedQuarters(assetPool.expectedNextPaymentBlock());

        string memory _rating = calculateRating(totalListeners, _isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
        
        console.log("Total Listners = ",totalListeners);
        console.log("AssetPoolBalance = ",assetPoolBalance);
        console.log("BondValue = ",bondValue);
        console.log("TotalValueWithInterest = ",totalValueWithInterest);
        console.log("IsOvercollateralized = ",_isOvercollateralized);
        console.log("IsCollateralUpToDate = ",_isCollateralUpToDate);
        console.log("NumberOfQuarterDelayed = ",_numberOfQuarterDelayed);
        console.log("Rating Assigned = ",_rating);
        return _rating;
    }

    function calculateYiedPayment(uint256 _bondValue, uint256 _couponRate, uint256 _numberOfQuarters) private view returns (uint256 totalYield){
        console.log("_bondValue ",_bondValue);
        console.log("_couponRate ",_couponRate);
        console.log("_numberOfQuarters ",_numberOfQuarters);
        //console.log("(_couponRate/ 4 / 100) ",(_couponRate/ 4 / 100));
        console.log("(_couponRate/ 4 / 100) ",((_couponRate * 100)/4));
        //console.log("(_bondValue * (_couponRate/ 4 / 100)) ",(_bondValue * ((_couponRate * 100)/4)));
        console.log("(_bondValue * ((_couponRate * 100)/4)) ",(_bondValue * ((_couponRate * 100)/4)));
        console.log("(_bondValue * ((_couponRate * 100)/4)) ",((_bondValue * ((_couponRate * 100)/4)) / 100 /100));
        
        // This is how we normally do but in our case this will not work
        //totalYield = (_bondValue * (_couponRate/ 4 / 100)) * _numberOfQuarters;

        // we need coupon rate in basis points
        totalYield = ((_bondValue * ((_couponRate * 100)/4)) / 100 / 100) * _numberOfQuarters;
        console.log("Total yield ",totalYield);
    }

    // For now we are using hardcode value, we will fetch from chainlink pricefeed
    // And later on we will move to DAI to keep value stable
    function getEThPrice() private pure returns(uint256){
        return 4000;
    }

    function isOvercollateralized (uint256 _assetPoolBalance,  uint256 _totalValueWithInterest) private pure returns(bool) {
        return ((_assetPoolBalance * getEThPrice()) /(10**18))  >= _totalValueWithInterest;
    }

    function calculateDelayedQuarters(uint256 _expectedNextPaymentBlock) private view returns (uint256){
        uint256 blockDifference = block.number - _expectedNextPaymentBlock;
        uint256 quarterlyBlocks = 518400;
        return  (blockDifference <= quarterlyBlocks)? 1 : 2;
    }

    function checkAssetPoolBalance(address _assetPoolAddress) public view returns (uint256){
        console.log("Asset Pool Balance = ",_assetPoolAddress.balance);
        console.log("1 = ",(_assetPoolAddress.balance * 4000));
        console.log("2 = ",((_assetPoolAddress.balance * 4000) / (10**18)));
        return _assetPoolAddress.balance;
    }


    function calculateRating(uint256 _totalListeners,bool _isOvercollateralized, bool _isCollateralUpToDate, uint256 _numberOfQuarterDelayed) public pure returns (string memory){
        return "AAA";
    }
}

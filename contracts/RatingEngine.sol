// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BondNFT.sol";
import "./AssetPool.sol";
import "hardhat/console.sol";

contract RatingEngine is Ownable {

    
    uint256 public riskPremium;
    uint256 public constant PRECISION = 1e18;

    function setRiskPremium(uint256 _riskPremium) public onlyOwner() {
        riskPremium = _riskPremium;
    }
    
    function allocateRatingByAssetPoolAddress(address _assetPoolAddress, uint256 _couponRate) public view returns(string memory){
        AssetPool assetPool = AssetPool(payable(_assetPoolAddress));
        BondNFT bondNFT = BondNFT(assetPool.nftAddress());
        uint256 totalListeners = bondNFT.spotifyListeners();
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
        console.log("(100*PRECISION)  ",(100*PRECISION) );
        console.log("(_bondValue * _couponRate) ",(_bondValue * _couponRate));
        
        console.log("(_bondValue * _couponRate) / (100*PRECISION) ",(_bondValue * _couponRate) / (100*PRECISION));
        console.log("((_bondValue * _couponRate) / (100*PRECISION) / 4 ) ",((_bondValue * _couponRate) / (100*PRECISION) / 4 ));
        
        // This is how we normally do but in our case this will not work
        //totalYield = (_bondValue * (_couponRate/ 4 / 100)) * _numberOfQuarters;

        totalYield = ((_bondValue * _couponRate) / (100*PRECISION) / 4 ) * _numberOfQuarters;
        console.log("Total yield ",totalYield);
    }

    function isOvercollateralized (uint256 _assetPoolBalance,  uint256 _totalValueWithInterest) private pure returns(bool) {
        return _assetPoolBalance >= _totalValueWithInterest;
    }

    function calculateDelayedQuarters(uint256 _expectedNextPaymentBlock) private view returns (uint256){
        uint256 blockDifference = block.number - _expectedNextPaymentBlock;
        uint256 quarterlyBlocks = 518400;
        // 1 will show that delay in within 1 quarter
        // 2 will show that delay is more than 1 quarter
        return  (blockDifference <= quarterlyBlocks)? 1 : 2;
    }

    // Temporary funciton, will be removed
    function checkAssetPoolBalance(address _assetPoolAddress) public view returns (uint256){
        console.log("Asset Pool Balance = ",_assetPoolAddress.balance);
        console.log("1 = ",(_assetPoolAddress.balance * 4000));
        console.log("2 = ",((_assetPoolAddress.balance * 4000) / (10**18)));
        
        uint256 cop = 2;
        uint256 copVal = cop * 1e18;
        uint256 percentDivider = 100 * (1e18); //1.0755

        uint256 amount = _assetPoolAddress.balance * 4000;
        uint256 amountP = amount * copVal;
        uint256 amountP1 = amount * copVal / percentDivider;

        console.log("3 = ",cop);
        console.log("4 = ",copVal);
        console.log("5 = ",percentDivider);
        console.log("6 = ",amount);
        console.log("7 = ",amountP);
        console.log("8 = ",amountP1);
        
        console.log("9 = ",PRECISION);
        
        return _assetPoolAddress.balance;
    }


    function calculateRating(uint256 _totalListeners,bool _isOvercollateralized, bool _isCollateralUpToDate, uint256 _numberOfQuarterDelayed) public pure returns (string memory){
        if(_totalListeners >= 5000000) {
            return ratingForTier1Category(_isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
        }
        else if(_totalListeners >= 500000 && _totalListeners <= 4999999) {
            return ratingForTier2Category(_isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
        }
        else if(_totalListeners >= 0 && _totalListeners <= 499999){
            return ratingForTier3Category(_isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
        }
        return "R";
    }

    //For 5 million or more
    function ratingForTier1Category(bool _isOvercollateralized, bool _isCollateralUpToDate, uint256 _numberOfQuarterDelayed) public pure returns (string memory){
        if(_isOvercollateralized){
            return "AAA";
        }
        else if(_isCollateralUpToDate) {
            return "III";
        }
        else if(_numberOfQuarterDelayed == 1) {
            return "UUU";
        }
        else {
            return "R";
        }
    }

    //For 500,000 - 4,999,999
    function ratingForTier2Category(bool _isOvercollateralized, bool _isCollateralUpToDate, uint256 _numberOfQuarterDelayed) public pure returns (string memory) {
        if(_isOvercollateralized){
            return "AA";
        }
        else if(_isCollateralUpToDate) {
            return "II";
        }
        else if(_numberOfQuarterDelayed == 1) {
            return "UU";
        }
        else {
            return "R";
        }
    }
    //For 0 - 499,999
    function ratingForTier3Category(bool _isOvercollateralized, bool _isCollateralUpToDate, uint256 _numberOfQuarterDelayed) public pure returns (string memory) {
        if(_isOvercollateralized){
            return "A";
        }
        else if(_isCollateralUpToDate) {
            return "I";
        }
        else if(_numberOfQuarterDelayed == 1) {
            return "U";
        }
        else {
            return "R";
        }
    } 
}

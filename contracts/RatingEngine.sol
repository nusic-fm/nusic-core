// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BondNFT.sol";
import "./AssetPool.sol";

/*
* RatingEngine will be used to calculate rating of BondNFT
*/
contract RatingEngine is Ownable {

    uint256 public riskPremium;
    uint256 public constant PRECISION = 1e18;

    function setRiskPremium(uint256 _riskPremium) public onlyOwner() {
        riskPremium = _riskPremium;
    }
    
    function allocateRatingByAssetPoolAddress(address _assetPoolAddress, uint256 _couponRate) public view returns(string memory){
        AssetPool assetPool = AssetPool(payable(_assetPoolAddress));
        BondNFT bondNFT = BondNFT(assetPool.nftAddress());
        uint256 meadianListeners = calculateMedian(bondNFT.spotifyListeners(),bondNFT.youtubeSubscribers());
        uint256 assetPoolBalance = _assetPoolAddress.balance;
        uint256 bondValue = assetPool.bondValue();
        uint256 totalValueWithInterest = bondValue + calculateYiedPayment(bondValue, _couponRate, assetPool.numberOfQuarters());

        bool _isOvercollateralized = isOvercollateralized(assetPoolBalance, totalValueWithInterest);
        // If payment is up to date than expectedNextPaymentBlock will be higher then current block number
        // If payment is not up to date than expectedNextPaymentBlock will be lower then current block number which shows payment time has already passed
        bool _isCollateralUpToDate = assetPool.expectedNextPaymentBlock() > block.number;
        uint256 _numberOfQuarterDelayed = _isCollateralUpToDate? 0 : calculateDelayedQuarters(assetPool.expectedNextPaymentBlock());

        return calculateRating(meadianListeners, _isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
    }

    function calculateYiedPayment(uint256 _bondValue, uint256 _couponRate, uint256 _numberOfQuarters) private pure returns (uint256 totalYield){
        totalYield = ((_bondValue * _couponRate) / (100*PRECISION) / 4 ) * _numberOfQuarters;
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

    function calculateMedian(uint256 _spotifyListeners, uint256 _youtubesubscribers) public pure returns (uint256 median){
        median = (_spotifyListeners + _youtubesubscribers) / 2;
    }

    function calculateRating(uint256 _meadianListeners,bool _isOvercollateralized, bool _isCollateralUpToDate, uint256 _numberOfQuarterDelayed) public pure returns (string memory){
        if(_meadianListeners >= 5000000) {
            return ratingForTier1Category(_isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
        }
        else if(_meadianListeners >= 500000 && _meadianListeners <= 4999999) {
            return ratingForTier2Category(_isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
        }
        else if(_meadianListeners >= 0 && _meadianListeners <= 499999){
            return ratingForTier3Category(_isOvercollateralized, _isCollateralUpToDate, _numberOfQuarterDelayed);
        }
        return "R";
    }

    //For 5 million or more users
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

    //For 500,000 - 4,999,999 users
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
    
    //For 0 - 499,999 users
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

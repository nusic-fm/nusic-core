// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AssetPool is Ownable {

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);

    address public artist;
    address public nftAddress;
    uint256 public bondValue;
    uint256 public numberOfYears;
    uint256 public numberOfQuarters;
    uint256 public currentQuarter;
    uint256 public expectedNextPaymentBlock;
    uint256 public quarterlyBlocks = 518400; // 90 * 24 * 60 * 4 (days * hours in day * min in an hours * block in a min)

    struct DepositCheckPoint {
        uint256 fromBlock;
        uint256 amount;
        uint256 timestamp;
        uint256 quarterNumber;
        uint256 expectedNextPaymentBlock;
    }

    DepositCheckPoint[] public quarterCheckPoints;


    /*
    * For first quarter payment we will calculate next payment block as block.number+quarterlyBlocks
    * From second quarter onwards will calculate next payment block as previously calcualted block + quarterlyBlocks
    * This is becuase if user delays the payment then we will calcuate based on expected block not on current block
    */
    receive() external payable {
        expectedNextPaymentBlock = currentQuarter == 0? block.number+quarterlyBlocks : expectedNextPaymentBlock + quarterlyBlocks;
        currentQuarter++;
        quarterCheckPoints.push(DepositCheckPoint(block.number, msg.value, block.timestamp, currentQuarter, expectedNextPaymentBlock));
    }

    // called once by the manager at time of deployment
    function initialize(address _artist, uint256 _bondValue) external onlyOwner {
        artist = _artist;
        bondValue = _bondValue;
    }
    
    function initializeBondInfo(uint256 _numberOfYears, address _nftAddress) public {
        require(_nftAddress != address(0), "Invalid Address");
        nftAddress = _nftAddress;
        numberOfYears = _numberOfYears;
        numberOfQuarters = numberOfYears * 4;
    }

    function quarterCheckPointsLength () public view returns(uint256) {
        return quarterCheckPoints.length;
    }

    function withdraw(
        address _recipient,
        uint256 _amount,
        address _token
    ) external {
        IERC20(_token).approve(address(this), _amount);
        IERC20(_token).transferFrom(address(this), _recipient, _amount);
        emit Withdrawal(_recipient, _amount);
    }
}
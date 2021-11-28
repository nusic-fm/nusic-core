import { BigNumber } from '@ethersproject/bignumber';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { AssetPool, AssetPool__factory } from '../typechain';

describe("AssetPool", function () {

  let assetPool:AssetPool;
  before(async()=>{
    const AssetPool:AssetPool__factory = await ethers.getContractFactory("AssetPool");
    assetPool = await AssetPool.deploy();
    await assetPool.deployed();
  });

  it("Should initialize AssetPool Successfully", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await assetPool.initialize(await owner.getAddress(),ethers.utils.parseEther("1"))).to.be.ok;
    expect(await assetPool.artist()).to.be.equal(await owner.getAddress());
  });

  it("Should initialize bondinfo Successfully", async function () {
    const [owner,addr1] = await ethers.getSigners();
    // adding dummy address as second argument
    expect(await assetPool.initializeBondInfo(BigNumber.from("2"),await addr1.getAddress())).to.be.ok;
    expect(await assetPool.numberOfYears()).to.be.equal(2);
    expect(await assetPool.numberOfQuarters()).to.be.equal(2*4);
  });

  it("Deposit fund should be successfuly", async function () {
    const [owner,addr1] = await ethers.getSigners();

    const balanceBefore = await ethers.provider.getBalance(assetPool.address);
    const txt = await owner.sendTransaction({
      to: assetPool.address,
      value: ethers.utils.parseEther("0.2")
    });
    await txt.wait();
    const balanceAfter = await ethers.provider.getBalance(assetPool.address);
    expect(balanceAfter).to.be.equal(balanceBefore.add(ethers.utils.parseEther("0.2")));
  });
});

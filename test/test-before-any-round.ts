import { BigNumber } from '@ethersproject/bignumber';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { GNusic, GNusic__factory } from '../typechain';

describe("Nusic NFT Deployed: Before any Investment round started", function () {

  let gNusic:GNusic;
  before(async()=>{
    const GNusic:GNusic__factory =  await ethers.getContractFactory("GNusic");
    gNusic = await GNusic.deploy("GNusic NFT","NUSIC","ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
    await gNusic.deployed();
  });

  it("All Funding Rounds should in inActive", async function () {
    const [owner,addr1] = await ethers.getSigners();
    console.log((await gNusic.connect(addr1).stage1Rounds(1)).isActive);
    expect((await gNusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await gNusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await gNusic.connect(addr1).stage1Rounds(3)).isActive).to.be.false;
  });

});

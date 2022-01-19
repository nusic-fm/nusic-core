import { BigNumber } from '@ethersproject/bignumber';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';

describe("Nusic NFT Deployed: Before any Investment round started", function () {

  let nusic:Nusic;
  before(async()=>{
    const Nusic:Nusic__factory =  await ethers.getContractFactory("Nusic");
    nusic = await Nusic.deploy("Nusic NFT","NUSIC","ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
    await nusic.deployed();
  });

  it("All Funding Rounds should in inActive", async function () {
    const [owner,addr1] = await ethers.getSigners();
    console.log((await nusic.connect(addr1).stage1Rounds(1)).isActive);
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.false;
  });

});

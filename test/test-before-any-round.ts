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
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.false;
  });

  it("Activating Current round should fail", async function () {
    // Until current round is activated with 'activateRound(uint256)' function and deactivated 
    // with 'deactivateCurrentRound()' function, we can not call 'activateCurrentRound()'
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).activateCurrentRound())).to.be.revertedWith("Invalid Round");
  });

  it("Activating Current round by Non-Owner user should fail", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).activateCurrentRound())).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Minting should be failed when No investment round is active", async function () {
    const [owner,addr1] = await ethers.getSigners();
    const amount = (await nusic.connect(addr1).price()).mul(1);
    await expect((nusic.connect(addr1).stage1Mint(1, {value: amount}))).to.be.revertedWith("Funding Round not active");
  });

  it("Pre-seed minting should fail when Non-owner call it", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).preSeedMint(3, addr1.address))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Pre-seed minting should even no round is active", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).preSeedMint(3, addr1.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMinted())).to.be.equal(3);
  });

});

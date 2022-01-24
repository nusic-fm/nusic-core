import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from '@ethersproject/wallet';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
var crypto = require('crypto');

describe("Nusic NFT Deployed: Before any Investment round started", function () {

  let nusic:Nusic;
  let _accountList:Wallet[] = [];
  before(async()=>{
    const [owner,addr1] = await ethers.getSigners();
    const Nusic:Nusic__factory =  await ethers.getContractFactory("Nusic");
    nusic = await Nusic.deploy("Nusic NFT","NUSIC","ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
    await nusic.deployed();

    // Generate Accounts for Testing
    const addressToBeGeneratedForPreSeed = (await nusic.MAX_PRE_SEED_SUPPLY()).div(await nusic.MINT_PER_TXT()).toNumber();
    console.log("Pre-Seed Accounts Generated = ",addressToBeGeneratedForPreSeed);
    
    for(let i=0;i<addressToBeGeneratedForPreSeed;i++) {
      var id = crypto.randomBytes(32).toString('hex');
      var privateKey = "0x"+id;
      var wallet = new ethers.Wallet(privateKey,ethers.provider);
      _accountList.push(wallet);
      // Transfering funds to new account as they will not have balance
      await addr1.sendTransaction({
        to:wallet.address,
        value: ethers.utils.parseEther("1")
      })
    }
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
    expect(await (nusic.connect(owner).preSeedMint(5, addr1.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMinted())).to.be.equal(5);
  });

  it("Pre-seed Minting should mint remaining token of Pre-seed supply", async function () {
    const [owner,addr1] = await ethers.getSigners();

    const mintCount = await nusic.MINT_PER_TXT(); 

    for(let i=0; i<_accountList.length-1;i++){
      expect(await nusic.connect(owner).preSeedMint(mintCount, _accountList[i].address)).to.be.ok;
    }
    expect(await (nusic.connect(owner).preSeedMinted())).to.be.equal(await nusic.MAX_PRE_SEED_SUPPLY());
  });

});

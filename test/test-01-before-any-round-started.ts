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

  it("All Constant parameters are properly set", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusic.connect(addr1).MAX_SUPPLY())).to.be.equal(10000);
    expect((await nusic.connect(addr1).MINT_PER_TXT())).to.be.equal(5);
    expect((await nusic.connect(addr1).MINT_PER_ADDR())).to.be.equal(10);
    expect((await nusic.connect(addr1).MAX_PRE_SEED_SUPPLY())).to.be.equal(25);
    expect((await nusic.connect(addr1).STAGE1_MAX_SUPPLY())).to.be.equal(1000);
  });

  it("Price of each token is properly set", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusic.connect(addr1).price())).to.be.equal(ethers.utils.parseEther("0.04"));
  });

  it("Base URI should be empty and default URI should be set", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusic.connect(addr1).defaultURI())).to.be.equal("ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
    expect((await nusic.connect(addr1).baseURI())).to.be.equal("");
  });

  it("preSeedMinted should zero, totalMinted should be 25 publicMintingAllowed and verifyWhitelist should false", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusic.connect(addr1).preSeedMinted())).to.be.equal(0);
    expect((await nusic.connect(addr1).totalMinted())).to.be.equal(25);
    expect((await nusic.connect(addr1).publicMintingAllowed())).to.be.equal(false);
    expect((await nusic.connect(addr1).verifyWhitelist())).to.be.equal(false);
  });

  it("togglePublicMinting and toggleVerifyWhitelist call by non-owner account should fail", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).togglePublicMinting())).to.be.revertedWith("Ownable: caller is not the owner");
    await expect((nusic.connect(addr1).toggleVerifyWhitelist())).to.be.revertedWith("Ownable: caller is not the owner");
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

  it("Minting should be failed when Non approved address try to mint", async function () {
    const [owner,addr1] = await ethers.getSigners();
    const amount = (await nusic.connect(addr1).price()).mul(1);
    await expect((nusic.connect(addr1).stage1Mint(1, {value: amount}))).to.be.revertedWith("Address Not Approved");
  });

  it("Adding to approve list should fail when called by non-owner account", async function () {
    const [owner,addr1,addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(1);
    await expect((nusic.connect(addr2).addToApproveList([addr1.address]))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Adding to approve list should works fine", async function () {
    const [owner,addr1,addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr1).price()).mul(1);
    expect(await (nusic.connect(owner).addToApproveList([addr1.address]))).to.be.ok;
    expect(await nusic.connect(addr2).approvedList(addr1.address)).to.be.true;
    expect(await nusic.connect(addr2).approvedList(addr2.address)).to.be.false;
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

  it("Pre-seed minting should fail when try to mint more then per transaction limit", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).preSeedMint(6, addr1.address))).to.be.revertedWith("Exceed Per Txt limit");
  });

  it("Pre-seed minting should when null address provided", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).preSeedMint(3,"0x0000000000000000000000000000000000000000"))).to.be.revertedWith("NULL Address Provided");
  });

  it("publicAuctionTransfer should fail when Non-owner call it", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).publicAuctionTransfer(3, addr1.address))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("publicAuctionTransfer should fail if public round is not active ", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).publicAuctionTransfer(3, addr1.address))).to.be.revertedWith("Not public round");
  });

  it("treasuryClaim should fail when Non-owner calls it", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).treasuryClaim(3))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("treasuryClaim should valid round is not active", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).treasuryClaim(3))).to.be.revertedWith("Invalid Round");
  });

  it("Get tokenURI should fail as no token is yet minted", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).tokenURI(3))).to.be.revertedWith("Token does not exists");
  });

  it("Pre-seed minting should work even no round is active", async function () {
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

  it("Pre-seed minting should fail as all pre-seed token already minted", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).preSeedMint(5, addr1.address))).to.be.revertedWith("Minting will exceed PreSeed supply");
  });

  it("Get tokenURI should return default URI", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).tokenURI(3))).to.be.equal("ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
  });

  it("setBaseURI should update URI properly", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).setBaseURI("https://gateway.pinata.cloud/ipfs/Qmd8grfncQt8oynkXTqyRohYDppsjpdagfY4MDQBr3aEdk/"))).to.be.ok;
  });

  it("Get tokenURI should return proper URI with JSON", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).tokenURI(3))).to.be.equal("https://gateway.pinata.cloud/ipfs/Qmd8grfncQt8oynkXTqyRohYDppsjpdagfY4MDQBr3aEdk/3.json");
  });

  it("setTreasuryAddress should fail when non-owner calls it", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).setTreasuryAddress(addr1.address))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("setTreasuryAddress should fail if address provided is null", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).setTreasuryAddress("0x0000000000000000000000000000000000000000"))).to.be.revertedWith("NULL Address Provided");
  });

  it("setTreasuryAddress should update address properly", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).setTreasuryAddress(addr1.address))).to.be.ok;
  });

  it("treasuryAddress matches the address provided", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryAddress())).to.be.equal(addr1.address);
  });

});

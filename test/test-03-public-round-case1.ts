import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from '@ethersproject/wallet';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
var crypto = require('crypto');

// Addr1 is being used as treasury address
describe("Nusic NFT Deployed: Public Round Testing - Case 1: Only Onwer can transfer tokens", function () {

  let nusic:Nusic;
  let _accountList:Wallet[] = [];
  let _accountListPrivateRound:Wallet[] = [];
  let _accountListPublicRound:Wallet[] = [];
  before(async()=>{
    const [owner,addr1] = await ethers.getSigners();
    const Nusic:Nusic__factory =  await ethers.getContractFactory("Nusic");
    nusic = await Nusic.deploy("Nusic NFT","NUSIC","ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J");
    await nusic.deployed();

    // Generate Accounts for Testing
    // Seed Round Minting Addresses
    const addressToBeGeneratedForSeed = ((await nusic.stage1Rounds(1)).maxSupplyForRound).div(await nusic.MINT_PER_TXT()).toNumber();
    console.log("Seed Accounts Generated = ",addressToBeGeneratedForSeed);
    
    for(let i=0;i<addressToBeGeneratedForSeed;i++) {
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


    // Private Round Minting Addresses
    const addressToBeGeneratedForPrivate = ((await nusic.stage1Rounds(2)).maxSupplyForRound).div(await nusic.MINT_PER_TXT()).toNumber();
    console.log("Private Accounts Generated = ",addressToBeGeneratedForPrivate);
    
    for(let i=0;i<addressToBeGeneratedForPrivate;i++) {
      var id = crypto.randomBytes(32).toString('hex');
      var privateKey = "0x"+id;
      var wallet = new ethers.Wallet(privateKey,ethers.provider);
      _accountListPrivateRound.push(wallet);
      // Transfering funds to new account as they will not have balance
      await addr1.sendTransaction({
        to:wallet.address,
        value: ethers.utils.parseEther("1")
      })
    }

    // Private Round Minting Addresses
    const addressToBeGeneratedForPublic = ((await nusic.stage1Rounds(3)).maxSupplyForRound).div(await nusic.MINT_PER_TXT()).toNumber();
    console.log("Public Round Accounts Generated = ",addressToBeGeneratedForPublic);
    
    for(let i=0;i<addressToBeGeneratedForPublic;i++) {
      var id = crypto.randomBytes(32).toString('hex');
      var privateKey = "0x"+id;
      var wallet = new ethers.Wallet(privateKey,ethers.provider);
      _accountListPublicRound.push(wallet);
      // Transfering funds to new account as they will not have balance
      await addr1.sendTransaction({
        to:wallet.address,
        value: ethers.utils.parseEther("1")
      })
    }
  });

  it("setTreasuryAddress should update address properly", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).setTreasuryAddress(addr1.address))).to.be.ok;
    expect(await (nusic.connect(owner).treasuryAddress())).to.be.equal(addr1.address);
  });

  // Just to fullfil prerequisite before we go in public round 
  it("Pre-seed: Minting should work for all 25 tokens", async function () {
    const [owner,addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    expect(await (nusic.connect(owner).preSeedMint(5, addr2.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMint(5, addr3.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMint(5, addr4.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMint(5, addr5.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMint(5, addr6.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMinted())).to.be.equal(25);
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(25);
  });

  // Just to fullfil prerequisite before we go in public round
  it("Seed Round: Seed and Treasury minting should mint all token of seed round", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();

    expect(await (nusic.connect(owner).activateRound(1))).to.be.ok;

    const mintCount = await nusic.MINT_PER_TXT(); 
    const amount = (await nusic.connect(addr2).price()).mul(mintCount);

    for(let i=0; i<_accountList.length;i++){
      expect(await (nusic.connect(_accountList[i]).stage1Mint(5, {value: amount}))).to.be.ok;
    }
    expect(await (nusic.connect(owner).treasuryClaim(125))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(250);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(250);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
  });

  // Just to fullfil prerequisite before we go in public round
  it("Private Round: Private and Treasury minting should mint remaing token of Private Round", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();

    expect(await (nusic.connect(owner).activateRound(2))).to.be.ok;
    const mintCount = await nusic.MINT_PER_TXT(); 
    const amount = (await nusic.connect(addr2).price()).mul(mintCount);

    for(let i=0; i<_accountListPrivateRound.length;i++){
      expect(await (nusic.connect(_accountListPrivateRound[i]).stage1Mint(5, {value: amount}))).to.be.ok;
    }
    expect(await (nusic.connect(owner).treasuryClaim(125))).to.be.ok;
    
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(500);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(500);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  });

  // Public round test cases starts here (3rd Round)

  it("Public Round Case1: publicAuctionTransfer should fail because public round is not active", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).publicAuctionTransfer(3, addr1.address))).to.be.revertedWith("Not public round");
  });

  it("Public Round Case1: Activating Public Round should work fine", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).activateRound(3))).to.be.ok;
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.true;
  });

  it("Public Round Case1: Minting by public using 'stage1Mint' should fail when publicMintingAllowed is false", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(1);
    await expect((nusic.connect(addr3).stage1Mint(1, {value: amount}))).to.be.revertedWith("Minting not allowed");
  });

  it("Public Round Case1: publicAuctionTransfer should fail when called with Non-Owner account", async function () {
    const [owner,addr1,addr2] = await ethers.getSigners();
    await expect((nusic.connect(addr1).publicAuctionTransfer(3, addr2.address))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Public Round Case1: publicAuctionTransfer should be able mint 5 tokens for first address", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    expect(await (nusic.connect(owner).publicAuctionTransfer(5,_accountListPublicRound[0].address))).to.be.ok;
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(505);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(505);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(5);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(0);
  });

  it("Public Round Case1: treasuryClaim should mint 150 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(150))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(655);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(655);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(5);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(150);
  });

  it("Public Round Case1: publicAuctionTransfer should be able mint all remaining tokens", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();

    for(let i=1; i<_accountListPublicRound.length;i++){
      expect(await (nusic.connect(owner).publicAuctionTransfer(5, _accountListPublicRound[i].address))).to.be.ok;
    }

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(900);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(900);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(250);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(150);
  });

  it("Public Round Case1: publicAuctionTransfer should fail when all tokens already minted", async function () {
    const [owner,addr1,addr2] = await ethers.getSigners();
    await expect((nusic.connect(owner).publicAuctionTransfer(3, addr2.address))).to.be.revertedWith("All minted for current round");
  });

  it("Public Round Case1: treasuryClaim should mint remaing 100 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(100))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(1000);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(1000);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(250);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(250);
  });

  it("Public Round Case1: Minting of Pre-Seed, Public mint and Treasury Claim should fail when all Public Round tokens already minted", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(1);
    await expect((nusic.connect(owner).preSeedMint(1, addr1.address))).to.be.revertedWith("Minting will exceed PreSeed supply");
    await expect((nusic.connect(addr3).stage1Mint(1, {value: amount}))).to.be.revertedWith("Minting not allowed");
    await expect((nusic.connect(owner).treasuryClaim(1))).to.be.revertedWith("All Claimed for current round");
  });

  it("Public Round Case1: Withdraw should fail when call with Non-owner account", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    await expect((nusic.connect(addr3).withdraw())).to.be.revertedWith("Ownable: caller is not the owner");
  });

  // Addr1 is being used as treasury address
  it("Public Round Case1: Withdrow with owner account should file and update balance of Treasury Address", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const price = await nusic.connect(addr3).price();
    // Total public tokens 500, out of which:
    // 25 directly transferred to advisors
    // 225 minted by public
    // 250 transferred by owner to public, so no payment received
    // Funds collected for on 225 public minted
    const totalMinted = 225;
    const balanceBeforeWithdraw = await addr1.getBalance();
    //console.log("Balance before = ",balanceBeforeWithdraw.toString());
    //console.log("Balance before = ",await ethers.utils.formatEther(balanceBeforeWithdraw));
    expect(await (nusic.connect(owner).withdraw())).to.be.ok;

    const balanceAfterWithdraw = await addr1.getBalance();
    //console.log("Balance After = ",balanceAfterWithdraw.toString());
    //console.log("Balance After = ",await ethers.utils.formatEther(balanceAfterWithdraw));
    const balanceShouldBe = balanceBeforeWithdraw.add(price.mul(totalMinted));
    expect(balanceAfterWithdraw).to.be.equal(balanceShouldBe);
  });
});

import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from '@ethersproject/wallet';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
var crypto = require('crypto');

// Addr1 is being used as treasury address
describe("Nusic NFT Deployed: Public Round Testing - Case 2: Public can mint by paying and Owner can also transfer tokens", function () {

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

    const listForApprovalAddresses = [];
    for(let i=0; i<_accountList.length;i++){
      listForApprovalAddresses.push(_accountList[i].address);
    }
    for(let i=0; i<_accountListPrivateRound.length;i++){
      listForApprovalAddresses.push(_accountListPrivateRound[i].address);
    }
    for(let i=0; i<_accountListPublicRound.length;i++){
      listForApprovalAddresses.push(_accountListPublicRound[i].address);
    }
    await nusic.addToApproveList(listForApprovalAddresses);
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
      expect(await (nusic.connect(_accountList[i]).mint(5, {value: amount}))).to.be.ok;
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
      expect(await (nusic.connect(_accountListPrivateRound[i]).mint(5, {value: amount}))).to.be.ok;
    }
    expect(await (nusic.connect(owner).treasuryClaim(125))).to.be.ok;
    
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(500);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(500);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  });

  // Public round test cases starts here (3rd Round) Case 2

  it("Public Round Case2: Activating Public Round should work fine", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).activateRound(3))).to.be.ok;
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.true;
  });

  it("Public Round Case2: togglePublicMinting call by non-owner account should fail", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).togglePublicMinting())).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Public Round Case2: togglePublicMinting owner account should toggle to true successfully", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).publicMintingAllowed())).to.be.false;
    expect(await (nusic.connect(owner).togglePublicMinting())).to.be.ok;
    expect(await (nusic.connect(owner).publicMintingAllowed())).to.be.true;
  });

  it("Public Round Case2: publicAuctionTransfer should be able mint 5 tokens for first address", async function () {
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

  it("Public Round Case2: mint call by public should mint 5 token successfully", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(5);
    expect(await (nusic.connect(_accountListPublicRound[1]).mint(5, {value: amount}))).to.be.ok;
    
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(510);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(510);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(10);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(0);
  });

  it("Public Round Case2: treasuryClaim should mint 125 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(125))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(635);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(635);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(10);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(125);
  });

  it("Public Round Case2: publicAuctionTransfer should be able mint 70 more tokens total 75", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    //_accountListPublicRound[0] and _accountListPublicRound[1] already have 5 tokens each
    // For 70 tokens we need 14 more address each will have 5 tokens from index 2 to 15
    for(let i=2; i<= 15 ;i++){
      expect(await (nusic.connect(owner).publicAuctionTransfer(5, _accountListPublicRound[i].address))).to.be.ok;
    }

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(705);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(705);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(80);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(125);
  });

  it("Public Round Case2: stage1Mint call by public should mint all remaining 170 token successfully total 175", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    // We have 50 address for public minting 
    // From index 0 to 15 already have 5 token each
    // We will start from index 16 to 49 (34 elements) so 5x34=170 
    const amount = (await nusic.connect(addr2).price()).mul(5);

    for(let i=16; i<= 49 ;i++){
      expect(await (nusic.connect(_accountListPublicRound[i]).mint(5, {value: amount}))).to.be.ok;
    }

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(875);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(875);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(250);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(125);
  });

  it("Public Round Case2: publicAuctionTransfer and stage1Mint should fail when all tokens already minted", async function () {
    const [owner,addr1,addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(3);

    await expect((nusic.connect(owner).publicAuctionTransfer(3, _accountListPublicRound[0].address))).to.be.revertedWith("All minted for current round");
    await expect((nusic.connect(_accountListPublicRound[0]).mint(3, {value: amount}))).to.be.revertedWith("All minted for current round");
  });

  it("Public Round Case2: treasuryClaim should mint remaing 125 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(125))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(1000);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(1000);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(250);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(250);
  });

  it("Public Round Case2: Minting of Pre-Seed, Public mint, publicAuctionTransfer and Treasury Claim should fail when all Public Round tokens already minted", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(1);
    await expect((nusic.connect(owner).preSeedMint(1, addr1.address))).to.be.revertedWith("Minting will exceed PreSeed supply");
    await expect((nusic.connect(_accountListPublicRound[0]).mint(1, {value: amount}))).to.be.revertedWith("All minted for current round");
    await expect((nusic.connect(owner).publicAuctionTransfer(1, _accountListPublicRound[0].address))).to.be.revertedWith("All minted for current round");
    await expect((nusic.connect(owner).treasuryClaim(1))).to.be.revertedWith("All Claimed for current round");
  });

  // Addr1 is being used as treasury address
  it("Public Round Case2: Withdraw with owner account should file and update balance of Treasury Address", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const price = await nusic.connect(addr3).price();
    // Total public tokens 500, out of which:
    // 25 directly transferred to advisors
    // 225 minted by public in seed and private round
    // 75 transferred by owner to public, so no payment received
    // 175 minted by public in public round , payment received
    // Funds collected for on 225 + 175 = 400
    const totalMinted = 400;
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
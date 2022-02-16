import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from '@ethersproject/wallet';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
var crypto = require('crypto');

// Addr1 is being used as treasury address
describe("Nusic NFT Deployed: Public Round Testing - Case 3: Public can mint by whitelist address by paying and Onwer can also transfer tokens", function () {

  let nusic:Nusic;
  let _accountList:Wallet[] = [];
  let _accountListPrivateRound:Wallet[] = [];
  let _accountListPublicRoundWhiteList:Wallet[] = [];
  let _accountListPublicRoundPublicMinting:Wallet[] = [];
  // Sequence of Transfer will be
  // 1. publicAuctionTransfer 5 -- Total 5
  // 2. TreasuryCliam 50  -- Total 55
  // 3. stage1Mint by whitelisted 5 -- Total 60
  // 4. stage1Mint by whitelisted 3 -- Total 63
  // 5. stage1Mint by whitelisted 2 -- Total 65
  // 6. publicAuctionTransfer 30 -- Total 95
  // 7. stage1Mint by whitelisted 65 -- Total 160
  // 8. stage1Mint by Non Whitelisted 100 -- Total 260
  // 9. TreasuryCliam 200  -- Total 460
  // 10. publicAuctionTransfer 40 -- Total 500
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
    const toBeUsedInWhitelist = 15;
    // Keeping 15 accounts addresses to be used as whitelist
    // Remaing 35 accounts addresses for public minting 
    for(let i=0;i<addressToBeGeneratedForPublic;i++) {
      var id = crypto.randomBytes(32).toString('hex');
      var privateKey = "0x"+id;
      var wallet = new ethers.Wallet(privateKey,ethers.provider);
      if(i<toBeUsedInWhitelist) {
        _accountListPublicRoundWhiteList.push(wallet);
      }
      else {
        _accountListPublicRoundPublicMinting.push(wallet);
      }
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
    for(let i=0; i<_accountListPublicRoundWhiteList.length;i++){
      listForApprovalAddresses.push(_accountListPublicRoundWhiteList[i].address);
    }
    for(let i=0; i<_accountListPublicRoundPublicMinting.length;i++){
      listForApprovalAddresses.push(_accountListPublicRoundPublicMinting[i].address);
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

  // Public round test cases starts here (3rd Round) Case 3
  it("Public Round Case3: Activating Public Round should work fine", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).activateRound(3))).to.be.ok;
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.true;
  });

  it("Public Round Case3: Minting by public using 'stage1Mint' should fail when publicMintingAllowed is false", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(1);
    await expect((nusic.connect(addr3).stage1Mint(1, {value: amount}))).to.be.revertedWith("Minting not allowed");
  });

  it("Public Round Case3: togglePublicMinting owner account should toggle to true successfully", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).publicMintingAllowed())).to.be.false;
    expect(await (nusic.connect(owner).togglePublicMinting())).to.be.ok;
    expect(await (nusic.connect(owner).publicMintingAllowed())).to.be.true;
  });

  it("Public Round Case3: toggleVerifyWhitelist call by non-owner account should fail", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).toggleVerifyWhitelist())).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Public Round Case3: toggleVerifyWhitelist owner account should toggle to true successfully", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).verifyWhitelist())).to.be.false;
    expect(await (nusic.connect(owner).toggleVerifyWhitelist())).to.be.ok;
    expect(await (nusic.connect(owner).verifyWhitelist())).to.be.true;
  });
  
  it("Public Round Case3: Minting by public using 'stage1Mint' should fail when publicMintingAllowed for only whitelisted", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(1);
    await expect((nusic.connect(_accountListPublicRoundWhiteList[0]).stage1Mint(1, {value: amount}))).to.be.revertedWith("Not Qualified");
  });

  it("Public Round Case3: Adding to whilelist should fail when called by non-owner account", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    await expect((nusic.connect(addr1).addToWhitelist([_accountListPublicRoundWhiteList[0].address]))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Public Round Case3: Removing from whilelist should fail when called by non-owner account", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    await expect((nusic.connect(addr1).removeFromWhitelist([_accountListPublicRoundWhiteList[0].address]))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Public Round Case3: Adding to whilelist should fail when null address provided", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    await expect((nusic.connect(owner).addToWhitelist(["0x0000000000000000000000000000000000000000"]))).to.be.revertedWith("NULL Address Provided");
  });

  it("Public Round Case3: Removing from whilelist should fail when null address provided", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    await expect((nusic.connect(owner).removeFromWhitelist(["0x0000000000000000000000000000000000000000"]))).to.be.revertedWith("NULL Address Provided");
  });

  it("Public Round Case3: publicAuctionTransfer should be able mint 5 tokens for first address", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    expect(await (nusic.connect(owner).publicAuctionTransfer(5,_accountListPublicRoundPublicMinting[0].address))).to.be.ok;
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(505);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(505);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(5);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(0);
  });

  it("Public Round Case3: treasuryClaim should mint 50 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(50))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(555);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(555);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(5);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(50);
  });

  it("Public Round Case3: Adding to whilelist should add addresses successfully", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();

    const accountList:string[] = [
                                  _accountListPublicRoundWhiteList[0].address,
                                  _accountListPublicRoundWhiteList[1].address,
                                  _accountListPublicRoundWhiteList[2].address,
                                  _accountListPublicRoundWhiteList[3].address,
                                  _accountListPublicRoundWhiteList[4].address,
                                ];
    // Adding multiple addresses in whitelist in single call
    expect(await (nusic.connect(owner).addToWhitelist(accountList))).to.be.ok;
    // Address addresses into whitelist one by one
    for(let i=5; i<_accountListPublicRoundWhiteList.length;i++){
      expect(await (nusic.connect(owner).addToWhitelist([_accountListPublicRoundWhiteList[i].address]))).to.be.ok;
    }

    expect(await (nusic.connect(owner).publicSaleWhitelist(_accountListPublicRoundWhiteList[0].address))).to.be.equal(true);
    expect(await (nusic.connect(owner).publicSaleWhitelist(addr2.address))).to.be.equal(false);
    expect(await (nusic.connect(owner).publicSaleWhitelist(_accountListPublicRoundWhiteList[13].address))).to.be.equal(true);
  });

  it("Public Round Case3: Minting by whitelisted address using 'stage1Mint' should mint tokens", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(5);
    expect(await (nusic.connect(_accountListPublicRoundWhiteList[0]).stage1Mint(5, {value: amount}))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(560);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(560);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(10);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(50);
  });

  it("Public Round Case3: Minting by 2nd whitelisted address using 'stage1Mint' should mint tokens", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(3);
    expect(await (nusic.connect(_accountListPublicRoundWhiteList[1]).stage1Mint(3, {value: amount}))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(563);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(563);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(13);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(50);
  });

  it("Public Round Case3: Removing from whilelist should remove provided address", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    await expect((nusic.connect(owner).removeFromWhitelist([_accountListPublicRoundWhiteList[1].address]))).to.be.ok;
    expect(await (nusic.connect(owner).publicSaleWhitelist(_accountListPublicRoundWhiteList[1].address))).to.be.equal(false);
  });

  it("Public Round Case3: Minting by 2nd address using 'stage1Mint' should fail after removal from whiltelist", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(2);
    await expect((nusic.connect(_accountListPublicRoundWhiteList[1]).stage1Mint(2, {value: amount}))).to.be.revertedWith("Not Qualified");
  });

  it("Public Round Case3: Minting by 2nd address using 'stage1Mint' should works fine after adding back to whitelist", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(2);
    expect(await (nusic.connect(owner).addToWhitelist([_accountListPublicRoundWhiteList[1].address]))).to.be.ok;
    expect(await (nusic.connect(_accountListPublicRoundWhiteList[1]).stage1Mint(2, {value: amount}))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(565);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(565);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(15);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(50);
  });

  it("Public Round Case3: publicAuctionTransfer should be able mint 30 tokens", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();

    //_accountListPublicRoundPublicMinting[0] already have 5 tokens
    // For 30 tokens we need 6 more address each will have 5 tokens from index 1 to 6
    for(let i=1; i<= 6 ;i++){
      expect(await (nusic.connect(owner).publicAuctionTransfer(5, _accountListPublicRoundPublicMinting[i].address))).to.be.ok;
    }

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(595);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(595);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(45);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(50);
  });

  it("Public Round Case3: Minting by whitelisted using 'stage1Mint' should mint for all remaining whitelisted addresses", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();

    // We have 15 address for whitelisted minting, each will mint 5 tokens 
    // Index 0 and 1 have 5 token each
    // We will start from index 2 to 14 (13 address) so 5x13=65
    const amount = (await nusic.connect(addr2).price()).mul(5);

    for(let i=2; i<= 14 ;i++){
      expect(await (nusic.connect(_accountListPublicRoundWhiteList[i]).stage1Mint(5, {value: amount}))).to.be.ok;
    }

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(660);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(660);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(110);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(50);
  });

  it("Public Round Case3: toggleVerifyWhitelist owner account should toggle to False successfully", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).verifyWhitelist())).to.be.true;
    expect(await (nusic.connect(owner).toggleVerifyWhitelist())).to.be.ok;
    expect(await (nusic.connect(owner).verifyWhitelist())).to.be.false;
  });


  it("Public Round Case3: Minting by Non Whitelisted using 'stage1Mint' should mint 100 tokens for 20 addresses", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();

    // We have 35 address for public minting and owner transfer, each will mint 5 tokens 
    // Index 0 and 6 already have 5 token each -- tranfered by owner as aution
    // We will start from index 7 to 26 (20 address) so 5x15=75
    const amount = (await nusic.connect(addr2).price()).mul(5);

    for(let i=7; i<=26 ;i++){
      expect(await (nusic.connect(_accountListPublicRoundPublicMinting[i]).stage1Mint(5, {value: amount}))).to.be.ok;
    }

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(760);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(760);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(210);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(50);
  });

  it("Public Round Case3: treasuryClaim should mint remaing 200 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(200))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(960);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(960);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(210);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(250);
  });

  it("Public Round Case3: publicAuctionTransfer should be able mint 40 tokens", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();

    //_accountListPublicRoundPublicMinting[0] already have 5 tokens
    // For 30 tokens we need 6 more address each will have 5 tokens from index 1 to 6

    // Index 0 and 26 already have 5 token each
    // We will start from index 27 to 34 (8 address) so 5x8=40
    for(let i=27; i<= 34 ;i++){
      expect(await (nusic.connect(owner).publicAuctionTransfer(5, _accountListPublicRoundPublicMinting[i].address))).to.be.ok;
    }

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(1000);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(1000);

    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).minted).to.be.equal(125);
    expect((await (nusic.connect(owner).stage1Rounds(2))).treasuryClaimed).to.be.equal(125);
  
    expect((await (nusic.connect(owner).stage1Rounds(3))).minted).to.be.equal(250);
    expect((await (nusic.connect(owner).stage1Rounds(3))).treasuryClaimed).to.be.equal(250);
  });

  it("Public Round Case3: Minting of Pre-Seed, Public mint, publicAuctionTransfer and Treasury Claim should fail when all Public Round tokens already minted", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const amount = (await nusic.connect(addr3).price()).mul(1);
    await expect((nusic.connect(owner).preSeedMint(1, addr1.address))).to.be.revertedWith("Minting will exceed PreSeed supply");
    await expect((nusic.connect(_accountListPublicRoundPublicMinting[0]).stage1Mint(1, {value: amount}))).to.be.revertedWith("All minted for current round");
    await expect((nusic.connect(owner).publicAuctionTransfer(1, _accountListPublicRoundPublicMinting[0].address))).to.be.revertedWith("All minted for current round");
    await expect((nusic.connect(owner).treasuryClaim(1))).to.be.revertedWith("All Claimed for current round");
  });

  // Addr1 is being used as treasury address
  it("Public Round Case3: Withdraw with owner account should file and update balance of Treasury Address", async function () {
    const [owner,addr1,addr2,addr3] = await ethers.getSigners();
    const price = await nusic.connect(addr3).price();
    // Total public tokens 500, out of which:
    // 25 directly transferred to advisors
    // 225 minted by public in seed and private round
    // 75 transferred by owner to public, so no payment received
    // 75 minted by whitelisted address, payment received
    // 100 minted by non whitelisted, payment received
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
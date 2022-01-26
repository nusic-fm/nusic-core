import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from '@ethersproject/wallet';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { Nusic, Nusic__factory } from '../typechain';
var crypto = require('crypto');

describe("Nusic NFT Deployed: Seed Round Testing", function () {

  let nusic:Nusic;
  let _accountList:Wallet[] = [];
  let _accountListPrivateRound:Wallet[] = [];
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
  });

  it("All Constant parameters are properly set", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusic.connect(addr1).MAX_SUPPLY())).to.be.equal(10000);
    expect((await nusic.connect(addr1).MINT_PER_TXT())).to.be.equal(5);
    expect((await nusic.connect(addr1).MINT_PER_ADDR())).to.be.equal(10);
    expect((await nusic.connect(addr1).MAX_PRE_SEED_SUPPLY())).to.be.equal(25);
    expect((await nusic.connect(addr1).STAGE1_MAX_SUPPLY())).to.be.equal(1000);
  });

  it("preSeedMinted should zero, totalMinted should be 25 publicMintingAllowed and verifyWhitelist should false", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusic.connect(addr1).preSeedMinted())).to.be.equal(0);
    expect((await nusic.connect(addr1).totalMinted())).to.be.equal(25);
    expect((await nusic.connect(addr1).publicMintingAllowed())).to.be.equal(false);
    expect((await nusic.connect(addr1).verifyWhitelist())).to.be.equal(false);
  });

  it("All Funding Rounds should in inActive", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.false;
  });

  it("Pre-seed minting should work even no round is active - 5 minted", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    expect(await (nusic.connect(owner).preSeedMint(5, addr2.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMinted())).to.be.equal(5);
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(5);
  });

  it("setTreasuryAddress should update address properly", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).setTreasuryAddress(addr1.address))).to.be.ok;
    expect(await (nusic.connect(owner).tresuryAddress())).to.be.equal(addr1.address);
  });

  it("Seed round minting should fail when round is not active", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(5);
    await expect((nusic.connect(_accountList[0]).stage1Mint(5, {value: amount}))).to.be.revertedWith("Funding Round not active");
  });

  it("Activating Seed Round by Non-Owner user should fail", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(addr1).activateRound(1))).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Activating Seed Round should fail for incorrect round number", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).activateRound(0))).to.be.revertedWith("Invalid Round");
  });

  it("Activating Round out of orders should fail", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).activateRound(2))).to.be.revertedWith("Previous Round incomplete");
  });

  it("Activating Seed Round should work fine", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).activateRound(1))).to.be.ok;
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.true;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.false;
  });

  it("Seed round minting should failed when Insufficient funds sent", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(3);
    await expect((nusic.connect(addr2).stage1Mint(5, {value: amount}))).to.be.revertedWith("Insufficient Funds Sent");
  });

  it("Seed round minting should fail when when try to mint more then per transaction limit", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(6);
    await expect((nusic.connect(addr2).stage1Mint(6, {value: amount}))).to.be.revertedWith("Exceed Per Txt limit");
  });

  it("Seed round minting should mint 5 tokens for first address", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(5);
    expect(await (nusic.connect(_accountList[0]).stage1Mint(5, {value: amount}))).to.be.ok;
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(10);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(30);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(5);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(0);
  });

  it("Seed round minting should mint another 5 tokens for first address", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(5);
    expect(await (nusic.connect(_accountList[0]).stage1Mint(5, {value: amount}))).to.be.ok;
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(15);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(35);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(10);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(0);
  });

  it("Seed round minting should fail for address 1 because Per Address limit exceed", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(2);
    await expect((nusic.connect(_accountList[0]).stage1Mint(2, {value: amount}))).to.be.revertedWith("Exceed Per Address limit");
  });

  it("Pre-seed minting should work for remaining 20 tokens", async function () {
    const [owner,addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    expect(await (nusic.connect(owner).preSeedMint(5, addr2.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMint(5, addr3.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMint(5, addr4.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMint(5, addr5.address))).to.be.ok;
    expect(await (nusic.connect(owner).preSeedMinted())).to.be.equal(25);
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(35);
  });

  it("treasuryClaim should mint 50 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(50))).to.be.ok;
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(85);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(85);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(10);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(50);
  });

  // Upto this point 75 for treasury will be minted
  it("treasuryClaim should even if current round is deactivated", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).deactivateCurrentRound())).to.be.ok;
    expect(await (nusic.connect(owner).treasuryClaim(25))).to.be.ok;
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(110);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(110);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(10);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(75);
    expect(await (nusic.connect(owner).activateCurrentRound())).to.be.ok;
    
  });

  it("Seed minting should mint remaing token of seed round", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();

    const mintCount = await nusic.MINT_PER_TXT(); 
    const amount = (await nusic.connect(addr2).price()).mul(mintCount);

    for(let i=1; i<_accountList.length-2;i++){
      expect(await (nusic.connect(_accountList[i]).stage1Mint(5, {value: amount}))).to.be.ok;
    }
    const newAmount = (await nusic.connect(addr2).price()).mul(3);
    expect(await (nusic.connect(_accountList[18]).stage1Mint(3, {value: newAmount}))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(198);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(198);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(98);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(75);
  });

  it("Seed round minting should fail because quanity provided will exceed supply for round", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(3);
    await expect((nusic.connect(_accountList[18]).stage1Mint(3, {value: amount}))).to.be.revertedWith("Minting would exceed supply for round");
  });

  it("Activating Round Private when Seed round is incomplete should", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).activateRound(2))).to.be.revertedWith("Previous Round incomplete");
  });

  it("Seed round minting should final 2 token for public", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(2);
    expect(await (nusic.connect(_accountList[18]).stage1Mint(2, {value: amount}))).to.be.ok;

    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(200);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(200);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(75);
  });

  it("Seed round minting should fail when all token already minted for seed round", async function () {
    const [owner,addr1, addr2] = await ethers.getSigners();
    const amount = (await nusic.connect(addr2).price()).mul(1);
    await expect((nusic.connect(_accountList[19]).stage1Mint(1, {value: amount}))).to.be.revertedWith("All minted for current round");
  });

  it("treasuryClaim should mint remaining 50 token for treasury", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).treasuryClaim(50))).to.be.ok;
    expect(await (nusic.connect(owner).totalSupply())).to.be.equal(250);
    expect(await (nusic.connect(owner).totalMinted())).to.be.equal(250);
    expect((await (nusic.connect(owner).stage1Rounds(1))).minted).to.be.equal(100);
    expect((await (nusic.connect(owner).stage1Rounds(1))).treasuryClaimed).to.be.equal(125);
  });

  it("treasuryClaim should fail when all treasury token for seed round already minted", async function () {
    const [owner,addr1] = await ethers.getSigners();
    await expect((nusic.connect(owner).treasuryClaim(1))).to.be.revertedWith("All Claimed for current round");
  });

  // Testcase related to Private Round (2nd round) starts here
  it("Activating Private Round should work fine", async function () {
    const [owner,addr1] = await ethers.getSigners();
    expect(await (nusic.connect(owner).activateRound(2))).to.be.ok;
    expect((await nusic.connect(addr1).stage1Rounds(1)).isActive).to.be.false;
    expect((await nusic.connect(addr1).stage1Rounds(2)).isActive).to.be.true;
    expect((await nusic.connect(addr1).stage1Rounds(3)).isActive).to.be.false;
  });
});

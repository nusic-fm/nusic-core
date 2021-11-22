# NUSIC Core Contracts

## Deployed Addresses on Kovan
RatingEngine deployed to: 0xd2A3BF5f8B9F9fD1aF81b1BA47A896e562Aa28D1 <br>
ChainlinkOracleInfo deployed to: 0xDAccf5a4636c745c796182dCA912546f15C80133 <br>
ChainlinkMetadataRequest deployed to: 0xEDBbe0A5f876aF88b26B1f0BD06A43dC33EaDf81 <br>
BondNFTGenerator deployed to: 0x0F4763d3652aFB7d061909C5080ee9323b292540 <br>
BondNFTManager deployed to: 0x4cC90cb0217C13AF94f90ce3a79BfF68c92f68EB <br>

#### Deploy All Contracts
```shell
npx hardhat run scripts/01_deploy.ts --network kovan
```

#### Fund Chainlink Contracts 
Replace Contract Addresses in script then run following command
```shell
npx hardhat run scripts/02_fund-contracts.ts --network kovan
```

#### Create Asset Pool
```shell
npx hardhat create-asset-pool --contract < BondNFTManager Address > --network kovan
```

#### Read Asset Pool Details
```shell
npx hardhat read-asset-pool --contract < BondNFTManager Address > --asset-pool-creator-address < Asset pool creator Address > --network kovan
```

#### Issue NFT Bond
```shell
npx hardhat issue-nft-bond --contract < BondNFTManager Address > --asset-pool-address < Address of Asset Pool received from previous command > --network kovan
```

#### Verify Bond Creation
```shell
npx hardhat verify-nft-creation --nft-manager-contract-address < BondNFTManager Address >  --nft-creator-address < Bond NFT creator Address > --network kovan
```

#### Verify Bond Details which will be updated from Chainlink Oracle
```shell
npx hardhat verify-nft-bond --bond-contract-address < Bond NFT Address received in previous address > --network kovan
```




For TypeScript Configuration use this [link](https://hardhat.org/guides/typescript.html)

Below command will compile the contract and generates Typescript typings for contracts
```shell
npx hardhat compile
```

Below command will run TypeScript compiler and convert all TypeScript files to JS and placed them in dist folder
```shell
tsc
```

Below command will deploy contracts on hardhat network
```shell
npx hardhat run dist/scripts/sample-script.js
```


Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

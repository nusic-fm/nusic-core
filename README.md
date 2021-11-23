# NUSIC Core Contracts

## Deployed Addresses on Kovan
RatingEngine deployed to: 0x3EA4b78bc6bcbC9F2476288c32cf3E1396D48fb6 <br>
ChainlinkOracleInfo deployed to: 0xBE830E4fd86f81Ce0D8A1aC1091FfE802122C05C <br>
ChainlinkMetadataRequest deployed to: 0x84F1B27A0F47Bab3840d736E4bb49072c2fC1675 <br>
BondNFTGenerator deployed to: 0x917555471C809720E8bbd31352676662d7c8b088 <br>
BondNFTManager deployed to: 0xd0bF81468bE0c2a8e247d101b6b71F7E18E24907 <br>

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

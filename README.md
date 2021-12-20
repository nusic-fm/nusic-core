# NUSIC Core Contracts

## Inspiration

In 1997 David Bowie made history by packaging-up royalties from 25 of his albums as asset-backed securities and issuing them as what has become know as the "Bowie Bonds". Purchased by Prudential Insurance for $55million, the Bowie Bonds enabled the starman to to buy back his entire catalog and yielded a 7.9% APR for Prudential up to maturity a decade later. Imagine the musical renaissance if any artist across the music industry could access such powerful financial instruments...

[![NUSIC: NFT Music Bonds](https://scontent-lcy1-1.xx.fbcdn.net/v/t39.30808-6/262910985_2714201448876011_5321133549282659145_n.png?_nc_cat=104&ccb=1-5&_nc_sid=0debeb&_nc_ohc=0sAGXG4e0hoAX9LAvRL&_nc_ht=scontent-lcy1-1.xx&oh=9149dbaf1f9ec710062a0bd6fd021dd2&oe=61B69F1D)](https://youtu.be/jxtqWJucd6k)

Fast-forward to 2021, and while it is increasingly rare for record labels to offer advances to artists, there is more money locked in DeFi than the entire music industry made all year. Just as independent artists leveraged web 2.0 to manage their own distribution and promotion, with web 3.0 there is an opportunity for artists to regain financial control of their careers. NFTs offer the tooling to open-up financing for artists from the fiercely independent, to well-established legacy acts.

The NUSIC NFT music bond is designed as a standard to enable music creators to receive advances on future streaming income, giving fans and investors alike an opportunity to define the next generation of music, while sharing their success. Conceived as a chain-agnostic standard to be utilized across existing and emerging NFT marketplaces, our goal is to empower any musician, artist or institutional rights owners with sophisticated tools to maximize gains from their copyright.

## What it does

Music streaming is a digital-first technology, which has numerous verifiable data sources, therefore NUSIC bonds are focused on future streaming income, rather than music publishing in its entirety. Any rights owner with a Spotify for Artists account can mint an NFT bond, and by providing a collateral deposit for a single quarter the smart contract is able to offer a face value over the term of the bond, computing a rating based on artist popularity and quarterly collateral deposits.

The artist can fractionalize the bond, so they can offer it up as a collection on their NFT marketplace of choice. By making regular collateral deposits, a NUSIC bond issuer is able to maintain the rating, indicating the risk profile of the asset to the NFT holder. The rating engine is inspired by the work of rating agencies such as Fitch, Moody's and Standard & Poors, but designed for DeFi, meaning that the top ratings or investment grades are only possible through overcollateralization:

| Rating | Color | Grade | Spotify/YouTube Median | Over col. | Min Col. | Col. <1Q late | Col. >1Q late |
| ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- |
| AAA | ![AAA](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638140819849-AI4DYFOD3YE9HDAQL87T/AAA.png) | Investment | 5,000,000+ | ✔️  |  |  |  |
| AA | ![AA](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638140915257-ILRDLAFM0KR52MGGH9EC/AA.png)  | Investment | 500,000 - 4,999,999 | ✔️  |  |  |  |
| A | ![A](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638140927234-J0KWGPOICB9D4T8BSNAE/A.png) | Investment | 0 - 499,999 | ✔️  |  |  |  |
| III | ![III](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638140945354-PY53A16I1B6468AZJ3PT/III.png) | Speculative | 5,000,000+ |  | ✔️ |  |  |
| II | ![II](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638140958325-PJWQTF3VEPXFRKMZB84L/II.png) | Speculative | 500,000 - 4,999,999 |  | ✔️ |  |  |
| I | ![I](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638140972680-84HH1MP4MVV2P0DCH6NO/I.png) | Speculative | 0 - 499,999 |  | ✔️ |  |  |
| UUU | ![UUU](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638140991828-MXWKB3MVS9JQSL3FUCMB/UUU.png) | Speculative | 5,000,000+ |  |  | ✔️ |  |
| UU | ![UU](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638141004015-05O1LHWWKTGWVUFZP3HY/UU.png) | Speculative | 500,000 - 4,999,999 |  |  | ✔️ |  |
| U | ![U](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638141016865-J6NRTS6BNQ1JR52VJIW9/U.png) | Speculative | 0 - 499,999 |  |  | ✔️ |  |
| R | ![R](https://images.squarespace-cdn.com/content/v1/611cc8f5b6450924450d8366/1638141029733-015QYH9I0Y2H72F939UR/R.png) | Speculative | 0 - 5,000,000+ |  |  |  | ✔️ |

The rating names differentiate from established bond ratings. Maintaining the minimum collateral payments means the bond is rated in the top speculative grade, while there is a one quarter grace period before dropping to the lowest rating. The NFTs are dynamically updated over time to visualize the current rating through the color hierarchy referred to above.


## What's next for NUSIC: NFT Music Bonds

There are three important components which will enable NUSIC to become established as powerful DeFi infrastructure for NFT music bonds. The music streaming oracle network itself, the yield maximizer that multiplies returns, and the NUSIC DAO, which has the potential to ground the protocol in the real world and invite contribution from the music industry.

### Music Oracle Network

To maintain reliable music streaming data for processing in the NFT bonds, we propose the following music oracle network, which would see [Chartmetric](https://www.chartmetric.com), [Soundcharts](https://www.soundcharts.com) and [Songstats](https://www.songstats.com) becoming Data Providers in the Chainlink network, delivering aggregated music streaming number feeds from the top music streaming services and social networks:

![Music Oracle Network](https://scontent-mia3-1.xx.fbcdn.net/v/t39.30808-6/260657102_2712631615699661_3010365413079885934_n.png?_nc_cat=108&ccb=1-5&_nc_sid=e3f864&_nc_ohc=sH479qKVTVAAX_SrHao&_nc_oc=AQnVrl6bLmMaIJyCn_BGcoAkuOA2NiDvK6LXsHwbt1u6h2OWgrVFzTnptl8HcNfqxI8&_nc_ht=scontent-mia3-1.xx&oh=f2243b3d30181a4c20862d65102442ac&oe=61A7C316)

Bringing these data providers into the Chainlink network will also enable the existing on-chain music projects to innovate with new use-cases, while artists and tastemakers can complement their web 3.0 presence with their existing web 2.0 data.

### Yield Maximizer

In order to maximize the bond coupon rate for NFT holders while minimizing the further collateral deposits and interest payments from the bond issuers, a portion of the advance can be allocated to the Yield Maximizer. We are looking to leverage Sushi's [Bentobox](https://docs.sushi.com/products/bentobox) vault and/or other strategies/protocols so as to provide maximum yield for market participants.

![Yield Maximizer](https://scontent-mia3-1.xx.fbcdn.net/v/t39.30808-6/261124395_2712638855698937_7479942245748074067_n.png?_nc_cat=100&ccb=1-5&_nc_sid=0debeb&_nc_ohc=iH9NmpwY7TsAX8woVfU&_nc_ht=scontent-mia3-1.xx&oh=85a9f367ff3c4b027535682bb5ac60fe&oe=61A748F5)

### NUSIC DAO

The NUSIC DAO will enable real-world music streaming invoices and/or music catalogs to be provided as collateral, in order to give more security to the bond holders. NUSIC governance will advance the refinement of the bond rating engine, and enable DAO participants to access further music investment opportunities through the strength of the network.

# [Join Us!](https://nusic.fm/join-dao)




## Deployed Addresses on Rinkeby
RatingEngine deployed to: 0x960319ef5663148bd03AbEeaf0EaB00A9C89bc1b <br>
ChainlinkSpotifyListeners deployed to: 0x05cA3e08c871D6CE41AaffdEB59d71088dFD76F0 <br>
ChainlinkYoutubeSubscribers deployed to: 0xc24b4940D52B97F6D2754F51CE40b38e64E81d9B <br>
ChainlinkMetadataRequest deployed to: 0x681Ffe5CCfA0576017e82ab87efBDe130C5930AF <br>
BondNFTGenerator deployed to: 0x9e51efE23277Ed2547c16F502463105db318bdaF <br>
BondNFTManager deployed to: 0x69D6B89B4Ec7F07b81E877772b87e2AD248396Be <br>

#### Deploy All Contracts
```shell
npx hardhat run scripts/01_deploy.ts --network rinkeby
```

#### Fund Chainlink Contracts 
Replace Contract Addresses in script then run following command
```shell
npx hardhat run scripts/02_fund-contracts.ts --network rinkeby
```

#### Create Asset Pool
```shell
npx hardhat create-asset-pool --contract < BondNFTManager Address > --network rinkeby
```

#### Read Asset Pool Details
```shell
npx hardhat read-asset-pool --contract < BondNFTManager Address > --asset-pool-creator-address < Asset pool creator Address > --network rinkeby
```

#### Issue NFT Bond
```shell
npx hardhat issue-nft-bond --contract < BondNFTManager Address > --asset-pool-address < Address of Asset Pool received from previous command > --network rinkeby
```

#### Verify Bond Creation
```shell
npx hardhat verify-nft-creation --nft-manager-contract-address < BondNFTManager Address >  --nft-creator-address < Bond NFT creator Address > --network rinkeby
```

#### Verify Bond Details which will be updated from Chainlink Oracle
```shell
npx hardhat verify-nft-bond --bond-contract-address < Bond NFT Address received in previous address > --network rinkeby
```

#### Mint Tokens for Particular NFT Bond
```shell
npx hardhat mint-nft --nft-manager-address < BondNFTManager Address > --nft-bond-address <Bond NFT Token Address> --network rinkeby
```

#### Read Bond NFT Details
```shell
npx hardhat read-token-details --nft-bond-address <Bond NFT Token Address> --network rinkeby
```

#### Set Base URI for NFT Bond Metadata
```shell
npx hardhat set-token-uri --nft-bond-address <Bond NFT Token Address> --uri < UIR Here > --network rinkeby
```

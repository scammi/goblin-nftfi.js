# Goblin-NFTfi.js

NFTFi SDK that includes specific module to ease working with goblin sax.

It exposes a new class `goblin` that can be use to fetch goblin specific offers, create and manage loans.

## Sample 

``` js
  const nftfi = await NFTfi.init({
    config: {
      alchemy: {
        rinkeby: { key: process.env.ALCHEMY_RINKEBY_KEY }
      }
    },
    ethereum: {
      account: {
        privateKey: process.env.NFTFI_SDK_ETHEREUM_LENDER_ACCOUNT_PRIVATE_KEY,
        address: process.env.USER_ADDRESS // User connected address.
      },
      provider: {
        url: process.env.NFTFI_SDK_ETHEREUM_PROVIDER_URL
      }
    }
  });

  const loanOffers = await nftfi.goblin.getLoanOffers();
  const loanOffer = loanOffers[0];

  const offer = {
    address: loanOffers.tokenAddress,
    id: loanOffers.tokenId,
    duration: Object.keys(loanOffer.offers)[0],
    borrowerAddress: process.env.USER_ADDRESS,
    principal: ethers.utils.formatUnits(loanOffer.maxLoan, 'wei'), //'55000000000000000' maxLoan
    apr: '10',  // loan.offers[0].apr
    referralAddress: '0x0000000000000000000000000000000000000000',
  }

  const beginLoanStatus =await nftfi.goblin.beginLoan(offer);
  console.log(beginLoanStatus);
```

## Install

```shell
yarn install

cd hardhat 

yarn install
```

## Test

```
cd hardhat
npx hardhat test
```
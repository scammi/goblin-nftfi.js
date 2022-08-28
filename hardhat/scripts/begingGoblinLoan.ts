// @ts-ignore
import NFTfi from '../../src/nftfi.js';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();

async function run() {
  // Init the NFTfi SDK
  const nftfi = await NFTfi.init({
    config: {
      alchemy: {
        rinkeby: { key: process.env.ALCHEMY_RINKEBY_KEY }
      }
    },
    ethereum: {
      account: {
        privateKey: process.env.NFTFI_SDK_ETHEREUM_LENDER_ACCOUNT_PRIVATE_KEY,
        address: "0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A" // User connected address.
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
    borrowerAddress: '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A',
    principal: ethers.utils.formatUnits(loanOffer.maxLoan, 'wei'), //'55000000000000000' maxLoan
    apr: '10',  // loan.offers[0].apr
    referralAddress: '0x0000000000000000000000000000000000000000',
  }

  const beginLoanStatus =await nftfi.goblin.beginLoan(offer);
  console.log(beginLoanStatus);
  //   const loansOffers = await nftfi.goblin.trackLoans();
  //   console.log(loansOffers);

}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

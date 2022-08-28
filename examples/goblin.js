import NFTfi from '@nftfi/js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  // Init the NFTfi SDK
  const nftfi = await NFTfi.init({
    // config: { api: { key: process.env.NFTFI_SDK_API_KEY } },
    config: { alchemy: {
      rinkeby: { key: process.env.ALCHEMY_RINKEBY_KEY}
    } },
    ethereum: {
      account: { 
        privateKey: process.env.NFTFI_SDK_ETHEREUM_LENDER_ACCOUNT_PRIVATE_KEY,
        address: "0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A"
      },
      provider: { 
        url: process.env.NFTFI_SDK_ETHEREUM_PROVIDER_URL 
        // url: process.env.FORKED_ETHEREUM_PROVIDER_URL 
      }
    }
  });
  // Get listings

  const offer = {
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    id: '5224',
    duration: '30',
    borrowerAddress: '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A',
    principal: '55000000000000000',
    apr: '10',
    referralAddress: '0x0000000000000000000000000000000000000000',
  };

  nftfi.goblin.beginLoan(offer);
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

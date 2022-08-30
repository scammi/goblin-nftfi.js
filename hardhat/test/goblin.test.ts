// @ts-ignore
import NFTfi from '../../src/nftfi.js';
import dotenv from 'dotenv';
import { expect } from 'chai';
dotenv.config();

let nftfi;
describe('Goblin Sax SDK', () => {
  beforeEach(async () => {
    nftfi = await NFTfi.init({
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
          // url: process.env.FORKED_ETHEREUM_PROVIDER_URL
        }
      }
    });
  });

  it ('Gets Goblin Sax loans ', async () => {
    const loanOffers = await nftfi.goblin.getLoanOffers();

    console.log('Offers: ',loanOffers[0].body.offers['7']);

    expect(loanOffers).to.not.be.empty;
    expect(loanOffers).to.haveOwnProperty('0');
    expect(loanOffers[0]).to.have.property('success', true);
  });

  it('Beging Goblin loan', async () => {
    // offer object can be constructed from the getLoanOffers method. 
    const offer = {
      address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      id: '5224',
      duration: '30',
      borrowerAddress: '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A',
      principal: '55000000000000000',
      apr: '10',
      referralAddress: '0x0000000000000000000000000000000000000000',
    };

    expect(await nftfi.goblin.beginLoan(offer)).not.to.throw;
  });
});
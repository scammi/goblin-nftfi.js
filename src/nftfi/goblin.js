import axios from "axios";
import { ethers } from "ethers";

/**
 * @class
 * Class for working with goblin.
 */

// HELPERS
const _getUserNfts = async (config, accountAddress) => {
  const apiKey = config?.alchemy?.rinkeby?.key;

  const results = await axios({
    method: 'get',
    url: `https://eth-rinkeby.g.alchemy.com/nft/v2/${apiKey}/getNFTs?owner=${accountAddress}`,
  });

  return results?.data?.ownedNfts;
};

const _getGoblinAllowListedNFTs = async () => {
  const rinkebyTestToken = '0xf5de760f2e916647fd766b4ad9e85ff943ce3a2b';

  const allowListedNFTsObject = await axios({
    method: 'get',
    url: 'https://api.goblinsax.xyz/collections/',
  });

  const allowListed = [rinkebyTestToken];

  for (const key in allowListedNFTsObject?.data) {
    const tokenAddress = allowListedNFTsObject?.data[key]?.asset_contract;
    allowListed.push(tokenAddress);
  }

  return allowListed;
};

class Goblin {
  #config;
  #account;
  #erc721;
  #loans;
  #provider;
  baseGoblinUrl = 'https://sdm6h8zgmd.execute-api.us-east-1.amazonaws.com/prod/';

  constructor(options = {}) {
    this.#config = options?.config;
    this.#account = options?.account;
    this.#erc721 = options?.erc721;
    this.#loans = options?.loans;
    this.#provider = options?.provider;
  }

    /**
   * Gets goblins terms for users NFTs filtered by allow listed.
   *
   * @returns {Array<object>} Array of offers 
   *
   */
  async getLoanOffers() {
    const goblinAllowListedNFTs = await _getGoblinAllowListedNFTs();
    const userNFTs = await _getUserNfts(this.#config, this.#account.getAddress(),);

    // get goblin loan terms.
    const allPossibleTerms = [];
    for (const key in userNFTs) {
      const tokenAddress = userNFTs[key].contract.address;
      const tokenId = userNFTs[key].id.tokenId;

      if (!goblinAllowListedNFTs.includes(tokenAddress)) {
        continue;
      }

      const termForNFT = await axios({
        method: 'get',
        url: `${this.baseGoblinUrl}api/get-loan-terms?address=${tokenAddress}&id=${tokenId}`
      })

      allPossibleTerms.push({
        ...termForNFT.data,
        tokenAddress,
        tokenId,
      });
    }
    return allPossibleTerms;
  }

    /**
   * Begin loan with goblin.
   *  1. fetches offer terms 
   *  2. inits loan
   *
   * @param {object} offer
   *
   */
  async beginLoan(offer) {
    // Fetch the goblin sax offer: 
    const offerRequestUrl = new URL('api/create-offer', this.baseGoblinUrl);
    // construct URL query.
    for (const key in offer) { offerRequestUrl.searchParams.set(key, offer[key]); }

    const createOfferResponse = await axios({
      method: 'GET',
      url: offerRequestUrl.href
    });

    const offerTerms = createOfferResponse?.data?.body?.result;

    // Grant permissions to nftfi
    await this.#erc721.setApprovalForAll({
      token: {
        address: offerTerms.nft.address
      },
      nftfi: {
        contract: {
          name: offerTerms.nftfi.contract.name
        }
      }
    });

    // Create loan
    const loanResult = await this.#loans.begin(offerTerms);
    if (loanResult === true) {
      console.log('[INFO] loan has begun');
    } else {
      console.log('[ERROR] loan could not begin');
    }
  }

  async getOnGoingLoans() {
    // wrapper to get current loans using the NFTFi API.
    const loans = await this.#loans.get({
      filters: {
        counterparty: 'borrower',
        status: 'escrow'
      }
    });
    return loans;

    /*
      An alternative to using NFTFi api would be to 
        - set up The graph to track the started loan event.
        - for every loan started on goblin save it using serverless hooks
    */
  }

    /**
   *  Gets tracks and pays open user loans.
   *   
   */
  async trackAndResolveLoans(blockRepayThreshold = 50) {
    // get on going loans
    const openLoans = await this.getOnGoingLoans();

    const directLoanCoordinatorContract = new ethers.Contract(
      '0xfe9B322632D85ccC5DEf0Cf3010a384d17C50582', // rinkeby
      ['function getLoanData(uint32 _loanId) external view override returns (Loan memory)'],
      this.#account.getSigner()
    );
    
    // Gather loans data from chain
    const openLoansData = [];
    for (const key in openLoans) {
      const loanId = openLoans[key].id;
      const loanData = await directLoanCoordinatorContract.getLoanData(loanId);
      openLoansData.push(loanData);
    };

    // Event listener for new block, callback is executed on every emitted block. 
    this.#provider.on('block', (blockNumber) => {
      openLoansData.forEach((loan) => {

        // If block number crosses threshold repay loan.
        if ((blockNumber - blockRepayThreshold) <= (loan.loanStartTime + loan.loanDuration)) {
          const repaymentStatus = this.#loans.repay({
            loan: { id: loan.id },
            nftfi: { contract: { name: loan.nftfi.contract.name } }
          });
          if (repaymentStatus.success === true) {
            console.log(`[INFO] loan has be repaid ${loan.id}`);
          } else {
            console.log(`[INFO] loan could not be repaid, ${loan.id}`);
          }
        };
      });
    });
  }
}

export default Goblin;

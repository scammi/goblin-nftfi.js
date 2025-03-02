class LoansFixedV1 {
  #config;
  #contractFactory;
  #contract;

  constructor(options) {
    this.#config = options?.config;
    this.#contractFactory = options?.contractFactory;
    this.#contract = this.#contractFactory.create({
      address: this.#config.loan.fixed.v1.address,
      abi: this.#config.loan.fixed.v1.abi
    });
  }

  async liquidateOverdueLoan(options) {
    let success;
    try {
      const result = await this.#contract.call({
        function: 'liquidateOverdueLoan',
        args: [options.loan.id]
      });
      success = result?.status === 1 ? true : false;
    } catch (e) {
      success = false;
    }
    return success;
  }

  async payBackLoan(options) {
    let success;
    try {
      const result = await this.#contract.call({
        function: 'payBackLoan',
        args: [options.loan.id]
      });
      success = result?.status === 1 ? true : false;
    } catch (e) {
      success = false;
    }
    return success;
  }
}

export default LoansFixedV1;

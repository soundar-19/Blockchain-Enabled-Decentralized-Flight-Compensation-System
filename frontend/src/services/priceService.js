/**
 * Price Service
 * Fetches real ETH prices and handles all currency conversions
 * Prices match MetaMask display
 */

class PriceService {
  constructor() {
    this.ETH_PRICE_USD = 2000; // Default, will be updated from API
    this.updateInterval = null;
    this.initializePriceUpdates();
  }

  /**
   * Fetch real ETH price from CoinGecko API (free, no auth needed)
   */
  async fetchETHPrice() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      
      if (response.ok) {
        const data = await response.json();
        this.ETH_PRICE_USD = data.ethereum.usd;
        console.log(`✅ ETH Price Updated: $${this.ETH_PRICE_USD.toFixed(2)} USD`);
        return this.ETH_PRICE_USD;
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch ETH price, using previous value:', error);
    }
    return this.ETH_PRICE_USD;
  }

  /**
   * Initialize automatic price updates every 60 seconds
   */
  initializePriceUpdates() {
    // Fetch immediately
    this.fetchETHPrice();
    
    // Update every 60 seconds
    this.updateInterval = setInterval(() => {
      this.fetchETHPrice();
    }, 60000);
  }

  /**
   * Stop price updates (cleanup)
   */
  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  /**
   * Convert ETH to USD using real price
   * @param {string} ethAmount - Amount in ETH
   * @returns {string} Amount in USD
   */
  convertETHToUSD(ethAmount) {
    const eth = parseFloat(ethAmount);
    const usd = eth * this.ETH_PRICE_USD;
    return usd.toFixed(2);
  }

  /**
   * Convert USD to ETH using real price
   * @param {string} usdAmount - Amount in USD
   * @returns {string} Amount in ETH
   */
  convertUSDToETH(usdAmount) {
    const usd = parseFloat(usdAmount);
    const eth = usd / this.ETH_PRICE_USD;
    return eth.toFixed(6);
  }

  /**
   * Get current ETH price in USD
   * @returns {number} ETH price in USD
   */
  getETHPrice() {
    return this.ETH_PRICE_USD;
  }

  /**
   * Format balance for display
   * @param {string} ethAmount - Amount in ETH
   * @returns {object} Formatted display object
   */
  formatBalance(ethAmount) {
    const eth = parseFloat(ethAmount);
    const usd = this.convertETHToUSD(ethAmount);

    return {
      eth: eth.toFixed(6),
      usd: `$${usd}`,
      display: `${eth.toFixed(6)} ETH ($${usd})`,
      ethFormatted: `${eth.toFixed(6)} ETH`,
      usdFormatted: `$${usd}`,
      displayShort: `${eth.toFixed(6)} ⛽ | $${usd}`
    };
  }

  /**
   * Get exchange rates
   * @returns {object} Current exchange rates
   */
  getExchangeRates() {
    return {
      ethToUsd: this.ETH_PRICE_USD,
      rates: `1 ETH = $${this.ETH_PRICE_USD.toFixed(2)}`
    };
  }

  /**
   * Format transaction amount for display
   * @param {string} ethAmount - Amount in ETH
   * @returns {string} Formatted string (e.g., "0.05 ETH ($100.00)")
   */
  formatTransaction(ethAmount) {
    const formatted = this.formatBalance(ethAmount);
    return `${formatted.eth} ETH (${formatted.usd})`;
  }

  /**
   * Get USD equivalent for display
   * @param {string} ethAmount - Amount in ETH
   * @returns {string} USD formatted with dollar sign
   */
  getUSDValue(ethAmount) {
    const usd = this.convertETHToUSD(ethAmount);
    return `$${usd}`;
  }

  /**
   * Format ETH amount with USD value
   * @param {number} ethAmount - Amount in ETH
   * @returns {object} Formatted amounts
   */
  formatETHWithUSD(ethAmount) {
    const eth = parseFloat(ethAmount);
    const usd = this.convertETHToUSD(ethAmount);
    
    return {
      eth: eth.toFixed(6),
      usd: usd,
      display: `${eth.toFixed(6)} ETH ($${usd})`,
      ethOnly: `${eth.toFixed(6)} ETH`,
      usdOnly: `$${usd}`
    };
  }
}

export default new PriceService();

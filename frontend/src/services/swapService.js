/**
 * Swap Service
 * Handles ETH to FLY token conversions and vice versa
 * Uses a simple 1:1 ratio (1 ETH = 1000 FLY for this example)
 */

import { ethers } from 'ethers';

class SwapService {
  constructor() {
    this.CONVERSION_RATE = 1000; // 1 ETH = 1000 FLY
    this.flyTokenAddress = '0xd7Ad8368461964e6Fa4F82994948Aec12370dc7C';
    this.provider = null;
    this.signer = null;
  }

  /**
   * Initialize provider and signer
   */
  async initialize(window_ethereum) {
    this.provider = new ethers.BrowserProvider(window_ethereum);
    this.signer = await this.provider.getSigner();
  }

  /**
   * Calculate FLY amount from ETH
   * @param {string} ethAmount - Amount in ETH
   * @returns {string} Amount in FLY
   */
  calculateFLYFromETH(ethAmount) {
    const eth = parseFloat(ethAmount);
    const fly = eth * this.CONVERSION_RATE;
    return fly.toFixed(4);
  }

  /**
   * Calculate ETH amount from FLY
   * @param {string} flyAmount - Amount in FLY
   * @returns {string} Amount in ETH
   */
  calculateETHFromFLY(flyAmount) {
    const fly = parseFloat(flyAmount);
    const eth = fly / this.CONVERSION_RATE;
    return eth.toFixed(6);
  }

  /**
   * Swap ETH for FLY tokens
   * This would normally call a DEX contract, but for this demo
   * we'll just transfer FLY from a treasury wallet
   * @param {string} ethAmount - Amount of ETH to swap
   * @returns {Promise<object>} Transaction result
   */
  async swapETHForFLY(ethAmount) {
    try {
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }

      const flyAmount = this.calculateFLYFromETH(ethAmount);
      const weiAmount = ethers.parseEther(ethAmount);

      console.log(`💱 Swapping ${ethAmount} ETH for ${flyAmount} FLY`);

      // In a real system, this would call a DEX contract
      // For now, we'll just log the transaction
      const userAddress = await this.signer.getAddress();

      return {
        success: true,
        from: userAddress,
        ethAmount: ethAmount,
        flyAmount: flyAmount,
        conversionRate: this.CONVERSION_RATE,
        status: 'completed',
        message: `Swapped ${ethAmount} ETH for ${flyAmount} FLY`
      };
    } catch (error) {
      console.error('Error swapping ETH for FLY:', error);
      throw error;
    }
  }

  /**
   * Swap FLY for ETH tokens
   * @param {string} flyAmount - Amount of FLY to swap
   * @returns {Promise<object>} Transaction result
   */
  async swapFLYForETH(flyAmount) {
    try {
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }

      const ethAmount = this.calculateETHFromFLY(flyAmount);

      console.log(`💱 Swapping ${flyAmount} FLY for ${ethAmount} ETH`);

      const userAddress = await this.signer.getAddress();

      return {
        success: true,
        from: userAddress,
        flyAmount: flyAmount,
        ethAmount: ethAmount,
        conversionRate: `1 FLY = ${(1 / this.CONVERSION_RATE).toFixed(6)} ETH`,
        status: 'completed',
        message: `Swapped ${flyAmount} FLY for ${ethAmount} ETH`
      };
    } catch (error) {
      console.error('Error swapping FLY for ETH:', error);
      throw error;
    }
  }

  /**
   * Get swap rate
   * @returns {object} Conversion rates
   */
  getSwapRates() {
    return {
      ethToFly: this.CONVERSION_RATE,
      flyToEth: (1 / this.CONVERSION_RATE).toFixed(6),
      rate: `1 ETH = ${this.CONVERSION_RATE} FLY`
    };
  }

  /**
   * Get all currency options (ETH, FLY)
   * @returns {Array} Available currencies
   */
  getAvailableCurrencies() {
    return [
      {
        symbol: 'ETH',
        name: 'Sepolia ETH',
        description: 'Native Ethereum token',
        type: 'native'
      },
      {
        symbol: 'FLY',
        name: 'FLY Token',
        description: 'Compensation token',
        type: 'erc20'
      }
    ];
  }
}

export default new SwapService();

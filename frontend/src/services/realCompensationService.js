/**
 * Real Compensation Service
 * Handles real ETH/FLY transactions for compensation
 */

import { ethers } from 'ethers';
import priceService from './priceService';

class RealCompensationService {
  constructor() {
    this.SEPOLIA_CHAIN_ID = '11155111';
    this.INFURA_RPC = 'https://sepolia.infura.io/v3/a75bc1be3bb44560b0b7c4abc3986efa';
    this.FLY_TOKEN_CONTRACT = '0xd7Ad8368461964e6Fa4F82994948Aec12370dc7C';
    this.COMPENSATION_CONTRACT = '0xDAf5b99d2268c3f50dACa240c3bF254E2954Feb4';
    this.API_BASE = 'http://localhost:5000';
    this.provider = null;
    this.initProvider();
  }

  initProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.INFURA_RPC);
    } catch (error) {
      console.error('Failed to init provider:', error);
    }
  }

  /**
   * Send ETH compensation to recipient
   * @param {string} toAddress - Recipient address
   * @param {string} ethAmount - Amount in ETH
   * @param {object} bookingData - Booking information
   * @returns {Promise<object>} Transaction result
   */
  async sendETHCompensation(toAddress, ethAmount, bookingData) {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.JsonRpcProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create transaction
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(ethAmount.toString()),
        data: ethers.toBeHex(JSON.stringify(bookingData).slice(0, 32)) // Store minimal booking ref
      });

      console.log('✅ ETH Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      // Log to backend
      await this.logCompensationToBackend({
        type: 'ETH',
        toAddress,
        ethAmount,
        usdAmount: priceService.convertETHToUSD(ethAmount),
        flyEquivalent: priceService.convertETHToFLY(ethAmount),
        txHash: tx.hash,
        bookingId: bookingData._id,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        amount: ethAmount,
        currency: 'ETH',
        usdValue: priceService.convertETHToUSD(ethAmount),
        flyEquivalent: priceService.convertETHToFLY(ethAmount)
      };
    } catch (error) {
      console.error('❌ Error sending ETH:', error);
      throw error;
    }
  }

  /**
   * Send USD-equivalent ETH compensation
   * @param {string} toAddress - Recipient address
   * @param {string} usdAmount - Amount in USD
   * @param {object} bookingData - Booking information
   * @returns {Promise<object>} Transaction result
   */
  async sendUSDEquivalentCompensation(toAddress, usdAmount, bookingData) {
    try {
      // Convert USD to ETH
      const ethAmount = priceService.convertUSDToETH(usdAmount);
      
      return await this.sendETHCompensation(toAddress, ethAmount, bookingData);
    } catch (error) {
      console.error('❌ Error sending USD-equivalent compensation:', error);
      throw error;
    }
  }

  /**
   * Send FLY token compensation (if available)
   * @param {string} toAddress - Recipient address
   * @param {string} flyAmount - Amount in FLY tokens
   * @param {object} bookingData - Booking information
   * @returns {Promise<object>} Transaction result
   */
  async sendFLYCompensation(toAddress, flyAmount, bookingData) {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.JsonRpcProvider(window.ethereum);
      const signer = await provider.getSigner();

      // FLY Token ABI (transfer function)
      const FLY_ABI = [
        'function transfer(address to, uint256 amount) public returns (bool)',
        'function decimals() public view returns (uint8)'
      ];

      const flyContract = new ethers.Contract(this.FLY_TOKEN_CONTRACT, FLY_ABI, signer);
      
      // Get decimals and convert amount
      const decimals = 18; // Standard ERC20
      const amount = ethers.parseUnits(flyAmount.toString(), decimals);

      // Send FLY tokens
      const tx = await flyContract.transfer(toAddress, amount);

      console.log('✅ FLY Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      // Convert to ETH equivalent
      const ethEquivalent = priceService.convertFLYToETH(flyAmount);
      const usdEquivalent = priceService.convertETHToUSD(ethEquivalent);

      // Log to backend
      await this.logCompensationToBackend({
        type: 'FLY',
        toAddress,
        flyAmount,
        ethEquivalent,
        usdAmount: usdEquivalent,
        txHash: tx.hash,
        bookingId: bookingData._id,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        amount: flyAmount,
        currency: 'FLY',
        ethEquivalent,
        usdValue: usdEquivalent
      };
    } catch (error) {
      console.error('❌ Error sending FLY:', error);
      throw error;
    }
  }

  /**
   * Calculate transaction fee for ETH transaction
   * @param {string} ethAmount - Amount in ETH
   * @returns {Promise<object>} Fee information
   */
  async estimateGasFee(ethAmount) {
    try {
      const gasPrice = await this.provider.getGasPrice();
      const gasLimit = 21000; // Standard ETH transfer
      
      const gasCost = (BigInt(gasLimit) * gasPrice) / BigInt(10 ** 18);
      const gasCostInEth = parseFloat(ethers.formatEther(gasCost * BigInt(10 ** 18)).toString());
      const gasCostInUSD = priceService.convertETHToUSD(gasCostInEth.toFixed(6));

      return {
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        gasLimit,
        totalGas: ethers.formatEther(gasPrice * BigInt(gasLimit)),
        gasCostUSD: gasCostInUSD,
        totalWithGas: (parseFloat(ethAmount) + gasCostInEth).toFixed(6),
        totalWithGasUSD: priceService.convertETHToUSD((parseFloat(ethAmount) + gasCostInEth).toFixed(6))
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      return { error: error.message };
    }
  }

  /**
   * Get compensation options with real prices
   * @param {object} booking - Booking object
   * @returns {object} Compensation options
   */
  getCompensationOptions(booking) {
    const baseETH = booking.compensation?.eth_amount || 0.01; // Default 0.01 ETH
    const baseUSD = priceService.convertETHToUSD(baseETH.toFixed(6));
    const baseFLY = priceService.convertETHToFLY(baseETH.toFixed(6));

    return {
      eth: {
        amount: baseETH.toFixed(6),
        usd: baseUSD,
        fly: baseFLY,
        display: `${baseETH.toFixed(6)} ETH ($${baseUSD})`
      },
      usd: {
        amount: baseUSD,
        eth: baseETH.toFixed(6),
        fly: baseFLY,
        display: `$${baseUSD} (${baseETH.toFixed(6)} ETH)`
      },
      fly: {
        amount: baseFLY,
        eth: baseETH.toFixed(6),
        usd: baseUSD,
        display: `${baseFLY} FLY (${baseETH.toFixed(6)} ETH, $${baseUSD})`
      }
    };
  }

  /**
   * Log compensation transaction to backend
   * @param {object} compensationData - Data to log
   * @returns {Promise<object>} Backend response
   */
  async logCompensationToBackend(compensationData) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.API_BASE}/api/blockchain/send-compensation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(compensationData)
      });

      if (!response.ok) {
        console.warn('⚠️ Failed to log compensation:', response.statusText);
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging compensation:', error);
    }
  }

  /**
   * Get transaction history for user
   * @param {string} userAddress - User wallet address
   * @returns {Promise<array>} Transaction history
   */
  async getCompensationHistory(userAddress) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${this.API_BASE}/api/blockchain/compensation-history?address=${userAddress}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.history || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  /**
   * Format compensation for display
   * @param {object} compensation - Compensation object
   * @returns {string} Formatted display string
   */
  formatCompensation(compensation) {
    if (compensation.type === 'ETH') {
      return `${compensation.amount} ETH ($${compensation.usdAmount})`;
    } else if (compensation.type === 'FLY') {
      return `${compensation.amount} FLY (~${compensation.ethEquivalent} ETH)`;
    } else if (compensation.type === 'USD') {
      return `$${compensation.amount} (~${compensation.ethEquivalent} ETH)`;
    }
    return 'Unknown';
  }
}

export default new RealCompensationService();

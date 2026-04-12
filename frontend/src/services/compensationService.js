/**
 * Compensation Service
 * Handles sending ETH/FLY tokens to users as compensation
 */

import { ethers } from 'ethers';

class CompensationService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.flyTokenAddress = import.meta.env.VITE_FLY_TOKEN_ADDRESS || '0xd7Ad8368461964e6Fa4F82994948Aec12370dc7C';
    this.compensationContractAddress = import.meta.env.VITE_COMPENSATION_CONTRACT_ADDRESS || '0xDAf5b99d2268c3f50dACa240c3bF254E2954Feb4';
  }

  /**
   * Initialize provider and signer
   */
  async initialize(window_ethereum) {
    this.provider = new ethers.BrowserProvider(window_ethereum);
    this.signer = await this.provider.getSigner();
  }

  /**
   * Send ETH to user as compensation
   * @param {string} toAddress - Recipient address
   * @param {string} amountEth - Amount in ETH (e.g., "0.05")
   * @param {string} description - Compensation reason
   * @returns {Promise<string>} Transaction hash
   */
  async sendCompensationETH(toAddress, amountEth, description = 'Flight Delay Compensation') {
    try {
      if (!this.signer) {
        throw new Error('Signer not initialized. Connect MetaMask first.');
      }

      // Validate address
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Parse amount
      const weiAmount = ethers.parseEther(amountEth);

      console.log(`Sending ${amountEth} ETH to ${toAddress}`);
      console.log(`Reason: ${description}`);

      // Send transaction
      const tx = await this.signer.sendTransaction({
        to: toAddress,
        value: weiAmount
      });

      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: amountEth,
        to: toAddress,
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Error sending compensation:', error);
      throw error;
    }
  }

  /**
   * Get FLY token balance for an address
   * @param {string} address - Address to check
   * @returns {Promise<string>} Balance in FLY tokens
   */
  async getFLYBalance(address) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      // ERC20 ABI for balanceOf
      const erc20ABI = [
        'function balanceOf(address owner) public view returns (uint256)',
        'function decimals() public view returns (uint8)',
        'function symbol() public view returns (string)',
        'function name() public view returns (string)'
      ];

      const contract = new ethers.Contract(
        this.flyTokenAddress,
        erc20ABI,
        this.provider
      );

      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      const balanceFormatted = ethers.formatUnits(balance, decimals);

      return {
        raw: balance.toString(),
        formatted: balanceFormatted,
        decimals: decimals
      };
    } catch (error) {
      console.error('Error getting FLY balance:', error);
      return {
        raw: '0',
        formatted: '0',
        decimals: 18
      };
    }
  }

  /**
   * Get ETH balance for an address
   * @param {string} address - Address to check
   * @returns {Promise<string>} Balance in ETH
   */
  async getETHBalance(address) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const balance = await this.provider.getBalance(address);
      const balanceEth = ethers.formatEther(balance);

      return {
        raw: balance.toString(),
        formatted: balanceEth
      };
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      return {
        raw: '0',
        formatted: '0'
      };
    }
  }

  /**
   * Transfer FLY tokens to user (requires contract interaction)
   * @param {string} toAddress - Recipient address
   * @param {string} amountFLY - Amount of FLY tokens
   * @returns {Promise<object>} Transaction result
   */
  async sendCompensationFLY(toAddress, amountFLY) {
    try {
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }

      const erc20ABI = [
        'function transfer(address to, uint256 amount) public returns (bool)',
        'function decimals() public view returns (uint8)'
      ];

      const contract = new ethers.Contract(
        this.flyTokenAddress,
        erc20ABI,
        this.signer
      );

      // Get decimals
      const decimals = await contract.decimals();
      const weiAmount = ethers.parseUnits(amountFLY, decimals);

      console.log(`Transferring ${amountFLY} FLY to ${toAddress}`);

      // Send transaction
      const tx = await contract.transfer(toAddress, weiAmount);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: amountFLY,
        to: toAddress,
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Error sending FLY tokens:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for an address
   * @param {string} address - Address to check
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object>} Transaction details
   */
  async getTransactionDetails(txHash) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        value: ethers.formatEther(tx.value),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        timestamp: receipt.timestamp
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for ETH transfer
   * @param {string} toAddress - Recipient
   * @param {string} amountEth - Amount in ETH
   * @returns {Promise<string>} Estimated gas in ETH
   */
  async estimateETHTransferGas(toAddress, amountEth) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const userAddress = await this.signer.getAddress();
      const weiAmount = ethers.parseEther(amountEth);

      const estimatedGas = await this.provider.estimateGas({
        from: userAddress,
        to: toAddress,
        value: weiAmount
      });

      const gasPrice = await this.provider.getGasPrice();
      const gasCostWei = estimatedGas * gasPrice;
      const gasCostEth = ethers.formatEther(gasCostWei);

      return {
        gasLimit: estimatedGas.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedCost: gasCostEth,
        estimatedCostGwei: ethers.formatUnits(gasCostWei, 'gwei')
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Log compensation transaction to backend for tracking
   * @param {string} userWallet - User's wallet address
   * @param {number} amount - Amount of compensation
   * @param {string} tokenType - 'ETH' or 'FLY'
   * @param {string} bookingId - Booking ID (optional)
   * @param {string} transactionHash - Transaction hash from blockchain
   * @returns {Promise<object>} Response from backend
   */
  async logCompensationToBackend(userWallet, amount, tokenType = 'ETH', bookingId = null, transactionHash = null) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Auth token not found. Please login first.');
      }

      const response = await fetch('/api/blockchain/send-compensation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'user_id': localStorage.getItem('user_id')
        },
        body: JSON.stringify({
          userWallet,
          amount,
          tokenType,
          bookingId,
          transactionHash
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging compensation to backend:', error);
      throw error;
    }
  }

  /**
   * Get compensation history from backend
   * @returns {Promise<Array>} Compensation history records
   */
  async getCompensationHistory() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Auth token not found. Please login first.');
      }

      const response = await fetch('/api/blockchain/compensation-history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'user_id': localStorage.getItem('user_id')
        }
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error getting compensation history:', error);
      return [];
    }
  }
}

export default new CompensationService();

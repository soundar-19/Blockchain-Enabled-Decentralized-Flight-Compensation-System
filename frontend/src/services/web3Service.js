import { ethers } from 'ethers';

/**
 * Web3 Service - Handles all MetaMask and blockchain interactions
 * This service manages wallet connections, network switching, and transactions
 */
class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.currentAccount = null;
    this.currentNetwork = null;
    this.listeners = {};
  }

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  }

  /**
   * Request account access and get connected account
   * @returns {Promise<string>} Connected wallet address
   */
  async connectWallet() {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install the MetaMask browser extension.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found in MetaMask');
      }

      this.currentAccount = accounts[0];
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get current network
      await this.getCurrentNetwork();

      // Setup listeners
      this.setupListeners();

      return this.currentAccount;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  /**
   * Get current connected account
   * @returns {Promise<string>} Current account address or null
   */
  async getCurrentAccount() {
    try {
      if (!this.isMetaMaskInstalled()) {
        return null;
      }

      if (this.currentAccount) {
        return this.currentAccount;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts.length > 0) {
        this.currentAccount = accounts[0];
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        return this.currentAccount;
      }

      return null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  /**
   * Get account balance in ETH
   * @param {string} address - Address to check balance
   * @returns {Promise<string>} Balance in ETH
   */
  async getBalance(address = null) {
    try {
      const targetAddress = address || this.currentAccount;
      if (!targetAddress) {
        throw new Error('No address provided and no connected wallet');
      }

      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get current network information
   * @returns {Promise<Object>} Network info {chainId, name}
   */
  async getCurrentNetwork() {
    try {
      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }

      const network = await this.provider.getNetwork();
      this.currentNetwork = {
        chainId: network.chainId,
        name: network.name
      };

      return this.currentNetwork;
    } catch (error) {
      console.error('Error getting network:', error);
      throw error;
    }
  }

  /**
   * Switch to a specific network
   * @param {number} chainId - Chain ID (e.g., 11155111 for Sepolia)
   * @returns {Promise<void>}
   */
  async switchNetwork(chainId) {
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainHexId: `0x${chainId.toString(16)}` }]
      });

      await this.getCurrentNetwork();
    } catch (error) {
      if (error.code === 4902) {
        throw new Error('This network is not configured in MetaMask. Please add it manually.');
      }
      throw error;
    }
  }

  /**
   * Ensure user is on Sepolia testnet (chainId: 11155111)
   * @returns {Promise<boolean>} True if on Sepolia, false otherwise
   */
  async ensureSepoliaNetwork() {
    try {
      const network = await this.getCurrentNetwork();
      const SEPOLIA_CHAIN_ID = 11155111;

      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        console.warn('Not on Sepolia network. Attempting to switch...');
        await this.switchNetwork(SEPOLIA_CHAIN_ID);
        return true;
      }
      return true;
    } catch (error) {
      console.error('Error ensuring Sepolia network:', error);
      throw error;
    }
  }

  /**
   * Send transaction (generic)
   * @param {Object} txData - Transaction data {to, value, data?, gasLimit?}
   * @returns {Promise<string>} Transaction hash
   */
  async sendTransaction(txData) {
    try {
      if (!this.signer) {
        throw new Error('No signer available. Connect wallet first.');
      }

      const tx = await this.signer.sendTransaction({
        to: txData.to,
        value: ethers.parseEther(txData.value),
        data: txData.data,
        gasLimit: txData.gasLimit
      });

      console.log('Transaction sent:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} Transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }

      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Sign message with wallet
   * @param {string} message - Message to sign
   * @returns {Promise<string>} Signed message
   */
  async signMessage(message) {
    try {
      if (!this.signer) {
        throw new Error('No signer available. Connect wallet first.');
      }

      return await this.signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet (client-side only)
   */
  disconnectWallet() {
    this.currentAccount = null;
    this.provider = null;
    this.signer = null;
    this.removeListeners();
  }

  /**
   * Setup event listeners for MetaMask
   */
  setupListeners() {
    if (!window.ethereum) return;

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.currentAccount = null;
        this.emit('accountChanged', null);
      } else if (accounts[0] !== this.currentAccount) {
        this.currentAccount = accounts[0];
        this.emit('accountChanged', this.currentAccount);
      }
    });

    // Listen for network changes
    window.ethereum.on('chainChanged', async () => {
      await this.getCurrentNetwork();
      this.emit('networkChanged', this.currentNetwork);
    });
  }

  /**
   * Remove event listeners
   */
  removeListeners() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  /**
   * Event emitter pattern
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  /**
   * Format address for display
   * @param {string} address - Full address
   * @param {number} chars - Number of chars to show from start/end
   * @returns {string} Formatted address
   */
  formatAddress(address, chars = 4) {
    if (!address) return '';
    return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
  }

  /**
   * Validate Ethereum address
   * @param {string} address - Address to validate
   * @returns {boolean} True if valid
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }
}

// Export singleton instance
export default new Web3Service();

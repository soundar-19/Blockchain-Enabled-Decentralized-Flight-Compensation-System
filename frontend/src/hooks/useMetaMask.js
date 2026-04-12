import { useState, useEffect, useCallback } from 'react';
import web3Service from '../services/web3Service';

/**
 * Custom React Hook for MetaMask integration
 * Provides easy access to wallet connection, account info, and blockchain interactions
 */
export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if MetaMask is installed on mount
  useEffect(() => {
    setIsInstalled(web3Service.isMetaMaskInstalled());

    // Check if already connected
    const checkConnection = async () => {
      try {
        const currentAccount = await web3Service.getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          const bal = await web3Service.getBalance(currentAccount);
          setBalance(bal);
          const net = await web3Service.getCurrentNetwork();
          setNetwork(net);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();

    // Setup listeners
    web3Service.on('accountChanged', handleAccountChange);
    web3Service.on('networkChanged', handleNetworkChange);

    return () => {
      web3Service.off('accountChanged', handleAccountChange);
      web3Service.off('networkChanged', handleNetworkChange);
    };
  }, []);

  // Handle account changes
  const handleAccountChange = useCallback((newAccount) => {
    if (newAccount) {
      setAccount(newAccount);
      setError(null);
      // Refresh balance
      web3Service.getBalance(newAccount)
        .then(bal => setBalance(bal))
        .catch(err => console.error('Error getting balance:', err));
    } else {
      setAccount(null);
      setBalance('0');
    }
  }, []);

  // Handle network changes
  const handleNetworkChange = useCallback((newNetwork) => {
    setNetwork(newNetwork);
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!web3Service.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install it from https://metamask.io');
      }

      const connectedAccount = await web3Service.connectWallet();
      setAccount(connectedAccount);

      // Get balance
      const bal = await web3Service.getBalance(connectedAccount);
      setBalance(bal);

      // Get network
      const net = await web3Service.getCurrentNetwork();
      setNetwork(net);

      return connectedAccount;
    } catch (err) {
      const errorMessage = err.code === 4001 
        ? 'User denied wallet connection' 
        : err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet (client-side)
  const disconnectWallet = useCallback(() => {
    web3Service.disconnectWallet();
    setAccount(null);
    setBalance('0');
    setError(null);
  }, []);

  // Get fresh balance
  const refreshBalance = useCallback(async () => {
    try {
      if (account) {
        const bal = await web3Service.getBalance(account);
        setBalance(bal);
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
      setError(err.message);
    }
  }, [account]);

  // Ensure Sepolia network
  const ensureSepoliaNetwork = useCallback(async () => {
    try {
      return await web3Service.ensureSepoliaNetwork();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (txData) => {
    try {
      if (!account) {
        throw new Error('No wallet connected');
      }
      return await web3Service.sendTransaction(txData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [account]);

  // Get transaction receipt
  const getTransactionReceipt = useCallback(async (txHash) => {
    try {
      return await web3Service.getTransactionReceipt(txHash);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Sign message
  const signMessage = useCallback(async (message) => {
    try {
      if (!account) {
        throw new Error('No wallet connected');
      }
      return await web3Service.signMessage(message);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [account]);

  return {
    // State
    account,
    balance,
    network,
    isConnecting,
    error,
    isInstalled,
    isConnected: !!account,

    // Methods
    connectWallet,
    disconnectWallet,
    refreshBalance,
    ensureSepoliaNetwork,
    sendTransaction,
    getTransactionReceipt,
    signMessage,

    // Utilities
    formatAddress: web3Service.formatAddress,
    isValidAddress: web3Service.isValidAddress
  };
};

export default useMetaMask;

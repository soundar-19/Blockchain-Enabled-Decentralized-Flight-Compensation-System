import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import authService from '../services/authService';

const MetaMaskConnect = ({ account, onWalletConnected }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(!!account?.address || !!account?.metamask_address);

  useEffect(() => {
    setWalletConnected(!!account?.address || !!account?.metamask_address);
  }, [account?.address, account?.metamask_address]);

  const connectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError('MetaMask not installed. Please install MetaMask browser extension from https://metamask.io');
        setIsConnecting(false);
        return;
      }

      if (!window.ethereum.isMetaMask) {
        setError('Please use MetaMask wallet');
        setIsConnecting(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        setError('No accounts found in MetaMask');
        setIsConnecting(false);
        return;
      }

      const userWalletAddress = accounts[0];
      console.log('✓ MetaMask wallet connected:', userWalletAddress);

      // Get current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isSepolia = chainId === '0xaa36a7'; // Sepolia chain ID in hex
      
      if (!isSepolia) {
        console.warn('Not on Sepolia network. User should switch manually or the app will guide them.');
      }

      // Save wallet to backend
      try {
        const response = await authService.connectMetaMaskWallet(userWalletAddress);
        
        setWalletConnected(true);
        if (onWalletConnected) {
          onWalletConnected({
            address: userWalletAddress,
            metamask_address: userWalletAddress,
            ...account
          });
        }
        console.log('✓ MetaMask wallet saved to database');
      } catch (backendError) {
        console.error('Backend error:', backendError);
        // Even if backend fails, MetaMask is still connected on client
        setWalletConnected(true);
        if (onWalletConnected) {
          onWalletConnected(userWalletAddress);
        }
        setError('Wallet connected locally but failed to sync with server. Try refreshing.');
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      if (err.code === 4001) {
        setError('You rejected the wallet connection request');
      } else if (err.message?.includes('already pending')) {
        setError('A connection request is already pending in MetaMask');
      } else {
        setError(err.message || 'Failed to connect MetaMask');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">✓ MetaMask Connected</p>
            <p className="text-sm text-green-700 font-mono mt-1">
              {account?.metamask_address 
                ? `${account.metamask_address.slice(0, 10)}...${account.metamask_address.slice(-8)}`
                : account?.address 
                ? `${account.address.slice(0, 10)}...${account.address.slice(-8)}`
                : 'Connected'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <Wallet className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">Connect Your MetaMask Wallet</p>
            <p className="text-sm text-blue-700 mt-1">Use your real Ethereum wallet on Sepolia testnet for transactions and compensation transfers</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={connectMetaMask}
          disabled={isConnecting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isConnecting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Connect MetaMask Wallet
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MetaMaskConnect;

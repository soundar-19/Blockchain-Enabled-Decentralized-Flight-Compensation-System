import React, { useState } from 'react';
import { Wallet, ChevronDown, LogOut, RefreshCw, ExternalLink } from 'lucide-react';
import useMetaMask from '../../hooks/useMetaMask';
import { formatWalletAddress, getSepoliaExplorerUrl } from '../../utils/walletUtils';

const WalletButton = () => {
  const {
    account,
    balance,
    isConnected,
    isConnecting,
    isInstalled,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    formatAddress
  } = useMetaMask();

  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setIsOpen(false);
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsOpen(false);
  };

  // Not connected state
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting || !isInstalled}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-semibold">
          {!isInstalled ? 'Install MetaMask' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>
    );
  }

  // Connected state
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 hover:bg-green-100 rounded-lg transition-colors"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-semibold text-green-900">{formatAddress(account, 4)}</span>
        <ChevronDown className={`w-4 h-4 text-green-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Balance Section */}
          <div className="p-4 border-b border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">Balance</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg font-bold text-gray-900">{balance} ETH</p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Address Section */}
          <div className="p-4 border-b border-gray-200 space-y-2">
            <p className="text-xs text-gray-600 uppercase font-semibold">Address</p>
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
              <code className="text-xs font-mono text-gray-700 flex-1 truncate">{account}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(account);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy address"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <a
                href={getSepoliaExplorerUrl('address', account)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 space-y-2">
            <a
              href={getSepoliaExplorerUrl('address', account)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Etherscan
            </a>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletButton;

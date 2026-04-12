import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, Wallet, Settings, LogOut, RefreshCw } from 'lucide-react';
import useMetaMask from '../../hooks/useMetaMask';

const WalletProfile = ({ onDisconnect = null }) => {
  const {
    account,
    balance,
    network,
    isConnected,
    error,
    disconnectWallet,
    refreshBalance,
    formatAddress,
    ensureSepoliaNetwork
  } = useMetaMask();

  const [copied, setCopied] = useState(false);
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if on correct network on mount
  useEffect(() => {
    if (isConnected && network) {
      const isCorrect = network.chainId === 11155111; // Sepolia
      setIsOnCorrectNetwork(isCorrect);
    }
  }, [network, isConnected]);

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle refresh balance
  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (err) {
      console.error('Error refreshing balance:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle switch to Sepolia
  const handleSwitchToSepolia = async () => {
    try {
      await ensureSepoliaNetwork();
      setIsOnCorrectNetwork(true);
    } catch (err) {
      console.error('Error switching network:', err);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnectWallet();
    if (onDisconnect) {
      onDisconnect();
    }
  };

  if (!isConnected) {
    return null;
  }

  const sepoliaExplorerUrl = `https://sepolia.etherscan.io/address/${account}`;
  const networkStatus = network ? (isOnCorrectNetwork ? 'Sepolia ✓' : `${network.name} (Switch needed)`) : 'Unknown';
  const networkColor = isOnCorrectNetwork ? 'text-green-600' : 'text-orange-600';

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-full">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Wallet Connected</h3>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-5 h-5 text-red-600" />
        </button>
      </div>

      {/* Wallet Address */}
      <div className="space-y-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Wallet Address</p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono text-gray-900">{formatAddress(account, 8)}</code>
            <div className="flex gap-2">
              <button
                onClick={handleCopyAddress}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Copy address"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <a
                href={sepoliaExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
            </div>
          </div>
          {copied && <p className="text-xs text-green-600 mt-1">✓ Copied to clipboard</p>}
        </div>

        {/* Balance */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Balance</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900">{balance} SepoliaETH</p>
            <button
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Network</p>
          <div className="flex items-center justify-between">
            <p className={`font-semibold ${networkColor}`}>{networkStatus}</p>
            {!isOnCorrectNetwork && (
              <button
                onClick={handleSwitchToSepolia}
                className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
              >
                Switch to Sepolia
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-3">
          ⚠️ {error}
        </div>
      )}

      {isOnCorrectNetwork && balance !== '0' && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700 flex items-center gap-2">
          <span>✓</span>
          <span>Ready for transactions on Sepolia testnet</span>
        </div>
      )}

      {parseFloat(balance) < 0.01 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-700">
          <p className="font-semibold mb-1">💡 Low Balance</p>
          <p>Get free testnet ETH from: <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">sepoliafaucet.com</a></p>
        </div>
      )}
    </div>
  );
};

export default WalletProfile;

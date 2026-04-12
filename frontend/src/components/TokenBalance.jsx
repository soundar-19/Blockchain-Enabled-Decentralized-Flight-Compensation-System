import React, { useState, useEffect } from 'react';
import { Send, RefreshCw, TrendingUp } from 'lucide-react';
import useMetaMask from '../hooks/useMetaMask';
import compensationService from '../services/compensationService';
import priceService from '../services/priceService';
import { getSepoliaExplorerUrl } from '../utils/walletUtils';

const TokenBalance = ({ userAddress, account, onSendCompensation }) => {
  const { account: connectedAccount, isConnected } = useMetaMask();
  const [ethBalance, setEthBalance] = useState('0');
  const [usdBalance, setUsdBalance] = useState('$0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendData, setSendData] = useState({ amount: '', to: '' });
  const [isSending, setIsSending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [lastTxTime, setLastTxTime] = useState(null);

  // Refresh balances
  const refreshBalances = async () => {
    if (!isConnected || !connectedAccount) return;

    setIsLoading(true);
    setError(null);

    try {
      await compensationService.initialize(window.ethereum);

      // Get ETH balance only
      const ethData = await compensationService.getETHBalance(connectedAccount);
      const ethValue = parseFloat(ethData.formatted).toFixed(6);
      const usdValue = priceService.convertETHToUSD(ethValue);

      setEthBalance(ethValue);
      setUsdBalance(`$${usdValue}`);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch ETH balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balances on mount and when account changes
  useEffect(() => {
    if (isConnected && connectedAccount) {
      refreshBalances();
      // Refresh every 30 seconds
      const interval = setInterval(refreshBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, connectedAccount]);

  // Handle send compensation
  const handleSendCompensation = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      if (!sendData.amount || parseFloat(sendData.amount) <= 0) {
        throw new Error('Invalid amount');
      }

      // Send ETH compensation
      const result = await compensationService.sendCompensationETH(
        sendData.to,
        sendData.amount,
        'Flight Delay Compensation'
      );

      // Log to backend
      try {
        await compensationService.logCompensationToBackend(
          sendData.to,
          sendData.amount,
          'ETH',
          null, // bookingId
          result.txHash
        );
      } catch (logError) {
        console.warn('Failed to log to backend, but transaction succeeded:', logError);
      }

      // Store tx info for display
      setLastTxHash(result.txHash);
      setLastTxTime(new Date().toLocaleTimeString());

      // Show success message
      const explorerUrl = getSepoliaExplorerUrl(result.txHash);
      setError(null);
      alert(`✓ Sent ${sendData.amount} ETH to ${sendData.to}\nTx: ${result.txHash}\n\nView on Etherscan: ${explorerUrl}`);
      
      setSendData({ amount: '', to: '' });
      setShowSendForm(false);

      // Refresh balances
      await refreshBalances();

      if (onSendCompensation) {
        onSendCompensation(result);
      }
    } catch (err) {
      setError(`Failed to send: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🔌</div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900">Connect MetaMask to view token balances</p>
            <p className="text-sm text-blue-700 mt-1">Click the "Connect MetaMask" button above to see your ETH balance and send compensation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ETH Balance Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-600">Ethereum Sepolia</p>
              <p className="text-xs text-blue-500">Wallet Balance</p>
            </div>
          </div>
          <button
            onClick={refreshBalances}
            disabled={isLoading}
            className="p-2 hover:bg-blue-200 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <p className="text-3xl font-bold text-blue-900 mb-2">{ethBalance} ETH</p>
        <p className="text-lg font-semibold text-blue-700 mb-2">{usdBalance}</p>
        <p className="text-xs text-blue-600">
          {parseFloat(ethBalance) > 0.01 
            ? '✓ Ready for transactions' 
            : '⚠️ Low balance'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Last Transaction */}
      {lastTxHash && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✓</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">Transaction Sent!</p>
              <p className="text-xs text-green-700 mt-1">
                Hash: <a 
                  href={getSepoliaExplorerUrl(lastTxHash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono hover:underline break-all"
                >
                  {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-8)}
                </a>
              </p>
              {lastTxTime && <p className="text-xs text-green-600 mt-1">Sent at {lastTxTime}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Send Compensation Form */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        {!showSendForm ? (
          <button
            onClick={() => setShowSendForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
            Send Compensation
          </button>
        ) : (
          <form onSubmit={handleSendCompensation} className="space-y-4">
            <h3 className="font-semibold text-gray-900">Send ETH Compensation</h3>

            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={sendData.to || ''}
                onChange={(e) => setSendData({ ...sendData, to: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder="0.05"
                value={sendData.amount}
                onChange={(e) => setSendData({ ...sendData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {sendData.amount && (
                <p className="text-xs text-gray-600 mt-2">
                  ≈ {priceService.convertETHToUSD(sendData.amount)} USD
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSending || !sendData.to || !sendData.amount}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {isSending ? '⏳ Sending...' : '✓ Send ETH'}
              </button>
              <button
                type="button"
                onClick={() => setShowSendForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">How It Works</p>
            <p className="text-xs text-blue-700 mt-1">
              Users who experience flight delays receive ETH compensation directly to their MetaMask wallet. Your balance is displayed in both ETH and USD. Send compensation payments using the form above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;

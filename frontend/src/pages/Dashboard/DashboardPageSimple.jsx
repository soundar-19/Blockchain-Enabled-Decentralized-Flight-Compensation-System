import React, { useState } from 'react';
import { Shield, Users, CheckCircle, Coins, Clock, Globe, MapPin, ArrowRight, Plane } from 'lucide-react';
import MetaMaskConnect from '../../components/MetaMaskConnect';
import TokenBalance from '../../components/TokenBalance';

const DashboardPageSimple = ({ account, setDialog, compensations = [], routes = [], onAccountUpdate }) => {
  const [stakedTokens] = useState(0);
  const [balance] = useState(0);
  const [localAccount, setLocalAccount] = useState(account);

  const handleWalletConnected = (walletAddress) => {
    const updatedAccount = {
      ...localAccount,
      address: walletAddress,
      wallet_created: true
    };
    setLocalAccount(updatedAccount);
    
    // Call parent callback to update AppRouter state
    if (onAccountUpdate) {
      onAccountUpdate(updatedAccount);
    }
    
    setDialog({
      isOpen: true,
      title: 'Wallet Connected! ✅',
      message: `Your MetaMask wallet has been connected:\n\n${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`,
      type: 'success'
    });
  };

  const displayAccount = localAccount || account;

  const defaultRoutes = [
    { id: 1, route: 'NYC → LAX', totalPool: 50000, participants: 234, roi: 8.5, origin: 'New York', destination: 'Los Angeles', avgDelay: '2.5', riskLevel: 'Medium' },
    { id: 2, route: 'SFO → ORD', totalPool: 35000, participants: 156, roi: 7.2, origin: 'San Francisco', destination: 'Chicago', avgDelay: '1.8', riskLevel: 'Low' },
    { id: 3, route: 'MIA → BOS', totalPool: 28000, participants: 112, roi: 6.8, origin: 'Miami', destination: 'Boston', avgDelay: '3.2', riskLevel: 'High' },
    { id: 4, route: 'ATL → DEN', totalPool: 42000, participants: 198, roi: 9.1, origin: 'Atlanta', destination: 'Denver', avgDelay: '2.1', riskLevel: 'Medium' }
  ];

  const displayRoutes = routes.length > 0 ? routes : defaultRoutes;
  const displayCompensations = compensations || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border border-blue-200 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Pool Value</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">${displayRoutes.reduce((sum, r) => sum + r.totalPool, 0).toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-2">💰 Protecting {displayRoutes.length} routes</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Shield className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Active Users</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{displayRoutes.reduce((sum, r) => sum + r.participants, 0)}</p>
              <p className="text-xs text-green-600 mt-2">👥 Growing community</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Users className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Claims Processed</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{displayCompensations.filter(c => c.status === 'Approved').length}</p>
              <p className="text-xs text-purple-600 mt-2">✅ Instant payouts</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md border border-yellow-200 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Total Compensated</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">${displayCompensations.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0)}</p>
              <p className="text-xs text-yellow-600 mt-2">💵 Returned to users</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <Coins className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection Prompt */}
      {!displayAccount?.wallet_created && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-md border border-amber-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔐</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Connect Your MetaMask Wallet</h3>
              <p className="text-sm text-amber-800 mb-4">Connect your real MetaMask wallet to replace the temporary backup wallet and enable authentic blockchain transactions. This is FREE and takes 30 seconds!</p>
              <MetaMaskConnect 
                account={displayAccount} 
                onWalletConnected={handleWalletConnected}
              />
            </div>
          </div>
        </div>
      )}

      {/* Token Balance Display */}
      {displayAccount?.wallet_created && displayAccount?.address && (
        <TokenBalance userAddress={displayAccount.address} />
      )}

      {/* Your Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Your Account
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 uppercase font-semibold">ETH Balance</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">${balance.toFixed(4)}</p>
              <p className="text-xs text-blue-700 mt-2">⛽ Sepolia Testnet</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">Staked Tokens</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stakedTokens}</p>
              <p className="text-xs text-blue-600 mt-2">🎯 Earning rewards</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{displayCompensations.length}</p>
              <p className="text-xs text-purple-600 mt-2">📋 Filed claims</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">Wallet Connected</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{displayAccount?.address ? '✓ Yes' : '✗ No'}</p>
              <p className="text-xs text-gray-600 mt-2">
                {displayAccount?.address ? `${displayAccount.address.substring(0, 6)}...${displayAccount.address.substring(38)}` : 'Connect wallet above'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold">Total Received</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${displayCompensations.reduce((sum, c) => sum + c.amount, 0)}</p>
              <p className="text-xs text-green-600 mt-2">💰 Compensation received</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => setDialog({isOpen: true, title: 'Feature', message: 'Navigate to the Compensate page to file a claim', type: 'info'})}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              File a Claim
            </button>
            <button 
              onClick={() => setDialog({isOpen: true, title: 'Feature', message: 'Navigate to the Marketplace page to buy/sell tickets', type: 'info'})}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Marketplace
            </button>
            <button 
              onClick={() => setDialog({isOpen: true, title: 'Feature', message: 'Navigate to the Loyalty page to swap airlines points', type: 'info'})}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Loyalty Points
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Recent Activity
        </h3>
        {displayCompensations.length > 0 ? (
          <div className="space-y-3">
            {displayCompensations.slice(0, 5).map((comp, idx) => (
              <div key={idx} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Claim Approved</p>
                  <p className="text-xs text-gray-600">{comp.flightNumber} - {comp.compensationType}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-600">+${comp.amount}</p>
                  <p className="text-xs text-gray-600">Just now</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Plane className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No activity yet. File a claim to get started!</p>
          </div>
        )}
      </div>

      {/* How SkyGuard DAO Works */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          How SkyGuard DAO Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-100">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-white">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-2">File Claim</h3>
            <p className="text-sm text-gray-600 text-center">Report flight delays and get instant compensation</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-100">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-white">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-2">Choose Method</h3>
            <p className="text-sm text-gray-600 text-center">Receive compensation as ETH or vouchers for various services</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-100">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-white">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-2">Trade & Use</h3>
            <p className="text-sm text-gray-600 text-center">Use vouchers or spend your ETH compensation on marketplace</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-100">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-white">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-2">Community</h3>
            <p className="text-sm text-gray-600 text-center">Help other travelers and earn rewards</p>
          </div>
        </div>
      </div>

      {/* Top Routes Preview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Available Routes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayRoutes.slice(0, 4).map((route) => (
            <div key={route.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">{route.route}</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>💰 Pool: ${route.totalPool.toLocaleString()} | 👥 {route.participants} participants</p>
                <p>📊 ROI: {route.roi}% | 📈 Risk: {route.riskLevel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPageSimple;

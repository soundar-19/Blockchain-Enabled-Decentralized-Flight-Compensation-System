import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, LogOut, Wallet, Coins } from 'lucide-react';
import { ethers } from 'ethers';
import compensationService from '../services/compensationService';
import realBalanceService from '../services/realBalanceService';
import priceService from '../services/priceService';

const Layout = ({ account, onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ethBalance, setEthBalance] = useState('0');
  const [usdBalance, setUsdBalance] = useState('$0.00');
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Debug: Check what's in account
  console.log('🔍 Layout account:', account);

  useEffect(() => {
    if (account?.address) {
      console.log('📍 Layout: Fetching balances for:', account.address);
      fetchBalances(account.address);
    }
  }, [account?.address]);

  const fetchBalances = async (address) => {
    if (!address || address === 'N/A') {
      console.warn('⚠️ Invalid address, skipping balance fetch');
      return;
    }

    setLoadingBalance(true);
    try {
      console.log('🔄 Fetching real balances for address:', address);

      // Get comprehensive wallet info using realBalanceService
      const walletInfo = await realBalanceService.getWalletInfo(address);
      
      setEthBalance(walletInfo.eth);
      setUsdBalance(walletInfo.usd);
      
      console.log('✅ Wallet Info:', walletInfo);
    } catch (err) {
      console.error('❌ Error fetching balances:', err.message);
      setEthBalance('0');
      setUsdBalance('$0.00');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/compensate', label: 'Compensate' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/vouchers', label: 'Vouchers' },
    { path: '/booking', label: 'Booking' },
    { path: '/loyalty', label: 'Loyalty' },
    { path: '/testing', label: '🧪 Testing' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">SkyGuard DAO</h1>
            </Link>

            {account && (
              <div className="flex items-center gap-6">
                {/* Balance Display */}
                {account.address && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-3 rounded-lg border border-blue-200 shadow-sm">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">Wallet Balance</p>
                      <div className="flex items-center gap-3">
                        {/* ETH Amount */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-blue-900">{ethBalance}</span>
                          <span className="text-xs text-blue-600 font-semibold">ETH</span>
                        </div>
                        
                        {/* Divider */}
                        <span className="text-gray-300">|</span>
                        
                        {/* USD Amount */}
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-green-900">{usdBalance}</span>
                          <span className="text-xs text-green-600 font-semibold">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Info */}
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.email}</p>
                  {account.address && (
                    <div className="flex items-center gap-1 mt-1">
                      <Wallet className="w-3 h-3 text-blue-600" />
                      <p className="text-xs text-blue-600 font-mono font-bold">{account.address.slice(0, 10)}...{account.address.slice(-8)}</p>
                    </div>
                  )}
                  {account.wallet_created && (
                    <p className="text-xs text-green-600 font-semibold">✓ Wallet Connected</p>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  isActive(item.path)
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

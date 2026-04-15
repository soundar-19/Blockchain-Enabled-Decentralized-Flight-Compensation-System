import React, { useState, useEffect } from 'react';
import { DollarSign, Coffee, Hotel, FileText, AlertCircle, CheckCircle, Clock, Loader, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';
import MetaMaskConnect from '../../components/MetaMaskConnect';
import useMetaMask from '../../hooks/useMetaMask';
import realBalanceService from '../../services/realBalanceService';
import priceService from '../../services/priceService';
import blockchainService from '../../services/blockchainDataService';

const API_BASE = 'http://localhost:5000';

const CompensatePageSimple = ({ account, setDialog, onAccountUpdate }) => {
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [claimMethod, setClaimMethod] = useState('tokens');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [localAccount, setLocalAccount] = useState(account);
  const [ethBalance, setEthBalance] = useState('0');
  const [usdBalance, setUsdBalance] = useState('$0.00');
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Define displayAccount early so it can be used in useEffect
  const displayAccount = localAccount || account;

  // Use standardized _id field from account
  const userId = account?._id;

  useEffect(() => {
    if (userId) {
      loadUserBookings();
    }
  }, [userId]);

  useEffect(() => {
    if (displayAccount?.address) {
      fetchBalances(displayAccount.address);
    }
  }, [displayAccount?.address]);

  const loadUserBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/bookings/user/${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        // Only show bookings that have compensation available
        setUserBookings(data.bookings || []);
      }
    } catch (error) {
      setDialog({ isOpen: true, title: 'Error', message: 'Failed to load your bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCompensation = async () => {
    if (!selectedBooking || !displayAccount?.address) {
      setDialog({ isOpen: true, title: 'Error', message: 'Please connect your wallet first', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      console.log('🎯 CLAIM COMPENSATION HANDLER');
      console.log('   Selected Booking:', JSON.stringify(selectedBooking, null, 2));
      console.log('   Claim Method:', claimMethod);
      console.log('   Booking Flight:', selectedBooking.flight_number);
      console.log('   Booking Delay:', selectedBooking.delay_minutes);
      
      if (claimMethod === 'voucher') {
        console.log('✅ USING VOUCHER CLAIM METHOD');
        // Validate required fields exist
        if (!selectedBooking.flight_number) {
          console.error('❌ Missing flight_number in booking');
          throw new Error('Booking missing flight_number');
        }
        if (selectedBooking.delay_minutes === undefined || selectedBooking.delay_minutes === null) {
          console.error('❌ Missing delay_minutes in booking');
          throw new Error('Booking missing delay_minutes');
        }

        const bookingClaimType = selectedBooking.claimType ?? selectedBooking.compensation?.claimType ?? 0;

        // Use blockchain service for voucher claim
        const result = await blockchainService.fileVoucherClaim(
          displayAccount.address,
          selectedBooking.flight_number,
          selectedBooking.delay_minutes,
          bookingClaimType,
          1,  // route_id
          selectedBooking._id
        );

        if (result.success) {
          console.log('✅ Voucher claim successful:', result);
          const voucherCode = result.voucherCode || 'Generated';
          
          setDialog({
            isOpen: true,
            title: 'Voucher Claim Success! 🎫',
            message: `Voucher Code: ${voucherCode}\n\nType: ${selectedBooking.compensation.description}\nValid for 30 days.\n\n✅ Transaction: ${result.transactionHash?.substring(0, 20)}...\n\n📋 Your voucher is now stored in the secure voucher wallet and cannot be claimed again for this booking.`,
            type: 'success'
          });
          setSelectedBooking(null);
          loadUserBookings();
        } else {
          console.error('❌ Voucher claim failed:', result.error);
          setDialog({ isOpen: true, title: 'Error', message: `Voucher claim failed: ${result.error}`, type: 'error' });
        }
      } else {
        console.log('⚠️ USING DIRECT ETH CLAIM METHOD');
        // Use old booking endpoint for direct ETH transfer
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/api/bookings/compensation/${selectedBooking._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            user_address: displayAccount.address,
            claim_method: claimMethod
          })
        });

        if (response.ok) {
          const data = await response.json();
          const ethAmount = data.compensation?.eth_amount || 0;
          const usdValue = data.compensation?.usd_value || 0;
          const txInfo = data.tx_hash
            ? `\n\n✅ Transaction Hash:\n${data.tx_hash}`
            : '\n⚠️ No transaction - add DEPLOYER_PRIVATE_KEY to .env for transfers';
          
          setDialog({
            isOpen: true,
            title: 'Claim Approved! ✅',
            message: `Compensation: ${ethAmount} ETH (~$${usdValue})\nType: ${data.compensation.description}${txInfo}`,
            type: 'success'
          });
          setSelectedBooking(null);
          loadUserBookings();
        } else {
          const error = await response.json();
          setDialog({ isOpen: true, title: 'Error', message: error.error || 'Failed to process claim', type: 'error' });
        }
      }
    } catch (error) {
      console.error('❌ Claim error:', error);
      setDialog({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletConnected = (walletAddress) => {
    const updatedAccount = {
      ...localAccount,
      address: walletAddress,
      wallet_created: true
    };
    setLocalAccount(updatedAccount);
    if (onAccountUpdate) {
      onAccountUpdate(updatedAccount);
    }
    // Fetch balances
    fetchBalances(walletAddress);
  };

  const fetchBalances = async (address) => {
    if (!address || address === 'N/A') {
      console.warn('⚠️ Invalid address, skipping balance fetch');
      return;
    }

    setBalanceLoading(true);
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
      setBalanceLoading(false);
    }
  };

  const claimableBookings = userBookings.filter(b => b.compensation?.eth_amount > 0 && !b.compensation_claimed);
  const claimedBookings = userBookings.filter(b => b.compensation_claimed);

  return (
    <div className="space-y-6" style={{ padding: '24px' }}>

      {/* Wallet Profile Header */}
      {displayAccount?.address && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md border border-blue-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">User Profile</p>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-lg font-bold text-blue-900">{displayAccount.email}</p>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">✓ Connected</span>
              </div>
              <p className="text-sm text-blue-700 font-mono mb-4">
                Wallet: {displayAccount.address.slice(0, 10)}...{displayAccount.address.slice(-8)}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                🔗 Active
              </div>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-blue-600">SepoliaETH</p>
                {balanceLoading && <Loader className="w-4 h-4 text-blue-500 animate-spin" />}
              </div>
              <p className="text-2xl font-bold text-blue-900">{ethBalance}</p>
              <p className="text-xs text-blue-600 mt-1">⛽ Available balance</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-green-600">USD Value</p>
                {balanceLoading && <Loader className="w-4 h-4 text-green-500 animate-spin" />}
              </div>
              <p className="text-2xl font-bold text-green-900">{usdBalance}</p>
              <p className="text-xs text-green-600 mt-1">💵 Real-time price</p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Prompt */}
      {!displayAccount?.wallet_created && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-md border border-amber-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔐</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Connect Your MetaMask Wallet</h3>
              <p className="text-sm text-amber-800 mb-4">Connect your MetaMask wallet to see your token balances and send compensation.</p>
              <MetaMaskConnect 
                account={displayAccount} 
                onWalletConnected={handleWalletConnected}
              />
            </div>
          </div>
        </div>
      )}

      {/* Token Balance Display - REMOVED: Using ETH + USD only now */}

      {/* Your Flight Bookings Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Your Flight Bookings ({userBookings.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-gray-600 mt-4">Loading your bookings...</p>
          </div>
        ) : userBookings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No flight bookings found</p>
            <p className="text-sm text-gray-500 mt-2">Book a flight to start claiming compensation</p>
          </div>
        ) : (
          <>
            {claimableBookings.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Available Compensation ({claimableBookings.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {claimableBookings.map(booking => (
                    <div
                      key={booking._id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedBooking?._id === booking._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{booking.flight_number}</h3>
                          <p className="text-sm text-gray-600">{booking.departure_city} → {booking.arrival_city}</p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          booking.status === 'delayed' ? 'bg-orange-100 text-orange-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>Delay: <strong>{booking.delay_minutes} min</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>Compensation: <strong className="text-green-700">{booking.compensation?.eth_amount} ETH (~${booking.compensation?.usd_value})</strong></span>
                        </div>
                        {booking.compensation && (
                          <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                            📋 {booking.compensation.description}
                          </p>
                        )}
                      </div>
                      {selectedBooking?._id === booking._id && (
                        <div className="mt-3 text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {claimedBookings.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-gray-500 mb-3">Already Claimed ({claimedBookings.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {claimedBookings.map(booking => (
                    <div key={booking._id} className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-75">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-700">{booking.flight_number}</span>
                          <span className="text-sm text-gray-500 ml-2">{booking.departure_city} → {booking.arrival_city}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Claimed</span>
                          {booking.claim_method === 'voucher' ? (
                            <>
                              <p className="text-xs text-green-600 font-bold mt-1">Voucher claimed</p>
                              {booking.voucher_code && <p className="text-xs text-slate-500 mt-1">Code: {booking.voucher_code}</p>}
                            </>
                          ) : (
                            <p className="text-xs text-green-600 font-bold mt-1">{booking.compensation?.eth_amount} ETH (~${booking.compensation?.usd_value})</p>
                          )}
                        </div>
                      </div>
                      {booking.tx_hash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${booking.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-0.5 mt-1"
                        >
                          TX: {booking.tx_hash.slice(0, 20)}... <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {claimableBookings.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-600">All eligible compensations have been claimed!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Compensation Rules */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md border border-blue-200 p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Voucher Service Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400">
            <Coffee className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="font-bold text-gray-900">Delay 2 hrs</h3>
            <p className="text-sm text-gray-600 mt-1">Meal voucher for airport dining</p>
            <p className="text-lg font-bold text-green-600 mt-2">Service Voucher</p>
            <p className="text-xs text-gray-500">Use at restaurants and cafes</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
            <Coffee className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-bold text-gray-900">Delay 3 hrs</h3>
            <p className="text-sm text-gray-600 mt-1">Refreshment voucher with snacks</p>
            <p className="text-lg font-bold text-green-600 mt-2">Service Voucher</p>
            <p className="text-xs text-gray-500">Valid at partner lounges</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <Hotel className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-bold text-gray-900">Delay 4 hrs</h3>
            <p className="text-sm text-gray-600 mt-1">Hotel + lounge voucher</p>
            <p className="text-lg font-bold text-green-600 mt-2">Service Voucher</p>
            <p className="text-xs text-gray-500">Overnight accommodation support</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
            <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
            <h3 className="font-bold text-gray-900">Delay 24+ hrs</h3>
            <p className="text-sm text-gray-600 mt-1">Premium support voucher</p>
            <p className="text-lg font-bold text-green-600 mt-2">Service Voucher</p>
            <p className="text-xs text-gray-500">Includes hotel, transport, and meals</p>
          </div>
        </div>
      </div>

      {/* Claim Form */}
      {selectedBooking && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Your Compensation</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Selected Flight</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-500">Flight</p><p className="font-bold">{selectedBooking.flight_number}</p></div>
              <div><p className="text-gray-500">Delay</p><p className="font-bold">{selectedBooking.delay_minutes} min</p></div>
              <div><p className="text-gray-500">Status</p><p className="font-bold">{selectedBooking.status}</p></div>
                <div><p className="text-gray-500">Compensation</p><p className="font-bold text-green-600">{claimMethod === 'voucher' ? selectedBooking.compensation?.description : `${selectedBooking.compensation?.eth_amount} ETH (~$${selectedBooking.compensation?.usd_value})`}</p></div>
            </div>
          </div>

          {displayAccount?.address && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500">Sending to wallet:</p>
              <p className="text-sm font-mono text-gray-700">{displayAccount.address}</p>
            </div>
          )}

          <h3 className="font-bold text-gray-900 mb-3">Receive compensation as:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              onClick={() => setClaimMethod('tokens')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${claimMethod === 'tokens' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${claimMethod === 'tokens' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                  {claimMethod === 'tokens' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">ETH Tokens ⛽</h4>
                  <p className="text-sm text-gray-600 mt-1">Direct ETH transfer to your wallet</p>
                  <p className="text-lg font-bold text-green-600 mt-1">{selectedBooking.compensation?.eth_amount} ETH</p>
                  <p className="text-xs text-gray-500 mt-1">~${selectedBooking.compensation?.usd_value} USD • Instant transfer</p>
                </div>
              </div>
            </div>
            <div
              onClick={() => setClaimMethod('voucher')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${claimMethod === 'voucher' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${claimMethod === 'voucher' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                  {claimMethod === 'voucher' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Voucher 🎫</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedBooking.compensation?.description}</p>
                  <p className="text-xs text-gray-500 mt-3">✅ Use immediately • ✅ Direct benefits</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleClaimCompensation}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <><Loader className="w-5 h-5 animate-spin" /> Processing on blockchain...</>
            ) : claimMethod === 'voucher' ? (
              <><CheckCircle className="w-5 h-5" /> Claim Voucher</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Claim {selectedBooking.compensation?.eth_amount} ETH (~${selectedBooking.compensation?.usd_value})</>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Transaction will be recorded on Sepolia blockchain
          </p>
        </div>
      )}
    </div>
  );
};

export default CompensatePageSimple;
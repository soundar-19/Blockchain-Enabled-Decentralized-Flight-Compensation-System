import React, { useState, useEffect } from 'react';
import {
  FlaskConical, Loader, CheckCircle, XCircle, Clock, DollarSign,
  Plane, RefreshCw, ExternalLink, AlertCircle, User, Wallet
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const TestingPage = ({ account }) => {
  // Accessibility check
  if (!account) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>Error: No account provided to TestingPage</p>
        <p style={{ color: '#666' }}>Please log in first</p>
      </div>
    );
  }

  const [allBookings, setAllBookings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userBlockchainBalances, setUserBlockchainBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [delayInput, setDelayInput] = useState('');
  const [statusInput, setStatusInput] = useState('delayed');
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);

  const [txHash, setTxHash] = useState('');
  const [txResult, setTxResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [walletAddress, setWalletAddress] = useState('');
  const [walletResult, setWalletResult] = useState(null);
  const [checkingWallet, setCheckingWallet] = useState(false);

  useEffect(() => {
    console.log('🧪 TestingPage loaded, account:', account);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/test/all-bookings`),
        fetch(`${API_BASE}/api/test/users`)
      ]);
      const bookingsData = await bookingsRes.json();
      const usersData = await usersRes.json();
      setAllBookings(bookingsData.bookings || []);
      setAllUsers(usersData.users || []);
      
      // Fetch blockchain balances for all users
      if (usersData.users && usersData.users.length > 0) {
        await fetchAllUsersBlockchainBalances(usersData.users);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsersBlockchainBalances = async (users) => {
    setLoadingBalances(true);
    const balances = {};
    
    try {
      // Fetch all balances in parallel for speed
      const balancePromises = users
        .filter(user => user.address && user.address !== '0x0000000000000000000000000000000000000000')
        .map(async (user) => {
          try {
            const res = await fetch(`${API_BASE}/api/test/wallet-balance/${user.address.trim()}`);
            const data = await res.json();
            console.log(`📊 Balance for ${user.name}:`, data);
            
            // Get ETH balance
            const ethBalance = parseFloat(data.eth_balance) || 0;
            
            // Calculate USD if not provided by backend (fallback)
            let usdValue = parseFloat(data.usd_value) || 0;
            if (usdValue === 0 && ethBalance > 0) {
              // Fallback: calculate on frontend if backend didn't
              usdValue = ethBalance * 2000;
              console.warn(`⚠️ Backend USD was 0, calculated on frontend: $${usdValue.toFixed(2)}`);
            }
            
            balances[user.address] = {
              eth: ethBalance,
              usd: `$${usdValue.toFixed(2)}`,
              error: data.error || null
            };
            
            console.log(`✅ Stored balance: ${ethBalance} ETH = $${usdValue.toFixed(2)}`);
          } catch (err) {
            console.error(`❌ Error fetching balance for ${user.name}:`, err);
            balances[user.address] = { eth: 0, usd: '$0.00', error: 'Fetch failed' };
          }
        });
      
      // Wait for all fetches to complete in parallel
      await Promise.all(balancePromises);
      
      setUserBlockchainBalances(balances);
      console.log(`✅ All balances loaded:`, balances);
    } catch (err) {
      console.error('Failed to fetch blockchain balances:', err);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleUpdateDelay = async () => {
    if (!selectedBooking || delayInput === '') return;
    setUpdating(true);
    setUpdateResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/test/update-delay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking._id,
          delay_minutes: parseInt(delayInput),
          status: statusInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateResult({ type: 'success', data });
        await fetchData();
      } else {
        setUpdateResult({ type: 'error', message: data.error });
      }
    } catch (err) {
      setUpdateResult({ type: 'error', message: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyTx = async () => {
    if (!txHash.trim()) return;
    setVerifying(true);
    setTxResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/test/verify-tx/${txHash.trim()}`);
      const data = await res.json();
      setTxResult(data);
    } catch (err) {
      setTxResult({ status: 'error', message: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckWallet = async () => {
    if (!walletAddress.trim()) return;
    setCheckingWallet(true);
    setWalletResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/test/wallet-balance/${walletAddress.trim()}`);
      const data = await res.json();
      setWalletResult(data);
    } catch (err) {
      setWalletResult({ error: err.message });
    } finally {
      setCheckingWallet(false);
    }
  };

  const getCompensationBadge = (booking) => {
    const eth = booking.compensation?.eth_amount || 0;
    const usd = booking.compensation?.usd_value || 0;
    if (eth === 0) return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">No Comp</span>;
    if (eth >= 0.05) return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-bold">{eth} ETH 🔴</span>;
    if (eth >= 0.02) return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full font-bold">{eth} ETH (~${usd}) 🟠</span>;
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-bold">{eth} ETH (~${usd}) 🟡</span>;
  };

  return (
    <div style={{ padding: '24px' }} className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="w-8 h-8 text-yellow-400" />
          <h1 className="text-2xl font-bold">Developer Testing Panel</h1>
        </div>
        <p className="text-gray-300">Update flight delays, verify blockchain transactions, and check wallet balances</p>
        <button onClick={fetchData} className="mt-3 flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{allBookings.length}</p>
          <p className="text-sm text-blue-600">Total Bookings</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{allBookings.filter(b => b.compensation_claimed).length}</p>
          <p className="text-sm text-green-600">Claims Processed</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{allUsers.length}</p>
          <p className="text-sm text-purple-600">Registered Users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* === UPDATE FLIGHT DELAY === */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Update Flight Delay
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-500 mt-2">Loading bookings...</p>
            </div>
          ) : (
            <>
              {/* Booking selector */}
              <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
                {allBookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No bookings found. Book a flight first.</p>
                ) : allBookings.map(booking => (
                  <div
                    key={booking._id}
                    onClick={() => { setSelectedBooking(booking); setDelayInput(String(booking.delay_minutes || 0)); }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                      selectedBooking?._id === booking._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900">{booking.flight_number}</span>
                        <span className="text-gray-500 ml-2">{booking.departure_city} → {booking.arrival_city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCompensationBadge(booking)}
                        {booking.compensation_claimed && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Claimed ✓</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>Delay: <strong>{booking.delay_minutes} min</strong></span>
                      <span>Status: <strong>{booking.status}</strong></span>
                      {booking.user && booking.user[0] && (
                        <span>User: <strong>{booking.user[0].name || booking.user[0].email}</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedBooking && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Selected: <span className="text-blue-600">{selectedBooking.flight_number}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Delay (minutes)</label>
                      <input
                        type="number"
                        value={delayInput}
                        onChange={e => setDelayInput(e.target.value)}
                        placeholder="e.g. 240"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[0, 120, 180, 240, 1440].map(d => (
                          <button key={d} onClick={() => setDelayInput(String(d))}
                            className={`text-xs px-2 py-0.5 rounded ${delayInput === String(d) ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-orange-100'}`}>
                            {d}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                      <select
                        value={statusInput}
                        onChange={e => setStatusInput(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="diverted">Diverted</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview compensation */}
                  {delayInput !== '' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                      <p className="font-semibold text-amber-800">
                        💡 Estimated Compensation:
                        {' '}
                        {parseInt(delayInput) >= 1440 ? '0.05 ETH (~$100)' :
                         parseInt(delayInput) >= 240 ? '0.02 ETH (~$40)' :
                         parseInt(delayInput) >= 180 ? '0.015 ETH (~$30)' :
                         parseInt(delayInput) >= 120 ? '0.01 ETH (~$20)' :
                         '0 ETH (< 2 hrs)'}
                        {statusInput === 'cancelled' ? ' / 0.05 ETH (~$100) cancelled' : ''}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleUpdateDelay}
                    disabled={updating || delayInput === ''}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {updating ? <><Loader className="w-4 h-4 animate-spin" /> Updating...</> : <><Clock className="w-4 h-4" /> Update Delay</>}
                  </button>
                </div>
              )}

              {updateResult && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${updateResult.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {updateResult.type === 'success' ? (
                    <>
                      <p className="font-bold text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Updated Successfully
                      </p>
                      <p className="text-green-700 mt-1">{updateResult.data.message}</p>
                      {updateResult.data.booking?.tx_hash && (
                        <p className="text-xs text-green-600 mt-1 font-mono break-all">
                          Last TX: {updateResult.data.booking.tx_hash}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-red-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {updateResult.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* === VERIFY TRANSACTION === */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Verify Blockchain Transaction
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                placeholder="0x... transaction hash"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                onClick={handleVerifyTx}
                disabled={verifying || !txHash.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {verifying ? <><Loader className="w-4 h-4 animate-spin" /> Verifying...</> : <><ExternalLink className="w-4 h-4" /> Verify on Sepolia</>}
              </button>
            </div>

            {txResult && (
              <div className={`mt-4 p-4 rounded-lg text-sm ${txResult.status === 'confirmed' ? 'bg-green-50 border border-green-200' : txResult.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                {txResult.status === 'confirmed' ? (
                  <>
                    <p className="font-bold text-green-800 flex items-center gap-1 mb-2">
                      <CheckCircle className="w-4 h-4" /> Transaction Confirmed ✓
                    </p>
                    <div className="space-y-1 text-green-700">
                      <p>Block: <strong>#{txResult.blockNumber}</strong></p>
                      <p>Gas Used: <strong>{txResult.gasUsed?.toLocaleString()}</strong></p>
                      <p>Fee: <strong>{txResult.transactionFee?.toFixed(6)} ETH</strong></p>
                      <p>Success: <strong>{txResult.success ? '✅ Yes' : '❌ No'}</strong></p>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline text-xs"
                    >
                      View on Etherscan <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : txResult.status === 'pending' ? (
                  <p className="text-yellow-700 font-semibold">⏳ Transaction pending...</p>
                ) : (
                  <p className="text-red-700"><XCircle className="w-4 h-4 inline mr-1" />{txResult.message || txResult.error}</p>
                )}
              </div>
            )}
          </div>

          {/* === CHECK WALLET BALANCE === */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              Check Wallet Balance
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                value={walletAddress}
                onChange={e => setWalletAddress(e.target.value)}
                placeholder="0x... wallet address"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              {/* Quick fill from registered users */}
              {allUsers.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Quick fill from users:</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {allUsers.filter(u => u.address).map(u => (
                      <button
                        key={u._id}
                        onClick={() => setWalletAddress(u.address)}
                        className="w-full text-left text-xs px-2 py-1 bg-gray-50 hover:bg-purple-50 rounded border border-gray-200 hover:border-purple-300 transition-colors"
                      >
                        <span className="font-medium">{u.name || u.email}</span>
                        <span className="text-gray-400 ml-2 font-mono">{u.address?.slice(0, 16)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckWallet}
                disabled={checkingWallet || !walletAddress.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                {checkingWallet ? <><Loader className="w-4 h-4 animate-spin" /> Checking...</> : <><DollarSign className="w-4 h-4" /> Check Balance</>}
              </button>
            </div>

            {walletResult && (
              <div className={`mt-4 p-4 rounded-lg text-sm ${walletResult.error ? 'bg-red-50 border border-red-200' : 'bg-purple-50 border border-purple-200'}`}>
                {walletResult.error ? (
                  <p className="text-red-700"><XCircle className="w-4 h-4 inline mr-1" />{walletResult.error}</p>
                ) : (
                  <>
                    <p className="font-bold text-purple-800 mb-2">Wallet Balances (Sepolia)</p>
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <p className="text-xs text-gray-500">ETH Balance</p>
                        <p className="text-2xl font-bold text-gray-700">{walletResult.eth_balance?.toFixed(6)} ETH</p>
                      </div>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline text-xs"
                    >
                      View on Etherscan <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === ALL USERS TABLE === */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Registered Users & Wallets
          </h2>
          <button
            onClick={() => allUsers.length > 0 && fetchAllUsersBlockchainBalances(allUsers)}
            disabled={loadingBalances}
            className="flex items-center gap-2 text-sm bg-blue-100 hover:bg-blue-200 disabled:opacity-50 text-blue-700 px-3 py-1.5 rounded transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBalances ? 'animate-spin' : ''}`} />
            Refresh Balances
          </button>
        </div>
        {allUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">No users registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Name</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Email</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Wallet Address</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Wallet</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Wallet Balance</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(user => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{user.name}</td>
                    <td className="py-2 px-3 text-gray-600">{user.email}</td>
                    <td className="py-2 px-3">
                      <span className="font-mono text-xs text-gray-500">{user.address || '—'}</span>
                    </td>
                    <td className="py-2 px-3">
                      {user.wallet_created
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Blockchain</span>
                        : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⚠ Mock</span>
                      }
                    </td>
                    <td className="py-2 px-3">
                      {loadingBalances ? (
                        <span className="text-xs text-gray-400">Loading...</span>
                      ) : user.address && user.address !== '0x0000000000000000000000000000000000000000' ? (
                        <div className="flex flex-col gap-0.5">
                          <p className="font-bold text-blue-600 text-sm">{userBlockchainBalances[user.address]?.eth?.toFixed(6) || '0.000000'} ⛽</p>
                          <p className="text-xs font-semibold text-green-700">{userBlockchainBalances[user.address]?.usd || '$0.00'}</p>
                          {userBlockchainBalances[user.address]?.error && (
                            <p className="text-xs text-red-600">Error: {userBlockchainBalances[user.address].error}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {user.address && (
                        <button
                          onClick={() => { setWalletAddress(user.address); window.scrollTo(0, document.body.scrollHeight); }}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Check Balance
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === RECENT CLAIMS WITH TX HASHES === */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-600" />
          Recent Claims & Transactions
        </h2>
        {allBookings.filter(b => b.compensation_claimed).length === 0 ? (
          <p className="text-gray-500 text-sm">No compensation claims yet.</p>
        ) : (
          <div className="space-y-3">
            {allBookings.filter(b => b.compensation_claimed).map(booking => (
              <div key={booking._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{booking.flight_number}</p>
                    <p className="text-sm text-gray-600">{booking.departure_city} → {booking.arrival_city}</p>
                    {booking.user?.[0] && (
                      <p className="text-xs text-gray-500">User: {booking.user[0].name || booking.user[0].email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">{booking.compensation?.fly_amount} ETH</p>
                    <p className="text-xs text-gray-500">{booking.claim_method || 'ETH'}</p>
                    {booking.blockchain_success
                      ? <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">⛓ On-chain</span>
                      : <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">📋 Off-chain</span>
                    }
                  </div>
                </div>
                {booking.tx_hash && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-gray-700 break-all">{booking.tx_hash}</p>
                      <button
                        onClick={() => { setTxHash(booking.tx_hash); window.scrollTo(0, 0); }}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        Verify ↑
                      </button>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${booking.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap flex items-center gap-0.5"
                      >
                        Etherscan <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestingPage;
import React, { useState, useEffect } from 'react';
import { Shield, Plane, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Coffee, Hotel, DollarSign, Gift, Vote, Calendar, MapPin, ArrowRight, Coins, Globe, FileText } from 'lucide-react';
import Dialog from './components/Dialog';

const DecentralizedFlightDAO = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(2500);
  const [stakedTokens, setStakedTokens] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userFlights, setUserFlights] = useState([]);
  const [compensations, setCompensations] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    'Delta': 15000,
    'United': 8000,
    'Emirates': 12000
  });
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const [routes, setRoutes] = useState([
    {
      id: 1,
      route: 'JFK → LAX',
      airline: 'Delta',
      totalPool: 45000,
      participants: 156,
      avgDelay: 34,
      riskLevel: 'Medium',
      stakingReward: 12.5,
      compensationRates: {
        food: 25,
        hotel: 150,
        refund: 200,
        transport: 50
      }
    },
    {
      id: 2,
      route: 'LHR → CDG',
      airline: 'British Airways',
      totalPool: 28000,
      participants: 89,
      avgDelay: 18,
      riskLevel: 'Low',
      stakingReward: 8.2,
      compensationRates: {
        food: 20,
        hotel: 120,
        refund: 150,
        transport: 40
      }
    },
    {
      id: 3,
      route: 'SFO → SEA',
      airline: 'United',
      totalPool: 38000,
      participants: 124,
      avgDelay: 52,
      riskLevel: 'High',
      stakingReward: 18.7,
      compensationRates: {
        food: 35,
        hotel: 200,
        refund: 300,
        transport: 75
      }
    },
    {
      id: 4,
      route: 'DXB → BOM',
      airline: 'Emirates',
      totalPool: 52000,
      participants: 178,
      avgDelay: 28,
      riskLevel: 'Medium',
      stakingReward: 10.3,
      compensationRates: {
        food: 30,
        hotel: 180,
        refund: 250,
        transport: 60
      }
    }
  ]);

  const [proposals, setProposals] = useState([
    {
      id: 1,
      type: 'rate_change',
      title: 'Increase Hotel Compensation for JFK-LAX',
      description: 'Proposal to increase hotel compensation from 150 to 200 tokens due to rising hotel costs',
      proposer: '0x742d...9f3a',
      votesFor: 1245,
      votesAgainst: 432,
      totalVotes: 1677,
      status: 'Active',
      endsIn: '2d 14h',
      quorum: 2000
    },
    {
      id: 2,
      type: 'new_route',
      title: 'Add NYC → MIA Route Coverage',
      description: 'High-traffic route with 23% historical delay rate. Proposed pool: 40,000 tokens',
      proposer: '0x8a3c...12ef',
      votesFor: 892,
      votesAgainst: 234,
      totalVotes: 1126,
      status: 'Active',
      endsIn: '1d 8h',
      quorum: 2000
    },
    {
      id: 3,
      type: 'carbon_offset',
      title: 'Partner with Verified Carbon Project',
      description: 'Allocate 5% of pool reserves to purchase verified carbon credits',
      proposer: '0x5f2a...7bc9',
      votesFor: 1567,
      votesAgainst: 890,
      totalVotes: 2457,
      status: 'Active',
      endsIn: '3d 2h',
      quorum: 2000
    }
  ]);

  const [carbonProjects, setCarbonProjects] = useState([
    {
      id: 1,
      name: 'Amazon Rainforest Conservation',
      location: 'Brazil',
      credits: 500,
      pricePerCredit: 15,
      verified: true,
      impact: '2,500 tons CO2',
      image: '🌳'
    },
    {
      id: 2,
      name: 'Wind Energy Development',
      location: 'India',
      credits: 750,
      pricePerCredit: 12,
      verified: true,
      impact: '3,750 tons CO2',
      image: '💨'
    },
    {
      id: 3,
      name: 'Ocean Plastic Removal',
      location: 'Pacific Ocean',
      credits: 300,
      pricePerCredit: 20,
      verified: true,
      impact: '150 tons plastic',
      image: '🌊'
    }
  ]);

  const [marketListings, setMarketListings] = useState([
    {
      id: 1,
      seller: '0x892a...34bc',
      flight: 'AA4521 - JFK → LAX',
      date: '2026-01-15',
      seat: '12A',
      class: 'Economy',
      price: 180,
      originalPrice: 250
    },
    {
      id: 2,
      seller: '0x7a2f...98cd',
      flight: 'UA2341 - SFO → ORD',
      date: '2026-01-18',
      seat: '8C',
      class: 'Business',
      price: 420,
      originalPrice: 580
    },
    {
      id: 3,
      seller: '0x3c9d...12ab',
      flight: 'DL6789 - ATL → MIA',
      date: '2026-01-20',
      seat: '23F',
      class: 'Economy',
      price: 95,
      originalPrice: 140
    }
  ]);

  useEffect(() => {
    setAccount('0x742d35a8f9c3e12b4d89c7a63f2e8d1b5c4a9f3a');
  }, []);

  const handleStakeInRoute = (routeId, amount) => {
    if (amount > balance) {
      setDialog({ isOpen: true, title: 'Insufficient Balance', message: 'You do not have enough FLY tokens to complete this stake.', type: 'error' });
      return;
    }
    setBalance(balance - amount);
    setStakedTokens(stakedTokens + amount);
    setRoutes(routes.map(r => 
      r.id === routeId 
        ? { ...r, totalPool: r.totalPool + amount, participants: r.participants + 1 }
        : r
    ));
    setDialog({ isOpen: true, title: 'Staking Successful', message: `Successfully staked ${amount} FLY tokens in ${routes.find(r => r.id === routeId).route}!`, type: 'success' });
  };

  const handleFileCompensation = (flightNumber, delayMinutes, compensationType) => {
    const route = routes[0];
    const compensationAmount = route.compensationRates[compensationType];
    
    const newClaim = {
      id: compensations.length + 1,
      flightNumber,
      route: route.route,
      delayMinutes,
      type: compensationType,
      amount: compensationAmount,
      status: 'Processing',
      timestamp: new Date().toLocaleString(),
      txHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
    
    setCompensations([newClaim, ...compensations]);
    
    setTimeout(() => {
      setCompensations(prev => 
        prev.map(c => 
          c.id === newClaim.id 
            ? { ...c, status: 'Approved' }
            : c
        )
      );
      setBalance(balance + compensationAmount);
      setDialog({ isOpen: true, title: 'Compensation Approved', message: `${compensationAmount} FLY tokens have been credited to your account.`, type: 'success' });
    }, 3000);
  };

  const handleVote = (proposalId, voteType) => {
    setProposals(proposals.map(p => 
      p.id === proposalId
        ? {
            ...p,
            votesFor: voteType === 'for' ? p.votesFor + stakedTokens : p.votesFor,
            votesAgainst: voteType === 'against' ? p.votesAgainst + stakedTokens : p.votesAgainst,
            totalVotes: p.totalVotes + stakedTokens
          }
        : p
    ));
    setDialog({ isOpen: true, title: 'Vote Recorded', message: `Your vote has been recorded with ${stakedTokens} tokens.`, type: 'success' });
  };

  const handleSwapPoints = (fromAirline, toAirline, amount) => {
    if (loyaltyPoints[fromAirline] < amount) {
      setDialog({ isOpen: true, title: 'Insufficient Points', message: 'You do not have enough loyalty points for this swap.', type: 'error' });
      return;
    }
    const conversionRate = 0.85;
    const convertedAmount = Math.floor(amount * conversionRate);
    
    setLoyaltyPoints({
      ...loyaltyPoints,
      [fromAirline]: loyaltyPoints[fromAirline] - amount,
      [toAirline]: loyaltyPoints[toAirline] + convertedAmount
    });
    setDialog({ isOpen: true, title: 'Points Swapped', message: `Successfully swapped ${amount} ${fromAirline} points → ${convertedAmount} ${toAirline} points`, type: 'success' });
  };

  const handleBuyCarbon = (projectId) => {
    const project = carbonProjects.find(p => p.id === projectId);
    const cost = project.pricePerCredit * 10;
    
    if (balance < cost) {
      setDialog({ isOpen: true, title: 'Insufficient Balance', message: 'You do not have enough FLY tokens to purchase these carbon credits.', type: 'error' });
      return;
    }
    
    setBalance(balance - cost);
    setDialog({ isOpen: true, title: 'Carbon Credits Purchased', message: `Purchased 10 carbon credits for ${cost} FLY tokens. NFT certificate has been minted to your wallet!`, type: 'success' });
  };

  const handleBuySeat = (listingId) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (balance < listing.price) {
      setDialog({ isOpen: true, title: 'Insufficient Balance', message: 'You do not have enough FLY tokens to purchase this seat.', type: 'error' });
      return;
    }
    
    setBalance(balance - listing.price);
    setMarketListings(marketListings.filter(l => l.id !== listingId));
    setDialog({ isOpen: true, title: 'Seat Purchased', message: `Seat ${listing.seat} purchased successfully! Ticket has been transferred to your wallet.`, type: 'success' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  SkyGuard DAO
                </h1>
                <p className="text-sm text-gray-600">Decentralized Flight Compensation Protocol</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white border border-gray-200 px-6 py-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">{balance} FLY</p>
              </div>
              <div className="bg-white border border-gray-200 px-6 py-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Staked</p>
                <p className="text-2xl font-bold text-blue-600">{stakedTokens} FLY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              {['dashboard', 'stake', 'compensate', 'governance', 'loyalty', 'carbon', 'marketplace'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{routes.reduce((sum, r) => sum + r.totalPool, 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Pool Value</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{routes.reduce((sum, r) => sum + r.participants, 0)}</p>
                      <p className="text-sm text-gray-600">Active Participants</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{compensations.filter(c => c.status === 'Approved').length}</p>
                      <p className="text-sm text-gray-600">Claims Processed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Coins className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {compensations.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Compensated</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-600" />
                  How SkyGuard DAO Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-white">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Stake Tokens</h3>
                    <p className="text-sm text-gray-600">Join route-specific pools by staking FLY tokens</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-white">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Automatic Compensation</h3>
                    <p className="text-sm text-gray-600">Get instant payouts for delays via smart contracts</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-white">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
                    <p className="text-sm text-gray-600">No delays? Earn staking rewards from pool growth</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-white">4</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Govern Together</h3>
                    <p className="text-sm text-gray-600">Vote on rates, routes, and protocol changes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stake Tab */}
          {activeTab === 'stake' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Route Coverage Pools</h2>
                <p className="text-gray-600">Stake tokens in specific routes. Earn rewards when flights operate on time!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {routes.map(route => (
                  <div key={route.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{route.route}</h3>
                        <p className="text-sm text-gray-600">{route.airline}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        route.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                        route.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {route.riskLevel} Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Pool Size</p>
                        <p className="font-semibold text-gray-900">{route.totalPool.toLocaleString()} FLY</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Participants</p>
                        <p className="font-semibold text-gray-900">{route.participants}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Delay</p>
                        <p className="font-semibold text-gray-900">{route.avgDelay} min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">APY</p>
                        <p className="font-semibold text-blue-600">{route.stakingReward}%</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-gray-500 mb-2">Compensation Rates:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Coffee className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">Food: {route.compensationRates.food} FLY</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hotel className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">Hotel: {route.compensationRates.hotel} FLY</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">Refund: {route.compensationRates.refund} FLY</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700">Transport: {route.compensationRates.transport} FLY</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStakeInRoute(route.id, 100)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Stake 100 FLY
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compensate Tab */}
          {activeTab === 'compensate' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  File Compensation Claim
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Flight Number (e.g., AA1234)"
                    className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="date"
                    className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Delay Duration (minutes)"
                    className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <select className="border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option>Select Compensation Type</option>
                    <option value="food">Food Voucher</option>
                    <option value="hotel">Hotel Accommodation</option>
                    <option value="refund">Ticket Refund</option>
                    <option value="transport">Ground Transport</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleFileCompensation('AA1234', 120, 'food')}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4" />
                    Food
                  </button>
                  <button
                    onClick={() => handleFileCompensation('AA1234', 240, 'hotel')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Hotel className="w-4 h-4" />
                    Hotel
                  </button>
                  <button
                    onClick={() => handleFileCompensation('AA1234', 180, 'refund')}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Refund
                  </button>
                  <button
                    onClick={() => handleFileCompensation('AA1234', 90, 'transport')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Transport
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Compensation History</h3>
                {compensations.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No compensation claims yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {compensations.map(comp => (
                      <div key={comp.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-900">{comp.flightNumber} - {comp.route}</h4>
                          <p className="text-sm text-gray-600">Delay: {comp.delayMinutes} min | Type: {comp.type}</p>
                          <p className="text-xs text-gray-500">{comp.timestamp}</p>
                          <p className="text-xs text-gray-500 font-mono">TX: {comp.txHash.substring(0, 20)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">+{comp.amount} FLY</p>
                          <div className={`flex items-center gap-1 text-sm ${
                            comp.status === 'Approved' ? 'text-green-600' :
                            comp.status === 'Processing' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {comp.status === 'Approved' ? <CheckCircle className="w-4 h-4" /> :
                             comp.status === 'Processing' ? <Clock className="w-4 h-4" /> :
                             <XCircle className="w-4 h-4" />}
                            {comp.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Governance Tab */}
          {activeTab === 'governance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Vote className="w-6 h-6 text-blue-600" />
                  DAO Governance
                </h2>
                <p className="text-gray-600">
                  Vote on compensation rates, new routes, carbon initiatives, and protocol upgrades. Your voting power = staked tokens.
                </p>
              </div>

              <div className="space-y-4">
                {proposals.map(proposal => (
                  <div key={proposal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            proposal.type === 'rate_change' ? 'bg-blue-100 text-blue-800' :
                            proposal.type === 'new_route' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {proposal.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">by {proposal.proposer}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{proposal.title}</h3>
                        <p className="text-sm text-gray-600">{proposal.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {proposal.endsIn}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-green-600">For: {proposal.votesFor.toLocaleString()}</span>
                        <span className="text-red-600">Against: {proposal.votesAgainst.toLocaleString()}</span>
                        <span className="text-gray-500">Quorum: {proposal.quorum.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all"
                          style={{
                            width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${(proposal.totalVotes / proposal.quorum) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote(proposal.id, 'for')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
                      >
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'against')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
                      >
                        Vote Against
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loyalty Exchange Tab */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-blue-600" />
                  Cross-Airline Loyalty Exchange
                </h2>
                <p className="text-gray-600">
                  Swap loyalty points across airlines instantly. No more locked-in points!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(loyaltyPoints).map(([airline, points]) => (
                  <div key={airline} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{airline}</h3>
                    <p className="text-3xl font-bold text-blue-600">{points.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Available Points</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Swap Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">From Airline</label>
                    <select className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option>Delta</option>
                      <option>United</option>
                      <option>Emirates</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">To Airline</label>
                    <select className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option>United</option>
                      <option>Delta</option>
                      <option>Emirates</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleSwapPoints('Delta', 'United', 1000)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Swap Now
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">Conversion Rate: 1:0.85 | Smart contract fee: 2%</p>
              </div>
            </div>
          )}

          {/* Carbon Offset Tab */}
          {activeTab === 'carbon' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-600" />
                  Carbon Offset Marketplace
                </h2>
                <p className="text-gray-600">
                  Purchase verified carbon credits for your flights. Get NFT certificates for transparency!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {carbonProjects.map(project => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="text-6xl mb-4 text-center">{project.image}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.location}</span>
                      {project.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available Credits:</span>
                        <span className="font-semibold text-gray-900">{project.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per Credit:</span>
                        <span className="font-semibold text-gray-900">{project.pricePerCredit} FLY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impact:</span>
                        <span className="font-semibold text-green-600">{project.impact}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyCarbon(project.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      Buy 10 Credits ({project.pricePerCredit * 10} FLY)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Coins className="w-6 h-6 text-blue-600" />
                  Peer-to-Peer Seat Trading
                </h2>
                <p className="text-gray-600">
                  Buy and sell confirmed flight seats securely via smart contracts. No scalping, fair prices!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {marketListings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Plane className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">{listing.flight}</h3>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                            {listing.class}
                          </span>
                        </div>
                        <div className="flex gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {listing.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Seat {listing.seat}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Seller: {listing.seller}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-2">
                          <p className="text-3xl font-bold text-green-600">{listing.price} FLY</p>
                          <p className="text-sm text-gray-500 line-through">{listing.originalPrice} FLY</p>
                          <p className="text-xs text-green-600">
                            Save {((1 - listing.price / listing.originalPrice) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <button
                          onClick={() => handleBuySeat(listing.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Buy Seat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
    </div>
  );
};

export default DecentralizedFlightDAO;
import React, { useState, useEffect } from 'react';
import { Shield, Plane, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Coffee, Hotel, DollarSign, Gift, Vote, Calendar, MapPin, ArrowRight, Coins, Globe, FileText } from 'lucide-react';

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
      alert('Insufficient balance!');
      return;
    }
    setBalance(balance - amount);
    setStakedTokens(stakedTokens + amount);
    setRoutes(routes.map(r => 
      r.id === routeId 
        ? { ...r, totalPool: r.totalPool + amount, participants: r.participants + 1 }
        : r
    ));
    alert(`Successfully staked ${amount} FLY tokens in ${routes.find(r => r.id === routeId).route}!`);
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
      alert(`Compensation approved! ${compensationAmount} FLY tokens credited.`);
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
    alert(`Vote recorded! You voted with ${stakedTokens} tokens.`);
  };

  const handleSwapPoints = (fromAirline, toAirline, amount) => {
    if (loyaltyPoints[fromAirline] < amount) {
      alert('Insufficient loyalty points!');
      return;
    }
    const conversionRate = 0.85;
    const convertedAmount = Math.floor(amount * conversionRate);
    
    setLoyaltyPoints({
      ...loyaltyPoints,
      [fromAirline]: loyaltyPoints[fromAirline] - amount,
      [toAirline]: loyaltyPoints[toAirline] + convertedAmount
    });
    alert(`Swapped ${amount} ${fromAirline} points → ${convertedAmount} ${toAirline} points`);
  };

  const handleBuyCarbon = (projectId) => {
    const project = carbonProjects.find(p => p.id === projectId);
    const cost = project.pricePerCredit * 10;
    
    if (balance < cost) {
      alert('Insufficient balance!');
      return;
    }
    
    setBalance(balance - cost);
    alert(`Purchased 10 carbon credits for ${cost} FLY tokens. NFT certificate minted!`);
  };

  const handleBuySeat = (listingId) => {
    const listing = marketListings.find(l => l.id === listingId);
    if (balance < listing.price) {
      alert('Insufficient balance!');
      return;
    }
    
    setBalance(balance - listing.price);
    setMarketListings(marketListings.filter(l => l.id !== listingId));
    alert(`Seat ${listing.seat} purchased! Ticket transferred to your wallet.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
              <Plane className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-pink-300 bg-clip-text text-transparent">
                SkyGuard DAO
              </h1>
              <p className="text-sm text-gray-300">Decentralized Flight Compensation Protocol</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 rounded-xl border border-white border-opacity-20">
              <p className="text-xs text-gray-300">Wallet Balance</p>
              <p className="text-2xl font-bold">{balance} FLY</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg px-6 py-3 rounded-xl border border-white border-opacity-20">
              <p className="text-xs text-gray-300">Staked</p>
              <p className="text-2xl font-bold text-green-400">{stakedTokens} FLY</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 bg-white bg-opacity-10 backdrop-blur-lg p-2 rounded-xl">
          {['dashboard', 'stake', 'compensate', 'governance', 'loyalty', 'carbon', 'marketplace'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl">
                <Shield className="w-8 h-8 mb-2 text-blue-200" />
                <p className="text-3xl font-bold">{routes.reduce((sum, r) => sum + r.totalPool, 0).toLocaleString()}</p>
                <p className="text-sm text-blue-200">Total Pool Value</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl">
                <Users className="w-8 h-8 mb-2 text-purple-200" />
                <p className="text-3xl font-bold">{routes.reduce((sum, r) => sum + r.participants, 0)}</p>
                <p className="text-sm text-purple-200">Active Participants</p>
              </div>
              <div className="bg-gradient-to-br from-pink-600 to-pink-800 p-6 rounded-xl">
                <TrendingUp className="w-8 h-8 mb-2 text-pink-200" />
                <p className="text-3xl font-bold">{compensations.filter(c => c.status === 'Approved').length}</p>
                <p className="text-sm text-pink-200">Claims Processed</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl">
                <Coins className="w-8 h-8 mb-2 text-green-200" />
                <p className="text-3xl font-bold">
                  {compensations.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0)}
                </p>
                <p className="text-sm text-green-200">Total Compensated</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6" />
                How SkyGuard DAO Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Stake Tokens</h3>
                  <p className="text-sm text-gray-300">Join route-specific pools by staking FLY tokens</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Automatic Compensation</h3>
                  <p className="text-sm text-gray-300">Get instant payouts for delays via smart contracts</p>
                </div>
                <div className="text-center">
                  <div className="bg-pink-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Earn Rewards</h3>
                  <p className="text-sm text-gray-300">No delays? Earn staking rewards from pool growth</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Govern Together</h3>
                  <p className="text-sm text-gray-300">Vote on rates, routes, and protocol changes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stake' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h2 className="text-xl font-bold mb-2">Route Coverage Pools</h2>
              <p className="text-gray-300">Stake tokens in specific routes. Earn rewards when flights operate on time!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routes.map(route => (
                <div key={route.id} className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20 hover:border-opacity-40 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{route.route}</h3>
                      <p className="text-sm text-gray-400">{route.airline}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      route.riskLevel === 'Low' ? 'bg-green-600' :
                      route.riskLevel === 'Medium' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {route.riskLevel} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-gray-400">Pool Size</p>
                      <p className="font-semibold">{route.totalPool.toLocaleString()} FLY</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Participants</p>
                      <p className="font-semibold">{route.participants}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Avg Delay</p>
                      <p className="font-semibold">{route.avgDelay} min</p>
                    </div>
                    <div>
                      <p className="text-gray-400">APY</p>
                      <p className="font-semibold text-green-400">{route.stakingReward}%</p>
                    </div>
                  </div>

                  <div className="bg-black bg-opacity-30 p-3 rounded-lg mb-4">
                    <p className="text-xs text-gray-400 mb-2">Compensation Rates:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Coffee className="w-3 h-3" />
                        <span>Food: {route.compensationRates.food} FLY</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hotel className="w-3 h-3" />
                        <span>Hotel: {route.compensationRates.hotel} FLY</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Refund: {route.compensationRates.refund} FLY</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Transport: {route.compensationRates.transport} FLY</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStakeInRoute(route.id, 100)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 rounded-lg font-semibold transition-all"
                  >
                    Stake 100 FLY
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'compensate' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                File Compensation Claim
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Flight Number (e.g., AA1234)"
                  className="bg-black bg-opacity-30 px-4 py-3 rounded-lg border border-white border-opacity-20 focus:border-opacity-40 outline-none"
                />
                <input
                  type="date"
                  className="bg-black bg-opacity-30 px-4 py-3 rounded-lg border border-white border-opacity-20 focus:border-opacity-40 outline-none"
                />
                <input
                  type="number"
                  placeholder="Delay Duration (minutes)"
                  className="bg-black bg-opacity-30 px-4 py-3 rounded-lg border border-white border-opacity-20 focus:border-opacity-40 outline-none"
                />
                <select className="bg-black bg-opacity-30 px-4 py-3 rounded-lg border border-white border-opacity-20 focus:border-opacity-40 outline-none">
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
                  className="bg-orange-600 hover:bg-orange-500 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Coffee className="w-4 h-4" />
                  Food
                </button>
                <button
                  onClick={() => handleFileCompensation('AA1234', 240, 'hotel')}
                  className="bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Hotel className="w-4 h-4" />
                  Hotel
                </button>
                <button
                  onClick={() => handleFileCompensation('AA1234', 180, 'refund')}
                  className="bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Refund
                </button>
                <button
                  onClick={() => handleFileCompensation('AA1234', 90, 'transport')}
                  className="bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Transport
                </button>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h3 className="text-xl font-bold mb-4">Your Compensation History</h3>
              {compensations.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No compensation claims yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {compensations.map(comp => (
                    <div key={comp.id} className="bg-black bg-opacity-30 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-bold">{comp.flightNumber} - {comp.route}</h4>
                        <p className="text-sm text-gray-400">Delay: {comp.delayMinutes} min | Type: {comp.type}</p>
                        <p className="text-xs text-gray-500">{comp.timestamp}</p>
                        <p className="text-xs text-gray-500 font-mono">TX: {comp.txHash.substring(0, 20)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">+{comp.amount} FLY</p>
                        <div className={`flex items-center gap-1 text-sm ${
                          comp.status === 'Approved' ? 'text-green-400' :
                          comp.status === 'Processing' ? 'text-yellow-400' :
                          'text-red-400'
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

        {activeTab === 'governance' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Vote className="w-6 h-6" />
                DAO Governance
              </h2>
              <p className="text-gray-300">
                Vote on compensation rates, new routes, carbon initiatives, and protocol upgrades. Your voting power = staked tokens.
              </p>
            </div>

            <div className="space-y-4">
              {proposals.map(proposal => (
                <div key={proposal.id} className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          proposal.type === 'rate_change' ? 'bg-blue-600' :
                          proposal.type === 'new_route' ? 'bg-green-600' :
                          'bg-purple-600'
                        }`}>
                          {proposal.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">by {proposal.proposer}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{proposal.title}</h3>
                      <p className="text-sm text-gray-300">{proposal.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="bg-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {proposal.endsIn}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-400">For: {proposal.votesFor.toLocaleString()}</span>
                      <span className="text-red-400">Against: {proposal.votesAgainst.toLocaleString()}</span>
                      <span className="text-gray-400">Quorum: {proposal.quorum.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-black bg-opacity-30 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${(proposal.totalVotes / proposal.quorum) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVote(proposal.id, 'for')}
                      className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg font-semibold transition-all"
                    >
                      Vote For
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'against')}
                      className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg font-semibold transition-all"
                    >
                      Vote Against
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Gift className="w-6 h-6" />
                Cross-Airline Loyalty Exchange
              </h2>
              <p className="text-gray-300">
                Swap loyalty points across airlines instantly. No more locked-in points!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(loyaltyPoints).map(([airline, points]) => (
                <div key={airline} className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-xl">
                  <h3 className="text-lg font-bold mb-1">{airline}</h3>
                  <p className="text-3xl font-bold">{points.toLocaleString()}</p>
                  <p className="text-sm text-blue-200">Available Points</p>
                </div>
              ))}
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h3 className="font-bold mb-4">Swap Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">From Airline</label>
                  <select className="w-full bg-black bg-opacity-30 px-4 py-3 rounded-lg border border-white border-opacity-20 outline-none">
                    <option>Delta</option>
                    <option>United</option>
                    <option>Emirates</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full bg-black bg-opacity-30 px-4 py-3 rounded-lg border border-white border-opacity-20 outline-none"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">To Airline</label>
                  <select className="w-full bg-black bg-opacity-30 px-4 py-3 rounded-lg border border-white border-opacity-20 outline-none">
                    <option>United</option>
                    <option>Delta</option>
                    <option>Emirates</option>
                  </select>
                </div>
                <button
                  onClick={() => handleSwapPoints('Delta', 'United', 1000)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 rounded-lg font-semibold transition-all"
                >
                  Swap Now
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">Conversion Rate: 1:0.85 | Smart contract fee: 2%</p>
            </div>
          </div>
        )}

        {activeTab === 'carbon' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Globe className="w-6 h-6" />
                Carbon Offset Marketplace
              </h2>
              <p className="text-gray-300">
                Purchase verified carbon credits for your flights. Get NFT certificates for transparency!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {carbonProjects.map(project => (
                <div key={project.id} className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20 hover:border-opacity-40 transition-all">
                  <div className="text-6xl mb-4 text-center">{project.image}</div>
                  <h3 className="text-lg font-bold mb-2">{project.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{project.location}</span>
                    {project.verified && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  
                  <div className="bg-black bg-opacity-30 p-3 rounded-lg mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available Credits:</span>
                      <span className="font-semibold">{project.credits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price per Credit:</span>
                      <span className="font-semibold">{project.pricePerCredit} FLY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Impact:</span>
                      <span className="font-semibold text-green-400">{project.impact}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyCarbon(project.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 py-3 rounded-lg font-semibold transition-all"
                  >
                    Buy 10 Credits ({project.pricePerCredit * 10} FLY)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Coins className="w-6 h-6" />
                Peer-to-Peer Seat Trading
              </h2>
              <p className="text-gray-300">
                Buy and sell confirmed flight seats securely via smart contracts. No scalping, fair prices!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {marketListings.map(listing => (
                <div key={listing.id} className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl border border-white border-opacity-20 hover:border-opacity-40 transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Plane className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold">{listing.flight}</h3>
                        <span className="bg-purple-600 px-2 py-1 rounded text-xs font-semibold">
                          {listing.class}
                        </span>
                      </div>
                      <div className="flex gap-6 text-sm text-gray-300">
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
                        <p className="text-3xl font-bold text-green-400">{listing.price} FLY</p>
                        <p className="text-sm text-gray-400 line-through">{listing.originalPrice} FLY</p>
                        <p className="text-xs text-green-400">
                          Save {((1 - listing.price / listing.originalPrice) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuySeat(listing.id)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-6 py-2 rounded-lg font-semibold transition-all"
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
  );
};

export default DecentralizedFlightDAO;

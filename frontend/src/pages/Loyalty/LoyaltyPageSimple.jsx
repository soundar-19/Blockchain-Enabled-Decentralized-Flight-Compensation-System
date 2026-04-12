import React, { useState } from 'react';
import { Gift, ArrowRight } from 'lucide-react';

const LoyaltyPageSimple = ({ account, setDialog }) => {
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    'Delta': 15000,
    'United': 8000,
    'Emirates': 12000
  });
  const [fromAirline, setFromAirline] = useState('Delta');
  const [toAirline, setToAirline] = useState('United');
  const [swapAmount, setSwapAmount] = useState('');

  const handleSwapPoints = () => {
    if (!account || !account.address) {
      setDialog({ isOpen: true, title: 'Error', message: 'No account connected', type: 'error' });
      return;
    }

    if (loyaltyPoints[fromAirline] < parseInt(swapAmount)) {
      setDialog({ isOpen: true, title: 'Insufficient Points', message: 'You do not have enough loyalty points for this swap.', type: 'error' });
      return;
    }

    if (fromAirline === toAirline) {
      setDialog({ isOpen: true, title: 'Error', message: 'Please select different airlines', type: 'error' });
      return;
    }

    const conversionRate = 0.85;
    const convertedAmount = Math.floor(parseInt(swapAmount) * conversionRate);
    
    setLoyaltyPoints({
      ...loyaltyPoints,
      [fromAirline]: loyaltyPoints[fromAirline] - parseInt(swapAmount),
      [toAirline]: (loyaltyPoints[toAirline] || 0) + convertedAmount
    });
    
    setDialog({ 
      isOpen: true, 
      title: 'Points Swapped', 
      message: `Successfully swapped ${swapAmount} ${fromAirline} points → ${convertedAmount} ${toAirline} points`, 
      type: 'success' 
    });
    
    setSwapAmount('');
  };

  return (
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
            <select 
              value={fromAirline}
              onChange={(e) => setFromAirline(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>Delta</option>
              <option>United</option>
              <option>Emirates</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-2">Amount</label>
            <input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="1000"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-2">To Airline</label>
            <select 
              value={toAirline}
              onChange={(e) => setToAirline(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>United</option>
              <option>Delta</option>
              <option>Emirates</option>
            </select>
          </div>
          <button
            onClick={handleSwapPoints}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Swap Now
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">Conversion Rate: 1:0.85 | Smart contract fee: 2%</p>
      </div>
    </div>
  );
};

export default LoyaltyPageSimple;

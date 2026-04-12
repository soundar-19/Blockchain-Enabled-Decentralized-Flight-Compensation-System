import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import './LoyaltyPage.css';

const LoyaltyPage = ({ loyaltyPoints = {}, onSwapPoints }) => {
  return (
    <div className="loyalty-container">
      <div className="loyalty-header">
        <h2><Gift /> Cross-Airline Loyalty Exchange</h2>
        <p>Swap loyalty points across airlines instantly</p>
      </div>

      <div className="loyalty-cards-grid">
        {Object.entries(loyaltyPoints).map(([airline, points]) => (
          <div key={airline} className="airline-card">
            <h3>{airline}</h3>
            <p className="points">{points.toLocaleString()}</p>
            <p className="label">Available Points</p>
          </div>
        ))}
      </div>

      <div className="swap-section">
        <h3>Swap Points</h3>
        <div className="swap-form">
          <div><label>From Airline</label><select><option>Delta</option><option>United</option><option>Emirates</option></select></div>
          <div><label>Amount</label><input type="number" placeholder="1000" /></div>
          <ArrowRight className="arrow-icon" />
          <div><label>To Airline</label><select><option>United</option><option>Delta</option><option>Emirates</option></select></div>
          <button onClick={() => onSwapPoints('Delta', 'United', 1000)}>Swap Now</button>
        </div>
        <p className="rate-info">Conversion Rate: 1:0.85 | Smart contract fee: 2%</p>
      </div>
    </div>
  );
};

export default LoyaltyPage;

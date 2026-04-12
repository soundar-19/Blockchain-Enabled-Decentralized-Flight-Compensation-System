import React from 'react';
import { Gift, Coffee, Hotel, DollarSign, MapPin } from 'lucide-react';
import './VouchersPage.css';

const VouchersPage = ({ compensations }) => {
  const vouchersByType = {
    food: compensations.filter(c => c.method === 'voucher' && c.compensationType === 'food'),
    hotel: compensations.filter(c => c.method === 'voucher' && c.compensationType === 'hotel'),
    refund: compensations.filter(c => c.method === 'voucher' && c.compensationType === 'refund'),
    transport: compensations.filter(c => c.method === 'voucher' && c.compensationType === 'transport'),
  };

  return (
    <div className="vouchers-container">
      <div className="vouchers-header">
        <h2><Gift className="icon" /> My Vouchers</h2>
        <p>View and manage all your compensation vouchers</p>
        <div className="stats-grid">
          <div><p>Total Vouchers</p><p className="stat-value">{Object.values(vouchersByType).flat().length}</p></div>
          <div><p>Total Value</p><p className="stat-value">{Object.values(vouchersByType).flat().reduce((sum, c) => sum + c.amount, 0)}</p></div>
          <div><p>Food</p><p className="stat-value">{vouchersByType.food.length}</p></div>
          <div><p>Hotel</p><p className="stat-value">{vouchersByType.hotel.length}</p></div>
        </div>
      </div>

      {[
        { type: 'food', icon: Coffee, title: 'Food Vouchers 🍽️', color: 'orange', vouchers: vouchersByType.food },
        { type: 'hotel', icon: Hotel, title: 'Hotel Vouchers 🏨', color: 'blue', vouchers: vouchersByType.hotel },
        { type: 'refund', icon: DollarSign, title: 'Refund Vouchers 💰', color: 'green', vouchers: vouchersByType.refund },
        { type: 'transport', icon: MapPin, title: 'Transport Vouchers 🚗', color: 'purple', vouchers: vouchersByType.transport }
      ].map(section => (
        <div key={section.type} className="voucher-section">
          <h3><section.icon className="icon" /> {section.title}</h3>
          {section.vouchers.length > 0 ? (
            <div className="vouchers-list">
              {section.vouchers.map((v, idx) => (
                <div key={idx} className={`voucher-card voucher-${section.color}`}>
                  <div><h4>{v.flightNumber}</h4><p>Delay: {v.delayMinutes}m</p></div>
                  <div><p className="amount">{v.amount}</p><p>Points</p></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No {section.type} vouchers yet</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default VouchersPage;

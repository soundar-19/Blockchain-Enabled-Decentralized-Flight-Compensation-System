import React, { useState } from 'react';
import { ShoppingCart, Plane, Plus, Trash2 } from 'lucide-react';
import './MarketplacePage.css';

const MarketplacePage = ({ marketplaceListings = [], myOwnedTickets = [], myListedTickets = [], userBookings = [], onBuyTicket, onSellTicket, onDelistTicket }) => {
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div className="marketplace-container">
      <div className="marketplace-tabs">
        {[
          { id: 'browse', label: 'Browse Tickets', icon: ShoppingCart },
          { id: 'my-tickets', label: 'My Tickets', icon: Plane },
          { id: 'sell', label: 'Sell Ticket', icon: Plus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className="tab-icon" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="tab-content">
          <h2><ShoppingCart /> Buy Flight Tickets</h2>
          <p>Browse and purchase discounted flight tickets from other users</p>
          
          {marketplaceListings.length > 0 ? (
            <div className="listings-grid">
              {marketplaceListings.map(listing => (
                <div key={listing.id} className="listing-card">
                  <div className="listing-header">
                    <div>
                      <p className="flight-number">{listing.flightNumber}</p>
                      <span className="class-badge">{listing.class}</span>
                      <p className="route">📍 {listing.route}</p>
                      <p className="date">📅 {listing.date}</p>
                    </div>
                    <div className="price-section">
                      <p className="price">${listing.listingPrice}</p>
                      <p className="original">Original: ${listing.originalPrice}</p>
                      <p className="discount">Save {Math.round((1 - listing.listingPrice / listing.originalPrice) * 100)}%</p>
                    </div>
                  </div>
                  <button className="buy-btn" onClick={() => onBuyTicket(listing.id)}>
                    <ShoppingCart className="btn-icon" />
                    Buy Ticket
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><ShoppingCart /><p>No tickets available</p></div>
          )}
        </div>
      )}

      {/* My Tickets Tab */}
      {activeTab === 'my-tickets' && (
        <div className="tab-content">
          <h2><Plane /> My Tickets</h2>
          <p>Your owned flight tickets ({myOwnedTickets.length} total)</p>
          
          {myOwnedTickets.length > 0 ? (
            <div className="tickets-grid">
              {myOwnedTickets.map(ticket => (
                <div key={ticket.id} className="ticket-card">
                  <p>{ticket.flightNumber}</p>
                  <p className="route">{ticket.route}</p>
                  <button onClick={() => onSellTicket(ticket.id)}>Sell This Ticket</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><Plane /><p>You don't have any tickets yet</p></div>
          )}
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div className="tab-content">
          <h2><Plus /> Sell Your Ticket</h2>
          <p>List your ticket for sale on the marketplace</p>
          
          {myOwnedTickets.length > 0 ? (
            <div className="sell-form">
              <select><option>Select a ticket...</option>{myOwnedTickets.map(t => <option key={t.id}>{t.flightNumber}</option>)}</select>
              <input type="number" placeholder="Listing Price ($)" />
              <button><Plus className="btn-icon" />List for Sale</button>
            </div>
          ) : (
            <div className="empty-state"><Plus /><p>You have no tickets to sell</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;

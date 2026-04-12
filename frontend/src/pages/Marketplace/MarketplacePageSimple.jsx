import React, { useState } from 'react';
import { ShoppingCart, FileText, Plus, Plane, Trash2 } from 'lucide-react';

const MarketplacePageSimple = ({ account, setDialog }) => {
  const [marketplaceTab, setMarketplaceTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  
  const [marketplaceListings] = useState([
    { id: 1, flightNumber: 'AA4521', route: 'JFK → LAX', date: '2026-01-15', seat: '12A', class: 'Economy', listingPrice: 180, originalPrice: 250, discount: 28 },
    { id: 2, flightNumber: 'UA2341', route: 'SFO → ORD', date: '2026-01-18', seat: '8C', class: 'Business', listingPrice: 420, originalPrice: 580, discount: 27 },
    { id: 3, flightNumber: 'DL6789', route: 'ATL → MIA', date: '2026-01-20', seat: '23F', class: 'Economy', listingPrice: 95, originalPrice: 140, discount: 32 }
  ]);

  const [myOwnedTickets, setMyOwnedTickets] = useState([]);
  const [myListedTickets, setMyListedTickets] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [sellForm, setSellForm] = useState({ ticketId: '', listingPrice: '' });

  const handleBuyTicket = (listingId) => {
    if (!account?.address) {
      setDialog({ isOpen: true, title: 'Error', message: 'No account connected', type: 'error' });
      return;
    }

    setDialog({ isOpen: true, title: 'Success', message: 'Ticket purchased successfully!', type: 'success' });
  };

  const handleDelistTicket = (listingId) => {
    setDialog({ isOpen: true, title: 'Success', message: 'Ticket delisted successfully!', type: 'success' });
  };

  const handleSellTicket = () => {
    if (!account?.address) {
      setDialog({ isOpen: true, title: 'Error', message: 'No account connected', type: 'error' });
      return;
    }

    if (!sellForm.ticketId || !sellForm.listingPrice) {
      setDialog({ isOpen: true, title: 'Error', message: 'Please select a ticket and enter a price', type: 'error' });
      return;
    }

    setDialog({ isOpen: true, title: 'Success', message: 'Ticket listed successfully!', type: 'success' });
    setSellForm({ ticketId: '', listingPrice: '' });
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'browse', label: 'Browse Tickets', icon: ShoppingCart },
          { id: 'my-tickets', label: 'My Tickets', icon: FileText },
          { id: 'sell', label: 'Sell Ticket', icon: Plus }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMarketplaceTab(tab.id)}
              className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                marketplaceTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Browse Tickets Tab */}
      {marketplaceTab === 'browse' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Buy Flight Tickets
            </h2>
            <p className="text-blue-700 mt-2">Browse and purchase discounted flight tickets from other users</p>
          </div>

          {marketplaceListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketplaceListings.map(listing => (
                <div key={listing.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Plane className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-gray-900">{listing.flightNumber}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{listing.class}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📍 {listing.route}</p>
                      <p className="text-sm text-gray-600">📅 {listing.date}</p>
                      <p className="text-sm text-gray-600">💺 Seat {listing.seat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">${listing.listingPrice}</p>
                      <p className="text-sm text-gray-500 line-through">${listing.originalPrice}</p>
                      <p className="text-xs text-green-600 font-semibold">Save {listing.discount}%</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyTicket(listing.id)}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4 inline mr-2" />
                    Buy Ticket
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No tickets available in the marketplace</p>
            </div>
          )}
        </div>
      )}

      {/* My Tickets Tab */}
      {marketplaceTab === 'my-tickets' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-md border border-blue-200 p-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Plane className="w-6 h-6" />
              My Tickets
            </h2>
            <p className="text-blue-700 mt-2">Your owned flight tickets ({myOwnedTickets.length} total)</p>
          </div>

          {myOwnedTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myOwnedTickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Plane className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-gray-900">{ticket.flightNumber}</span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">{ticket.class}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📍 {ticket.route}</p>
                      <p className="text-sm text-gray-600">📅 {ticket.date}</p>
                      <p className="text-sm text-gray-600">💺 Seat {ticket.seat}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${ticket.price}</p>
                      <p className="text-xs text-gray-500">Original price</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMarketplaceTab('sell')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Sell This Ticket
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You don't have any tickets yet</p>
              <p className="text-sm text-gray-500">Book flights from the Booking tab or purchase from the marketplace</p>
            </div>
          )}

          {userBookings.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings ({userBookings.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userBookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md border border-green-200 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-gray-900">{booking.flightNumber}</span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Booked</span>
                        </div>
                        <p className="text-sm text-gray-600">📍 {booking.route}</p>
                        <p className="text-sm text-gray-600">📅 {booking.date}</p>
                        <p className="text-sm text-gray-600">💺 Seat {booking.seat} ({booking.class})</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">${booking.price}</p>
                    </div>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-700">✓ Confirmed</p>
                      <p className="text-xs text-gray-600">{booking.bookingDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myListedTickets.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Currently Listed for Sale ({myListedTickets.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myListedTickets.map(listing => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-md border border-orange-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Plane className="w-5 h-5 text-orange-600" />
                          <span className="font-bold text-gray-900">{listing.flightNumber}</span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">Listed</span>
                        </div>
                        <p className="text-sm text-gray-600">📍 {listing.route}</p>
                        <p className="text-sm text-gray-600">💵 ${listing.listingPrice}</p>
                      </div>
                      <p className="text-xs text-orange-600">Save {listing.discount}%</p>
                    </div>
                    <button
                      onClick={() => handleDelistTicket(listing.id)}
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Remove Listing
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sell Ticket Tab */}
      {marketplaceTab === 'sell' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg shadow-md border border-green-200 p-6">
            <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Sell Your Ticket
            </h2>
            <p className="text-green-700 mt-2">List your ticket for sale on the marketplace</p>
          </div>

          {myOwnedTickets.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Ticket</label>
                <select
                  value={sellForm.ticketId}
                  onChange={(e) => setSellForm({...sellForm, ticketId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Choose a ticket...</option>
                  {myOwnedTickets.map(ticket => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.flightNumber} ({ticket.route}) - Original: ${ticket.price}
                    </option>
                  ))}
                </select>
              </div>

              {sellForm.ticketId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Price ($)</label>
                  <input
                    type="number"
                    value={sellForm.listingPrice}
                    onChange={(e) => setSellForm({...sellForm, listingPrice: e.target.value})}
                    placeholder="Enter your asking price"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              )}

              <button
                onClick={handleSellTicket}
                disabled={loading || !sellForm.ticketId || !sellForm.listingPrice}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                List Ticket for Sale
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You have no tickets to sell</p>
              <p className="text-sm text-gray-500">Purchase or create tickets first to list them for sale</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketplacePageSimple;

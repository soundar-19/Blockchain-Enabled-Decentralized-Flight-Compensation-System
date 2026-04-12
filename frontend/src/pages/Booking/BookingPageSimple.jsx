import React, { useState, useEffect } from 'react';
import { Plane, Loader } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const BookingPageSimple = ({ account, setDialog }) => {
  const [availableFlights] = useState([
    { id: 1, flightNumber: 'AA101', airline: 'American Airlines', route: 'NYC → LAX', date: '2026-02-28', departTime: '08:00', arrivalTime: '11:30', duration: '5h 30m', class: 'Economy', price: 250, availableSeats: 15 },
    { id: 2, flightNumber: 'UA202', airline: 'United Airlines', route: 'SFO → ORD', date: '2026-02-28', departTime: '10:15', arrivalTime: '16:45', duration: '4h 30m', class: 'Business', price: 580, availableSeats: 8 },
    { id: 3, flightNumber: 'DL303', airline: 'Delta Airlines', route: 'ATL → MIA', date: '2026-02-28', departTime: '12:00', arrivalTime: '14:00', duration: '2h', class: 'Economy', price: 180, availableSeats: 25 }
  ]);

  const [bookingForm, setBookingForm] = useState({ flightId: '', seat: '' });
  const [loading, setLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [fetchingBookings, setFetchingBookings] = useState(true);

  const userId = account?._id;

  useEffect(() => {
    if (userId) {
      fetchUserBookings();
    } else {
      setFetchingBookings(false);
    }
  }, [userId]);

  const fetchUserBookings = async () => {
    try {
      setFetchingBookings(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/bookings/user/${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setUserBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setFetchingBookings(false);
    }
  };

  const handleBookFlight = async (flightId) => {
    if (!userId) {
      setDialog({ isOpen: true, title: 'Error', message: 'Please log in first', type: 'error' });
      return;
    }

    // Only allow booking if flight is currently selected and seat is entered
    if (bookingForm.flightId !== flightId || !bookingForm.seat) {
      setDialog({ isOpen: true, title: 'Error', message: 'Please enter a seat number', type: 'error' });
      return;
    }

    const flight = availableFlights.find(f => f.id === flightId);
    if (!flight) return;

    try {
      setLoading(true);
      const [departureCity, arrivalCity] = flight.route.split(' → ').map(c => c.trim());
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: userId,
          flight_number: flight.flightNumber,
          airline: flight.airline,
          departure_city: departureCity,
          arrival_city: arrivalCity,
          scheduled_departure: `${flight.date}T${flight.departTime}`,
          scheduled_arrival: `${flight.date}T${flight.arrivalTime}`,
          seat: bookingForm.seat,
          ticket_class: flight.class,
          status: 'completed',
          delay_minutes: 0
        })
      });

      if (response.ok) {
        await fetchUserBookings();
        setDialog({
          isOpen: true,
          title: 'Booking Confirmed! ✈️',
          message: `Flight ${flight.flightNumber} booked successfully! Booking saved to database.`,
          type: 'success'
        });
        setBookingForm({ flightId: '', seat: '' });
      } else {
        const error = await response.json();
        setDialog({ isOpen: true, title: 'Booking Failed', message: error.error || 'Failed to save booking', type: 'error' });
      }
    } catch (error) {
      setDialog({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-100 rounded-lg shadow-md border border-purple-200 p-6">
        <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
          <Plane className="w-7 h-7" />
          Book Flight Tickets
        </h2>
        <p className="text-purple-700 mt-2">Browse and book your next flight. Bookings are stored under your account.</p>
        {account?.address && (
          <p className="text-xs text-purple-500 mt-1 font-mono">Wallet: {account.address}</p>
        )}
      </div>

      {/* Available Flights */}
      <div className="space-y-4">
        {availableFlights.map(flight => (
          <div key={flight.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 uppercase font-semibold mb-1">Flight</p>
                <p className="text-2xl font-bold text-blue-600">{flight.flightNumber}</p>
                <p className="text-sm text-gray-700 mt-1">{flight.airline}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase font-semibold mb-1">Route</p>
                <p className="text-lg font-bold text-gray-900">{flight.route}</p>
                <p className="text-xs text-gray-500 mt-1">Date: {flight.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase font-semibold mb-1">Schedule</p>
                <p className="text-lg font-bold text-gray-900">{flight.departTime} → {flight.arrivalTime}</p>
                <p className="text-xs text-gray-500">{flight.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase font-semibold mb-1">Price</p>
                <p className="text-2xl font-bold text-green-600">${flight.price}</p>
                <p className="text-sm text-gray-600">{flight.class} · {flight.availableSeats} seats</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Seat Number</label>
                <input
                  type="text"
                  placeholder="e.g., 12A"
                  value={bookingForm.flightId === flight.id ? bookingForm.seat : ''}
                  onChange={(e) => setBookingForm({ flightId: flight.id, seat: e.target.value.toUpperCase() })}
                  onFocus={() => setBookingForm(prev => ({ ...prev, flightId: flight.id }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => handleBookFlight(flight.id)}
                disabled={loading || bookingForm.flightId !== flight.id || !bookingForm.seat}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                {loading && bookingForm.flightId === flight.id ? (
                  <span className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Booking...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Plane className="w-4 h-4" /> Book This Flight</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User's Bookings */}
      {fetchingBookings ? (
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Loader className="w-6 h-6 text-blue-600 mx-auto animate-spin mb-2" />
          <p className="text-blue-700">Loading your bookings...</p>
        </div>
      ) : userBookings.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Your Bookings ({userBookings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userBookings.map(booking => (
              <div key={booking._id} className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-gray-900">{booking.flight_number}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    booking.status === 'delayed' ? 'bg-orange-100 text-orange-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>{booking.status}</span>
                </div>
                <p className="text-sm text-gray-600">✈️ {booking.airline}</p>
                <p className="text-sm text-gray-600">📍 {booking.departure_city} → {booking.arrival_city}</p>
                <p className="text-sm text-gray-600">💺 Seat: {booking.seat || 'N/A'} ({booking.ticket_class})</p>
                <p className="text-sm text-gray-600">⏱️ Delay: {booking.delay_minutes} min</p>
                {booking.compensation?.fly_amount > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-bold text-yellow-800">
                      ⛽ {booking.compensation.fly_amount} ETH available
                      {booking.compensation_claimed && ' ✓ Claimed'}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">ID: {booking._id}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No bookings yet. Book a flight above!</p>
        </div>
      )}
    </div>
  );
};

export default BookingPageSimple;
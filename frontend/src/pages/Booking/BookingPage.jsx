import React, { useState } from 'react';
import { Plane, MapPin } from 'lucide-react';
import './BookingPage.css';

const BookingPage = ({ availableFlights = [], onBookFlight }) => {
  const [selectedFlight, setSelectedFlight] = useState(null);

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h2><Plane /> Book Flight Tickets</h2>
        <p>Browse and book your next flight. Your tickets will appear in Marketplace → My Tickets</p>
      </div>

      {availableFlights.length > 0 ? (
        <div className="flights-grid">
          {availableFlights.map(flight => (
            <div key={flight.id} className="flight-card">
              <div className="flight-info">
                <div className="flight-main">
                  <p className="airline">{flight.airline}</p>
                  <p className="number">{flight.flightNumber}</p>
                  <p className="route"><MapPin className="icon" />{flight.route}</p>
                </div>
                <div className="flight-time">
                  <div><p className="time">{flight.departTime}</p><p className="label">Depart</p></div>
                  <div className="arrow">→</div>
                  <div><p className="time">{flight.arrivalTime}</p><p className="label">Arrive</p></div>
                </div>
                <div className="flight-class">
                  <p className="class-name">{flight.class}</p>
                  <p className="available">{flight.availableSeats} seats</p>
                </div>
              </div>
              <div className="flight-price">
                <p className="price">${flight.price}</p>
                <input type="text" placeholder="Seat (e.g., 12A)" className="seat-input" />
                <button className="book-btn" onClick={() => {setSelectedFlight(flight); onBookFlight(flight.id, 'selected');}}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Plane className="empty-icon" />
          <p>No flights available for booking</p>
        </div>
      )}
    </div>
  );
};

export default BookingPage;

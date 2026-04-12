// Frontend marketplace service
const marketplaceService = {
  // Get user's owned tickets
  getMyTickets: async (address) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/my-tickets/${address}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return await response.json();
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      return { owned_tickets: [], listed_tickets: [] };
    }
  },

  // Get all marketplace listings
  getMarketplaceListings: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/marketplace/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      return { listings: [], count: 0 };
    }
  },

  // List a ticket for sale
  listTicket: async (seller, ticketId, listingPrice) => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller,
          ticketId,
          listingPrice: parseFloat(listingPrice)
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to list ticket');
      }
      return await response.json();
    } catch (error) {
      console.error('Error listing ticket:', error);
      throw error;
    }
  },

  // Buy a ticket from marketplace
  buyTicket: async (listingId, buyer) => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          buyer
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to buy ticket');
      }
      return await response.json();
    } catch (error) {
      console.error('Error buying ticket:', error);
      throw error;
    }
  },

  // Delist a ticket from marketplace
  delistTicket: async (listingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/delist/${listingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delist ticket');
      }
      return await response.json();
    } catch (error) {
      console.error('Error delisting ticket:', error);
      throw error;
    }
  },

  // Create a new ticket
  createTicket: async (owner, flightData) => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          flightData
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create ticket');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Get available flights for booking
  getAvailableFlights: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flights/available');
      if (!response.ok) throw new Error('Failed to fetch flights');
      return await response.json();
    } catch (error) {
      console.error('Error fetching available flights:', error);
      return { flights: [], count: 0 };
    }
  },

  // Book a flight
  bookFlight: async (passenger, flightId, seat) => {
    try {
      const response = await fetch('http://localhost:5000/api/flights/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passenger,
          flightId,
          seat
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to book flight');
      }
      return await response.json();
    } catch (error) {
      console.error('Error booking flight:', error);
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async (address) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${address}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { bookings: [], count: 0 };
    }
  }
};

export default marketplaceService;

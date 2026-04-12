// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Authentication Service
class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and authentication token
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        // Normalize user object for compatibility (_id and id both available)
        const normalizedUser = {
          ...data.user,
          _id: data.user.id,  // Add _id for backward compatibility
        };
        localStorage.setItem('userAccount', JSON.stringify(normalizedUser));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login. Please check your credentials.');
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.fullName - User full name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} User data and authentication token
   */
  async register(userData) {
    try {
      const { fullName, email, password, confirmPassword } = userData;

      // Client-side validation
      if (!fullName || !email || !password) {
        throw new Error('All fields are required');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        // Normalize user object for compatibility (_id and id both available)
        const normalizedUser = {
          ...data.user,
          _id: data.user.id,  // Add _id for backward compatibility
        };
        localStorage.setItem('userAccount', JSON.stringify(normalizedUser));
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register. Please try again.');
    }
  }

  /**
   * Connect user's MetaMask wallet to their account
   * @param {string} walletAddress - MetaMask wallet address
   * @returns {Promise<Object>} Updated user data
   */
  async connectMetaMaskWallet(walletAddress) {
    try {
      const token = this.getToken();
      const user = this.getAccount();

      if (!token) {
        throw new Error('User not authenticated. Please login first.');
      }

      if (!user || !user.id && !user._id) {
        throw new Error('User ID not found. Please login again.');
      }

      const userId = user._id || user.id;

      const response = await fetch(`${API_BASE_URL}/auth/connect-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          wallet_address: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect wallet');
      }

      const data = await response.json();

      // Update stored user account with new wallet info
      const updatedUser = {
        ...data.user,
        _id: data.user.id, // Ensure _id is set for compatibility
      };
      localStorage.setItem('userAccount', JSON.stringify(updatedUser));

      return data;
    } catch (error) {
      console.error('MetaMask wallet connection error:', error);
      throw new Error(error.message || 'Failed to connect MetaMask wallet');
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAccount');
  }

  /**
   * Get stored authentication token
   * @returns {string|null} Authentication token or null
   */
  getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user account
   * @returns {Object|null} User account data or null
   */
  getAccount() {
    const account = localStorage.getItem('userAccount');
    return account ? JSON.parse(account) : null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Verify email with verification code
   * @param {string} email - User email
   * @param {string} code - Verification code
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(email, code) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Email verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} email - User email
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(email, token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AuthService();

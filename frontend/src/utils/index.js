/**
 * Utility Functions
 * Add utility functions here
 */

import * as walletUtils from './walletUtils';

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

/**
 * Truncate address
 */
export const truncateAddress = (address, chars = 6) => {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

/**
 * Validate password strength
 */
export const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;
  return strength;
};

// Export wallet utilities
export * from './walletUtils';

/**
 * Wallet Utilities
 * Common utility functions for wallet operations and formatting
 */

/**
 * Format wallet address for display
 * @param {string} address - Full wallet address
 * @param {number} startChars - Characters to show from start (default: 6)
 * @param {number} endChars - Characters to show from end (default: 4)
 * @returns {string} Formatted address (0x1234...5678)
 */
export const formatWalletAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || address.length < startChars + endChars) {
    return address || '';
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Validate Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid Ethereum address
 */
export const isValidEthereumAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Convert address to checksum format
 * @param {string} address - Address to convert
 * @returns {string} Checksum address or original if invalid
 */
export const toChecksumAddress = (address) => {
  if (!isValidEthereumAddress(address)) {
    return address;
  }
  
  const hash = require('js-sha3').keccak256(address.slice(2).toLowerCase());
  let checksumAddress = '0x';
  
  for (let i = 0; i < 40; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      checksumAddress += address[i + 2].toUpperCase();
    } else {
      checksumAddress += address[i + 2];
    }
  }
  
  return checksumAddress;
};

/**
 * Copy address to clipboard
 * @param {string} address - Address to copy
 * @returns {Promise<boolean>} True if copy was successful
 */
export const copyToClipboard = async (address) => {
  try {
    await navigator.clipboard.writeText(address);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Get Etherscan URL for an address or tx on Sepolia
 * @param {string} type - Type: 'address', 'tx', or 'token'
 * @param {string} value - Address or transaction hash
 * @returns {string} Etherscan URL
 */
export const getSepoliaExplorerUrl = (type = 'address', value = '') => {
  const baseUrl = 'https://sepolia.etherscan.io';
  
  switch (type) {
    case 'tx':
    case 'transaction':
      return `${baseUrl}/tx/${value}`;
    case 'token':
      return `${baseUrl}/token/${value}`;
    case 'address':
    default:
      return `${baseUrl}/address/${value}`;
  }
};

/**
 * Format Wei to ETH
 * @param {string|number|bigint} wei - Amount in Wei
 * @param {number} decimals - Decimal places (default: 4)
 * @returns {string} Formatted ETH amount
 */
export const formatWeiToEth = (wei, decimals = 4) => {
  try {
    const ethValue = wei / 10 ** 18;
    return ethValue.toFixed(decimals);
  } catch (err) {
    console.error('Error formatting Wei to ETH:', err);
    return '0.0000';
  }
};

/**
 * Format ETH to Wei
 * @param {string|number} eth - Amount in ETH
 * @returns {string} Amount in Wei
 */
export const formatEthToWei = (eth) => {
  try {
    return (eth * 10 ** 18).toString();
  } catch (err) {
    console.error('Error formatting ETH to Wei:', err);
    return '0';
  }
};

/**
 * Check if address is the same (case-insensitive)
 * @param {string} addr1 - First address
 * @param {string} addr2 - Second address
 * @returns {boolean} True if addresses are the same
 */
export const isAddressEqual = (addr1, addr2) => {
  if (!addr1 || !addr2) return false;
  return addr1.toLowerCase() === addr2.toLowerCase();
};

/**
 * Get network display name
 * @param {number} chainId - Chain ID
 * @returns {string} Network name
 */
export const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    80001: 'Mumbai Testnet',
    42161: 'Arbitrum One',
    421614: 'Arbitrum Sepolia',
    56: 'BNB Smart Chain',
    97: 'BNB Testnet'
  };
  
  return networks[chainId] || `Unknown (${chainId})`;
};

/**
 * Check if chain ID is a testnet
 * @param {number} chainId - Chain ID
 * @returns {boolean} True if testnet
 */
export const isTestnet = (chainId) => {
  const testnets = [11155111, 80001, 421614, 97];
  return testnets.includes(chainId);
};

/**
 * Validate transaction hash
 * @param {string} hash - Transaction hash
 * @returns {boolean} True if valid format
 */
export const isValidTxHash = (hash) => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

/**
 * Get truncated transaction hash for display
 * @param {string} hash - Transaction hash
 * @param {number} chars - Characters to show from each side (default: 6)
 * @returns {string} Formatted hash
 */
export const formatTxHash = (hash, chars = 6) => {
  if (!isValidTxHash(hash)) {
    return hash;
  }
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
};

/**
 * Get human-readable transaction status
 * @param {number|null} status - Transaction receipt status (1 = success, 0 = failed, null = pending)
 * @returns {string} Status label
 */
export const getTxStatusLabel = (status) => {
  if (status === 1) return '✓ Success';
  if (status === 0) return '✗ Failed';
  return '⏳ Pending';
};

/**
 * Get color class for transaction status
 * @param {number|null} status - Transaction receipt status
 * @returns {string} Tailwind color class
 */
export const getTxStatusColor = (status) => {
  if (status === 1) return 'text-green-600';
  if (status === 0) return 'text-red-600';
  return 'text-yellow-600';
};

/**
 * Convert hex to decimal
 * @param {string} hex - Hex value
 * @returns {number} Decimal value
 */
export const hexToDecimal = (hex) => {
  try {
    return parseInt(hex, 16);
  } catch (err) {
    console.error('Error converting hex to decimal:', err);
    return 0;
  }
};

/**
 * Get human-readable gas price
 * @param {string} gasWei - Gas price in Wei
 * @returns {string} Formatted Gwei value
 */
export const formatGasPrice = (gasWei) => {
  try {
    const gwei = gasWei / 10 ** 9;
    return `${gwei.toFixed(2)} Gwei`;
  } catch (err) {
    console.error('Error formatting gas price:', err);
    return '0.00 Gwei';
  }
};

export default {
  formatWalletAddress,
  isValidEthereumAddress,
  toChecksumAddress,
  copyToClipboard,
  getSepoliaExplorerUrl,
  formatWeiToEth,
  formatEthToWei,
  isAddressEqual,
  getNetworkName,
  isTestnet,
  isValidTxHash,
  formatTxHash,
  getTxStatusLabel,
  getTxStatusColor,
  hexToDecimal,
  formatGasPrice
};

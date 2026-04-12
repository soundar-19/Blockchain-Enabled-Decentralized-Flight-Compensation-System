/**
 * Real Balance Service - SIMPLIFIED
 * Fetches ONLY ETH balance from Infura RPC with detailed logging
 */

import { ethers } from 'ethers';
import priceService from './priceService';

const INFURA_RPC = 'https://sepolia.infura.io/v3/a75bc1be3bb44560b0b7c4abc3986efa';

class RealBalanceService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(INFURA_RPC);
    console.log('✅ RealBalanceService: Infura provider ready');
  }

  /**
   * Get real ETH balance
   */
  async getRealBalance(address) {
    try {
      console.log('================================');
      console.log('🔍 getRealBalance called');
      console.log('Address:', address);

      // STEP 1: VALIDATE
      if (!address || address === '' || address === 'N/A') {
        console.warn('⚠️ No address provided');
        return { eth: '0', usd: '$0.00', error: 'No address' };
      }

      console.log('✅ Address exists');

      // STEP 2: CHECK FORMAT
      const isValid = ethers.isAddress(address);
      console.log('✅ Address valid?', isValid);

      if (!isValid) {
        console.warn('⚠️ Invalid address format');
        return { eth: '0', usd: '$0.00', error: 'Invalid format' };
      }

      // STEP 3: FETCH
      console.log('⏳ Fetching from Infura...');
      const balanceWei = await this.provider.getBalance(address);
      
      console.log('✅ Got balance (Wei):', balanceWei.toString());

      // STEP 4: CONVERT
      const ethString = ethers.formatEther(balanceWei);
      const ethFloat = parseFloat(ethString);
      const eth = ethFloat.toFixed(6);
      
      console.log('✅ Converted to ETH:', eth);

      // STEP 5: USD CONVERSION
      const usd = priceService.convertETHToUSD(eth);
      
      console.log('✅ USD Value:', usd);
      console.log('================================');

      return {
        eth: eth,
        usd: `$${usd}`,
        display: `${eth} ETH ($${usd})`,
        displayShort: `${eth} ⛽ | $${usd}`
      };

    } catch (error) {
      console.error('❌ getRealBalance FAILED');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.log('================================');
      return {
        eth: '0',
        usd: '$0.00',
        error: error.message
      };
    }
  }

  /**
   * Get wallet info
   */
  async getWalletInfo(address) {
    try {
      console.log('📊 getWalletInfo called for:', address);
      
      const balance = await this.getRealBalance(address);

      return {
        address: address,
        eth: balance.eth,
        usd: balance.usd,
        display: balance.display,
        displayShort: balance.displayShort,
        error: balance.error
      };
    } catch (error) {
      console.error('❌ getWalletInfo Error:', error);
      return {
        address: address,
        eth: '0',
        usd: '$0.00',
        error: error.message
      };
    }
  }

  /**
   * Check sufficient balance
   */
  async hasSufficientBalance(address, amount) {
    try {
      const balance = await this.getRealBalance(address);
      const has = parseFloat(balance.eth) >= parseFloat(amount);
      console.log(`💰 Has ${amount} ETH? ${has} (balance: ${balance.eth})`);
      return has;
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  }
}

export default new RealBalanceService();

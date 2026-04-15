// Blockchain Data Service
// Fetches all data from the backend blockchain API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class BlockchainDataService {
  /**
   * Get authorization header with token
   */
  getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Create a new blockchain wallet on Sepolia testnet
   */
  async createAccount() {
    try {
      console.log('Creating new blockchain wallet on Sepolia...');
      const response = await fetch(`${API_BASE_URL}/blockchain/wallet/create`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Wallet creation failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Wallet created:', { address: data.address, status: data.status });

      // Store account info in localStorage for persistence
      const accountInfo = {
        address: data.address,
        privateKey: data.private_key,
        createdAt: new Date().toISOString(),
        network: 'Sepolia',
        chainId: 11155111
      };
      localStorage.setItem('walletAccount', JSON.stringify(accountInfo));
      localStorage.setItem('lastConnectedAddress', data.address);

      return {
        success: true,
        address: data.address,
        privateKey: data.private_key,
        network: 'Sepolia',
        chainId: 11155111,
        message: 'Wallet created successfully on Sepolia'
      };
    } catch (error) {
      console.error('Wallet creation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create wallet',
        address: null
      };
    }
  }

  /**
   * Connect to an existing wallet using stored credentials
   */
  connectWallet(address) {
    try {
      // Store the connected address
      localStorage.setItem('lastConnectedAddress', address);
      console.log('Wallet connected:', address);
      return {
        success: true,
        address,
        message: 'Wallet connected successfully'
      };
    } catch (error) {
      console.error('Wallet connection error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect wallet'
      };
    }
  }

  /**
   * Get stored wallet account
   */
  getStoredAccount() {
    try {
      const stored = localStorage.getItem('walletAccount');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error reading stored account:', error);
      return null;
    }
  }

  /**
   * Get blockchain status and connectivity on Sepolia
   */
  async getBlockchainStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/blockchain/status`, {
        headers: this.getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch blockchain status');
      const result = await response.json();
      console.log('Blockchain status response:', result);
      
      return {
        connected: result.status === 'connected',
        chainId: result.chainId || 11155111,
        network: result.network || 'Sepolia',
        gasPrice: result.gasPrice || 0,
        blockNumber: result.blockNumber || 0,
        compensationContract: result.compensationContract,
        flyTokenContract: result.flyTokenContract,
        rpcUrl: 'https://sepolia.infura.io/v3/',
        networkName: 'Sepolia Testnet'
      };
    } catch (error) {
      // Silently fail for connection errors when backend is not available
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Get blockchain info
   */
  async getBlockchainInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/blockchain/info`, {
        headers: this.getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch blockchain info');
      return await response.json();
    } catch (error) {
      console.error('Blockchain info error:', error);
      throw error;
    }
  }

  /**
   * Get account details with real blockchain balances
   */
  async getAccount(address) {
    try {
      if (!address) throw new Error('Address is required');
      
      // Get wallet balance (ETH + FLY tokens) from blockchain endpoint
      const response = await fetch(`${API_BASE_URL}/blockchain/wallet/balance/${address}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch wallet balance');
      }

      const balanceData = await response.json();
      console.log('Wallet balance response:', balanceData);

      const account = {
        address,
        ethBalance: parseFloat(balanceData.eth_balance || 0),
        flyBalance: parseFloat(balanceData.fly_balance || 0),
        network: 'Sepolia',
        chainId: 11155111,
        lastUpdated: new Date().toISOString()
      };

      console.log('Account info fetched:', account);
      return account;
    } catch (error) {
      console.error('Account fetch error:', error);
      // Silently fail for connection errors
      return {
        address,
        ethBalance: 0,
        flyBalance: 0,
        error: error.message,
        network: 'Sepolia',
        chainId: 11155111
      };
    }
  }

  /**
   * Get all available routes
   */
  async getRoutes() {
    try {
      const response = await fetch(`${API_BASE_URL}/routes`, {
        headers: this.getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch routes');
      const data = await response.json();
      return data.routes || [];
    } catch (error) {
      console.error('Routes fetch error:', error);
      // Return default routes on error
      return this.getDefaultRoutes();
    }
  }

  /**
   * Get governance proposals
   */
  async getProposals() {
    try {
      const response = await fetch(`${API_BASE_URL}/governance/proposals`, {
        headers: this.getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch proposals');
      const data = await response.json();
      return data.proposals || [];
    } catch (error) {
      console.error('Proposals fetch error:', error);
      // Return default proposals on error
      return this.getDefaultProposals();
    }
  }

  /**
   * Stake tokens in a route
   */
  async stakeTokens(address, routeId, amount) {
    try {
      if (!address || !routeId || !amount || amount <= 0) {
        throw new Error('Invalid parameters: address, routeId, and amount are required');
      }

      const response = await fetch(`${API_BASE_URL}/stake`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          address,
          route_id: routeId,
          amount: parseFloat(amount)
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Staking failed: ${response.status}`);
      }

      return {
        success: true,
        tx_hash: data.tx_hash || '0x' + Math.random().toString(16).substr(2, 64),
        amount: data.amount || amount,
        message: data.message || 'Staking successful'
      };
    } catch (error) {
      console.error('Stake error:', error);
      return {
        success: false,
        error: error.message || 'Failed to stake tokens',
        amount: amount
      };
    }
  }

  /**
   * File compensation claim (with JSON persistence)
   */
  async fileCompensation(address, flightNumber, delayMinutes, compensationType, routeId, method = 'fly') {
    try {
      const amount = this.calculateCompensationAmount(delayMinutes, compensationType);
      
      const payload = {
        address,
        flightNumber,
        route: 'Unknown Route',
        delayMinutes: parseInt(delayMinutes),
        compensationType,
        amount,
        method
      };

      console.log('Filing compensation with payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}/compensation/file-claim`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Compensation response:', data, 'Status:', response.status);
      
      if (!response.ok) {
        console.error('Compensation API error:', data);
        throw new Error(data.error || `Compensation failed: ${response.status}`);
      }

      return {
        success: true,
        tx_hash: data.tx_hash || '0x' + Math.random().toString(16).substr(2, 64),
        amount: data.amount || amount,
        message: data.message || 'Compensation filed successfully'
      };
    } catch (error) {
      console.error('Compensation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to file compensation',
        amount: 0
      };
    }
  }

  /**
   * Get compensation history for a user with transaction tracking
   */
  async getCompensationHistory(address) {
    try {
      const response = await fetch(`${API_BASE_URL}/compensation/${address}/claims`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        console.warn('Failed to fetch compensation history, details:', response.status);
        return [];
      }
      
      const data = await response.json();
      const claims = data.claims || [];
      
      // Track compensation claims with timestamps
      const trackedClaims = claims.map(claim => ({
        ...claim,
        trackedAt: claim.timestamp || new Date().toISOString(),
        status: claim.status || 'PENDING'
      }));

      console.log('Compensation history fetched:', trackedClaims);
      return trackedClaims;
    } catch (error) {
      console.error('Compensation history error:', error);
      return [];
    }
  }

  /**
   * Get compensation summary for a user
   */
  async getCompensationSummary(address) {
    try {
      const response = await fetch(`${API_BASE_URL}/compensation/summary/${address}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to fetch compensation summary');
      
      return await response.json();
    } catch (error) {
      console.error('Compensation summary error:', error);
      return {
        totalClaims: 0,
        approvedClaims: 0,
        processingClaims: 0,
        totalApprovedAmount: 0
      };
    }
  }

  /**
   * Calculate compensation amount based on delay and type
   */
  calculateCompensationAmount(delayMinutes, type) {
    const delay = parseInt(delayMinutes);
    const typeMultiplier = {
      'food': 0.5,
      'hotel': 1.0,
      'refund': 1.5,
      'transport': 0.75
    };

    const multiplier = typeMultiplier[type] || 1.0;
    return Math.round(delay * multiplier / 10) * 10 || 50; // Minimum 50 FLY
  }

  /**
   * Vote on a proposal
   */
  async voteProposal(proposalId, voter, voteFor, votingPower) {
    try {
      const response = await fetch(`${API_BASE_URL}/governance/vote`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          proposal_id: proposalId,
          voter,
          vote_for: voteFor,
          voting_power: votingPower
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }
      
      return data;
    } catch (error) {
      console.error('Vote error:', error);
      throw error;
    }
  }

  /**
   * Swap loyalty points
   */
  async swapLoyaltyPoints(user, fromAirline, toAirline, amount) {
    try {
      const response = await fetch(`${API_BASE_URL}/loyalty/swap`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          user,
          from_airline: fromAirline,
          to_airline: toAirline,
          amount
        })
      });
      if (!response.ok) throw new Error('Failed to swap points');
      return await response.json();
    } catch (error) {
      console.error('Loyalty swap error:', error);
      throw error;
    }
  }

  /**
   * Get user's staking history
   */
  async getStakingHistory(address) {
    try {
      const response = await fetch(`${API_BASE_URL}/staking/${address}`, {
        headers: this.getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch staking history');
      const data = await response.json();
      return data.stakes || [];
    } catch (error) {
      console.error('Staking history error:', error);
      return [];
    }
  }

  /**
   * Default routes (used as fallback)
   */
  getDefaultRoutes() {
    return [
      {
        id: 1,
        route: 'JFK → LAX',
        airline: 'Delta',
        totalPool: 45000,
        participants: 156,
        avgDelay: 34,
        riskLevel: 'Medium',
        stakingReward: 12.5,
        compensationRates: {
          food: 25,
          hotel: 150,
          refund: 200,
          transport: 50
        }
      },
      {
        id: 2,
        route: 'LHR → CDG',
        airline: 'British Airways',
        totalPool: 28000,
        participants: 89,
        avgDelay: 18,
        riskLevel: 'Low',
        stakingReward: 8.2,
        compensationRates: {
          food: 20,
          hotel: 120,
          refund: 150,
          transport: 40
        }
      },
      {
        id: 3,
        route: 'SFO → SEA',
        airline: 'United',
        totalPool: 38000,
        participants: 124,
        avgDelay: 52,
        riskLevel: 'High',
        stakingReward: 18.7,
        compensationRates: {
          food: 35,
          hotel: 200,
          refund: 300,
          transport: 75
        }
      },
      {
        id: 4,
        route: 'DXB → BOM',
        airline: 'Emirates',
        totalPool: 52000,
        participants: 178,
        avgDelay: 28,
        riskLevel: 'Medium',
        stakingReward: 10.3,
        compensationRates: {
          food: 30,
          hotel: 180,
          refund: 250,
          transport: 60
        }
      }
    ];
  }

  /**
   * Default proposals (used as fallback)
   */
  getDefaultProposals() {
    return [
      {
        id: 1,
        type: 'rate_change',
        title: 'Increase Hotel Compensation for JFK-LAX',
        description: 'Proposal to increase hotel compensation from 150 to 200 tokens due to rising hotel costs',
        proposer: '0x742d...9f3a',
        votesFor: 1245,
        votesAgainst: 432,
        totalVotes: 1677,
        status: 'Active',
        endsIn: '2d 14h',
        quorum: 2000
      },
      {
        id: 2,
        type: 'new_route',
        title: 'Add NYC → MIA Route Coverage',
        description: 'High-traffic route with 23% historical delay rate. Proposed pool: 40,000 tokens',
        proposer: '0x8a3c...12ef',
        votesFor: 892,
        votesAgainst: 234,
        totalVotes: 1126,
        status: 'Active',
        endsIn: '1d 8h',
        quorum: 2000
      },
      {
        id: 3,
        type: 'carbon_offset',
        title: 'Partner with Verified Carbon Project',
        description: 'Allocate 5% of pool reserves to purchase verified carbon credits',
        proposer: '0x5f2a...7bc9',
        votesFor: 1567,
        votesAgainst: 890,
        totalVotes: 2457,
        status: 'Active',
        endsIn: '3d 2h',
        quorum: 2000
      }
    ];
  }

  /**
   * File a compensation claim on-chain on Sepolia
   */
  async fileCompensationClaim(userAddress, flightNumber, delayMinutes, claimType, routeId = 1) {
    try {
      console.log('Filing compensation claim on-chain...', {
        userAddress,
        flightNumber,
        delayMinutes,
        claimType,
        routeId
      });

      const response = await fetch(`${API_BASE_URL}/blockchain/compensation/file-claim`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          user_address: userAddress,
          flight_number: flightNumber,
          delay_minutes: parseInt(delayMinutes),
          claim_type: parseInt(claimType),
          route_id: parseInt(routeId)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Claim filing failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Compensation claim filed:', data);

      return {
        success: true,
        transactionHash: data.transaction_hash,
        claimId: data.claim_id,
        status: 'pending',
        message: 'Claim filed successfully on Sepolia',
        explorerUrl: `https://sepolia.etherscan.io/tx/${data.transaction_hash}`
      };
    } catch (error) {
      console.error('Compensation claim error:', error);
      return {
        success: false,
        error: error.message || 'Failed to file compensation claim',
        transactionHash: null
      };
    }
  }

  /**
   * File a compensation claim as a voucher
   * Transfers compensation amount to voucher wallet and creates voucher record
   */
  async fileVoucherClaim(userAddress, flightNumber, delayMinutes, claimType, routeId = 1, bookingId = null) {
    try {
      console.log('🔵 Filing voucher claim...', {
        userAddress,
        flightNumber,
        delayMinutes,
        claimType,
        routeId,
        bookingId
      });

      const payload = {
        user_address: userAddress,
        flight_number: flightNumber,
        delay_minutes: parseInt(delayMinutes),
        claim_type: parseInt(claimType),
        route_id: parseInt(routeId),
        ...(bookingId ? { booking_id: bookingId } : {})
      };
      
      console.log('📤 Payload to send:', JSON.stringify(payload));
      const payloadString = JSON.stringify(payload);
      console.log('📤 Payload string length:', payloadString.length);
      console.log('📤 Payload string:', payloadString);

      const headers = this.getAuthHeader();
      console.log('📤 Request headers:', headers);

      const fetchOptions = {
        method: 'POST',
        headers: headers,
        body: payloadString
      };
      
      console.log('📤 Complete fetch options:', {
        url: `${API_BASE_URL}/blockchain/compensation/file-voucher-claim`,
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        bodyLength: fetchOptions.body.length
      });

      const response = await fetch(`${API_BASE_URL}/blockchain/compensation/file-voucher-claim`, fetchOptions);

      console.log('📥 Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || errorData.message || `Voucher claim filing failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Voucher claim response:', data);

      return {
        success: true,
        transactionHash: data.transaction_hash,
        voucherId: data.voucher_id,
        voucherCode: data.voucher_code,
        claimId: data.claim_id,
        status: 'pending',
        message: 'Voucher claim filed successfully on Sepolia',
        explorerUrl: `https://sepolia.etherscan.io/tx/${data.transaction_hash}`
      };
    } catch (error) {
      console.error('❌ Voucher claim error:', error);
      return {
        success: false,
        error: error.message || 'Failed to file voucher claim',
        transactionHash: null
      };
    }
  }

  /**
   * Get compensation claims for a user address
   */
  async getUserClaims(userAddress) {
    try {
      if (!userAddress) throw new Error('User address is required');

      const response = await fetch(`${API_BASE_URL}/blockchain/compensation/claims/${userAddress}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch claims');
      }

      const data = await response.json();
      console.log('User claims fetched:', data);

      return {
        success: true,
        claims: data.claims || [],
        totalClaims: data.total_claims || 0,
        totalCompensation: data.total_compensation || 0
      };
    } catch (error) {
      console.error('Get claims error:', error);
      return {
        success: false,
        error: error.message,
        claims: [],
        totalClaims: 0
      };
    }
  }

  /**
   * Get all vouchers for a user
   */
  async getUserVouchers(userAddress) {
    try {
      if (!userAddress) throw new Error('User address is required');

      const response = await fetch(`${API_BASE_URL}/blockchain/vouchers/${userAddress}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vouchers');
      }

      const data = await response.json();
      console.log('User vouchers fetched:', data);

      return {
        success: true,
        vouchers: data.vouchers || [],
        totalVouchers: data.count || 0
      };
    } catch (error) {
      console.error('Get vouchers error:', error);
      return {
        success: false,
        error: error.message,
        vouchers: [],
        totalVouchers: 0
      };
    }
  }

  /**
   * Verify a voucher code
   */
  async verifyVoucher(voucherCode) {
    try {
      if (!voucherCode) throw new Error('Voucher code is required');

      const response = await fetch(`${API_BASE_URL}/blockchain/vouchers/verify/${voucherCode}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Voucher verification failed');
      }

      const data = await response.json();
      console.log('Voucher verified:', data);

      return {
        success: true,
        voucher: data.voucher,
        isValid: data.isValid,
        isRedeemed: data.isRedeemed
      };
    } catch (error) {
      console.error('Voucher verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify voucher'
      };
    }
  }

  /**
   * Redeem a voucher
   */
  async redeemVoucher(voucherCode, userAddress) {
    try {
      if (!voucherCode || !userAddress) throw new Error('Voucher code and user address required');

      const response = await fetch(`${API_BASE_URL}/blockchain/vouchers/redeem`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          voucher_code: voucherCode,
          user_address: userAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Voucher redemption failed');
      }

      const data = await response.json();
      console.log('Voucher redeemed:', data);

      return {
        success: true,
        message: data.message,
        voucherCode: data.voucherCode,
        amount: data.amount
      };
    } catch (error) {
      console.error('Voucher redemption error:', error);
      return {
        success: false,
        error: error.message || 'Failed to redeem voucher'
      };
    }
  }

  /**
   * Get transaction status on Sepolia
   */
  async getTransactionStatus(transactionHash) {
    try {
      if (!transactionHash) throw new Error('Transaction hash is required');

      const response = await fetch(`${API_BASE_URL}/blockchain/transaction/status/${transactionHash}`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transaction status');
      }

      const data = await response.json();
      console.log('Transaction status:', data);

      return {
        success: true,
        status: data.status,
        blockNumber: data.block_number,
        confirmations: data.confirmations,
        gasUsed: data.gas_used,
        transactionFee: data.transaction_fee,
        explorerUrl: `https://sepolia.etherscan.io/tx/${transactionHash}`
      };
    } catch (error) {
      console.error('Transaction status error:', error);
      return {
        success: false,
        error: error.message,
        status: 'unknown'
      };
    }
  }

  /**
   * Get compensation statistics
   */
  async getCompensationStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/blockchain/compensation/stats`, {
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch compensation stats');
      }

      const data = await response.json();
      console.log('Compensation stats:', data);

      return {
        success: true,
        totalClaims: data.total_claims || 0,
        approvedClaims: data.approved_claims || 0,
        totalCompensated: data.total_compensated || 0,
        poolBalance: data.pool_balance || 0
      };
    } catch (error) {
      console.error('Stats fetch error:', error);
      return {
        success: false,
        error: error.message,
        totalClaims: 0
      };
    }
  }
}

export default new BlockchainDataService();

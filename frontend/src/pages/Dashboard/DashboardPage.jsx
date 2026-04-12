import React from 'react';
import { Shield, Plane, Users, TrendingUp, Clock, CheckCircle, Coins, Globe, FileText, ArrowRight, MapPin, RefreshCw } from 'lucide-react';
import './DashboardPage.css';

const DashboardPage = ({ account, wallet, balance, stakedTokens, compensations, routes, onNavigate }) => {
  return (
    <div className="dashboard-container">
      {/* Blockchain Wallet Connection */}
      <section className="dashboard-section">
        <div className="section-card">
          <h2 className="section-title">Blockchain Wallet</h2>
          {wallet ? (
            <div className="wallet-info">
              <p className="wallet-status">✓ Connected</p>
              <p className="wallet-address">{wallet.address.substring(0, 6)}...{wallet.address.substring(38)}</p>
            </div>
          ) : (
            <p className="wallet-warning">⚠️ Create or connect a wallet to get started</p>
          )}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="dashboard-section">
        <div className="metrics-grid">
          <div className="metric-card metric-blue">
            <div className="metric-header">
              <div>
                <p className="metric-label">Total Pool Value</p>
                <p className="metric-value">${routes.reduce((sum, r) => sum + r.totalPool, 0).toLocaleString()}</p>
                <p className="metric-info">💰 Protecting {routes.length} routes</p>
              </div>
              <Shield className="metric-icon" />
            </div>
          </div>

          <div className="metric-card metric-green">
            <div className="metric-header">
              <div>
                <p className="metric-label">Active Users</p>
                <p className="metric-value">{routes.reduce((sum, r) => sum + r.participants, 0)}</p>
                <p className="metric-info">👥 Growing community</p>
              </div>
              <Users className="metric-icon" />
            </div>
          </div>

          <div className="metric-card metric-purple">
            <div className="metric-header">
              <div>
                <p className="metric-label">Claims Processed</p>
                <p className="metric-value">{compensations.filter(c => c.status === 'Approved').length}</p>
                <p className="metric-info">✅ Instant payouts</p>
              </div>
              <CheckCircle className="metric-icon" />
            </div>
          </div>

          <div className="metric-card metric-yellow">
            <div className="metric-header">
              <div>
                <p className="metric-label">Total Compensated</p>
                <p className="metric-value">${compensations.filter(c => c.status === 'Approved').reduce((sum, c) => sum + c.amount, 0)}</p>
                <p className="metric-info">💵 Returned to users</p>
              </div>
              <Coins className="metric-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* Your Account Summary */}
      <section className="dashboard-section">
        <div className="account-summary-grid">
          <div className="wide-card account-card">
            <h3 className="card-title">
              <Users className="title-icon" />
              Your Account & Wallet Balance
            </h3>
            <div className="account-stats-grid">
              <div className="stat-item stat-blue">
                <p className="stat-label">ETH Balance</p>
                <p className="stat-value" style={{fontSize: '1.5rem'}}>{balance.toFixed(4)} ETH</p>
                <p className="stat-info">⛽ On Sepolia testnet</p>
              </div>
              <div className="stat-item stat-purple">
                <p className="stat-label">USD Value</p>
                <p className="stat-value">${(balance * 1800).toFixed(2)}</p>
                <p className="stat-info">📊 Current ETH value</p>
              </div>
              <div className="stat-item stat-gray">
                <p className="stat-label">Staked Tokens</p>
                <p className="stat-value">{stakedTokens.toLocaleString()}</p>
                <p className="stat-info">🎯 Earning rewards</p>
              </div>
              <div className="stat-item stat-gray">
                <p className="stat-label">Total Claims</p>
                <p className="stat-value">{compensations.length}</p>
                <p className="stat-info">📋 Filed on blockchain</p>
              </div>
              <div className="stat-item stat-gray">
                <p className="stat-label">Wallet Connected</p>
                <p className="stat-value">{wallet ? '✓ Yes' : '✗ No'}</p>
                <p className="stat-info">{wallet ? `${wallet.address.substring(0, 6)}...${wallet.address.substring(38)}` : 'Create above'}</p>
              </div>
              <div className="stat-item stat-green">
                <p className="stat-label">Total Received</p>
                <p className="stat-value">{(compensations.reduce((sum, c) => sum + (c.amount || 0), 0)).toLocaleString()} ETH</p>
                <p className="stat-info">💰 From approved claims</p>
              </div>
            </div>
          </div>

          <div className="quick-actions-card">
            <h3 className="card-title">
              <Plane className="title-icon" />
              Quick Actions
            </h3>
            <div className="actions-list">
              <button className="action-button btn-stake" onClick={() => onNavigate('stake')}>
                <Coins className="btn-icon" />
                Stake on Routes
              </button>
              <button className="action-button btn-compensate" onClick={() => onNavigate('compensate')}>
                <FileText className="btn-icon" />
                File a Claim
              </button>
              <button className="action-button btn-vote" onClick={() => onNavigate('governance')}>
                <TrendingUp className="btn-icon" />
                Vote on Proposals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="dashboard-section">
        <div className="activity-card">
          <h3 className="card-title">
            <Clock className="title-icon" />
            Recent Activity
          </h3>
          {compensations.length > 0 ? (
            <div className="activity-list">
              {compensations.slice(0, 5).map((comp, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-icon">
                    <CheckCircle className="icon-check" />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">Claim Approved</p>
                    <p className="activity-detail">{comp.flightNumber} - {comp.compensationType}</p>
                  </div>
                  <div className="activity-amount">
                    <p className="amount-value">+${comp.amount}</p>
                    <p className="amount-time">Just now</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Plane className="empty-icon" />
              <p>No activity yet. File a claim to get started!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="dashboard-section">
        <div className="how-it-works">
          <h2 className="section-title">How SkyGuard DAO Works</h2>
          <div className="steps-grid">
            {[
              { num: 1, title: 'Stake ETH', desc: 'Join route-specific pools by staking ETH for protection' },
              { num: 2, title: 'Report Delays', desc: 'File claims for flight delays and get compensated' },
              { num: 3, title: 'Earn Rewards', desc: 'Receive staking rewards when flights are on time' },
              { num: 4, title: 'Govern', desc: 'Vote on protocol changes and route parameters' }
            ].map(step => (
              <div key={step.num} className="step-card">
                <div className="step-number">{step.num}</div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Routes */}
      <section className="dashboard-section">
        <div className="routes-card">
          <h3 className="card-title">
            <MapPin className="title-icon" />
            Available Routes
          </h3>
          <div className="routes-grid">
            {routes.slice(0, 4).map((route) => (
              <div key={route.id} className="route-item">
                <div className="route-header">
                  <Plane className="route-icon" />
                  <span className="route-title">{route.route}</span>
                </div>
                <div className="route-info">
                  <p>💰 Pool: ${route.totalPool.toLocaleString()} | 👥 {route.participants} participants</p>
                  <p>📊 Avg Delay: {route.avgDelay}m | ⚠️ Risk: {route.riskLevel}</p>
                  <p>💎 Reward: {route.stakingReward}% APY</p>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => onNavigate('stake')}>
            <ArrowRight className="btn-icon" />
            View All Routes
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

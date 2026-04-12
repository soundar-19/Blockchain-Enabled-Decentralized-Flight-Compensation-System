import React, { useState } from 'react';
import { FileText, DollarSign, Coffee, Hotel, MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import blockchainService from '../../services/blockchainDataService';
import './CompensatePage.css';

const CompensatePage = ({ account, compensations, routes, onFileCompensation }) => {
  const [compensationForm, setCompensationForm] = useState({
    flightNumber: '',
    delayMinutes: '',
    compensationType: 'hotel',
    claimMethod: 'direct' // 'direct' or 'voucher'
  });

  const [filing, setFiling] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileCompensation = async () => {
    if (!account || !account.address) {
      setMessage({ type: 'error', text: '⚠️ Please create or connect a wallet first' });
      return;
    }

    if (!compensationForm.flightNumber || !compensationForm.delayMinutes) {
      setMessage({ type: 'error', text: '⚠️ Please fill in all required fields' });
      return;
    }

    setFiling(true);
    setMessage(null);

    try {
      // Map compensation type to numeric ID (0=food, 1=hotel, 2=transport, 3=refund)
      const compensationTypeMap = {
        'food': 0,
        'hotel': 1,
        'transport': 2,
        'refund': 3
      };

      const claimType = compensationTypeMap[compensationForm.compensationType] || 1;

      // Log the claim method for debugging
      console.log('🎯 CLAIM HANDLER CALLED');
      console.log('   Claim Method:', compensationForm.claimMethod);
      console.log('   Is Voucher?:', compensationForm.claimMethod === 'voucher');
      console.log('   Form State:', compensationForm);

      // File claim on blockchain via backend
      let result;
      
      if (compensationForm.claimMethod === 'voucher') {
        console.log('✅ CALLING VOUCHER CLAIM METHOD');
        // File as voucher claim
        result = await blockchainService.fileVoucherClaim(
          account.address,
          compensationForm.flightNumber,
          compensationForm.delayMinutes,
          claimType,
          1 // route_id
        );
        
        if (result.success) {
          setMessage({
            type: 'success',
            text: `✅ Voucher claim filed successfully!\nVoucher Code: ${result.voucherCode}\nTransaction: ${result.transactionHash.substring(0, 10)}...\nCheck on Etherscan: ${result.explorerUrl}`
          });
        } else {
          setMessage({ type: 'error', text: `❌ Failed to file voucher claim: ${result.error}` });
        }
      } else {
        console.log('⚠️ CALLING DIRECT ETH CLAIM METHOD (not voucher)');
        // File as direct ETH claim
        result = await blockchainService.fileCompensationClaim(
          account.address,
          compensationForm.flightNumber,
          compensationForm.delayMinutes,
          claimType,
          1 // route_id
        );
        
        if (result.success) {
          setMessage({
            type: 'success',
            text: `✅ Claim filed successfully!\nTransaction: ${result.transactionHash.substring(0, 10)}...\nCheck on Etherscan: ${result.explorerUrl}`
          });
        } else {
          setMessage({ type: 'error', text: `❌ Failed to file claim: ${result.error}` });
        }
      }

      if (result.success) {
        // Reset form
        setCompensationForm({
          flightNumber: '',
          delayMinutes: '',
          compensationType: 'hotel',
          claimMethod: 'direct'
        });

        // Call parent callback if provided
        if (onFileCompensation) {
          onFileCompensation(
            compensationForm.flightNumber,
            compensationForm.delayMinutes,
            compensationForm.compensationType
          );
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` });
    } finally {
      setFiling(false);
    }
  };

  return (
    <div className="compensate-container">
      {/* Network Status */}
      <section className="compensate-section">
        <div className="method-selector">
          <h2 className="section-title-lg">Compensation on Sepolia 🚀</h2>
          <p className="section-subtitle">Connected to Ethereum Sepolia Testnet with real smart contracts</p>
          
          {account?.address && (
            <div style={{
              backgroundColor: '#e8f5e9',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '12px',
              border: '2px solid #4caf50'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle size={20} style={{ color: '#4caf50' }} />
                <strong>Wallet Connected</strong>
              </div>
              <p style={{ margin: 0, color: '#555', fontSize: '14px' }}>
                Address: <code style={{ color: '#333' }}>{account.address.substring(0, 6)}...{account.address.substring(38)}</code>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Compensation Method Selector */}
      <section className="compensate-section">

      {/* Message Display */}
      {message && (
        <section className="compensate-section">
          <div style={{
            backgroundColor: message.type === 'error' ? '#ffebee' : '#e8f5e9',
            padding: '16px',
            borderRadius: '8px',
            border: `2px solid ${message.type === 'error' ? '#f44336' : '#4caf50'}`,
            display: 'flex',
            gap: '12px'
          }}>
            {message.type === 'error' ? (
              <AlertCircle size={24} style={{ color: '#f44336', flexShrink: 0 }} />
            ) : (
              <CheckCircle size={24} style={{ color: '#4caf50', flexShrink: 0 }} />
            )}
            <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>
              {message.text}
            </div>
          </div>
        </section>
      )}

      {/* Compensation Form */}
      <section className="compensate-section">
        <div className="form-card">
          <h2 className="section-title-md">
            <FileText className="title-icon" />
            File Compensation Claim on Blockchain
          </h2>

          {/* Claim Method Selector */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ddd'
          }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
              How would you like to receive compensation?
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="claimMethod"
                  value="direct"
                  checked={compensationForm.claimMethod === 'direct'}
                  onChange={(e) => setCompensationForm({...compensationForm, claimMethod: e.target.value})}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>
                  <strong>Direct ETH Transfer</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Receive ETH directly to your wallet
                  </div>
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="claimMethod"
                  value="voucher"
                  checked={compensationForm.claimMethod === 'voucher'}
                  onChange={(e) => setCompensationForm({...compensationForm, claimMethod: e.target.value})}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>
                  <strong>As Voucher</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Get a voucher code for later redemption
                  </div>
                </span>
              </label>
            </div>
          </div>

          <div className="form-grid">
            <input
              type="text"
              placeholder="Flight Number (e.g., AA1234)"
              value={compensationForm.flightNumber}
              onChange={(e) => setCompensationForm({...compensationForm, flightNumber: e.target.value})}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Delay Duration (minutes)"
              value={compensationForm.delayMinutes}
              onChange={(e) => setCompensationForm({...compensationForm, delayMinutes: parseInt(e.target.value) || ''})}
              className="form-input"
            />
            <select 
              value={compensationForm.compensationType}
              onChange={(e) => setCompensationForm({...compensationForm, compensationType: e.target.value})}
              className="form-select form-full"
            >
              <option value="">Select Compensation Type</option>
              <option value="food">Food Voucher (1)</option>
              <option value="hotel">Hotel Accommodation (2)</option>
              <option value="refund">Ticket Refund (3)</option>
              <option value="transport">Ground Transport (4)</option>
            </select>
          </div>

          <div className="buttons-grid">
            <button 
              className="btn btn-primary" 
              onClick={handleFileCompensation}
              disabled={filing || !account?.address}
              style={{ 
                opacity: filing || !account?.address ? 0.6 : 1,
                pointerEvents: filing ? 'none' : 'auto'
              }}
            >
              {filing ? (
                <>
                  <Loader className="btn-icon" style={{ animation: 'spin 1s linear infinite' }} />
                  Filing Claim...
                </>
              ) : (
                <>
                  <FileText className="btn-icon" />
                  File Claim on Blockchain
                </>
              )}
            </button>
          </div>

          {!account?.address && (
            <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '12px' }}>
              ⚠️ Connect a wallet first to file claims
            </div>
          )}
        </div>
      </section>

      {/* Compensation Form - Old */}
      <section className="compensate-section" style={{ display: 'none' }}>
        <div className="form-card">
          <h2 className="section-title-md">
            <FileText className="title-icon" />
            File Compensation Claim
          </h2>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Flight Number (e.g., AA1234)"
              value={compensationForm.flightNumber}
              onChange={(e) => setCompensationForm({...compensationForm, flightNumber: e.target.value})}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Delay Duration (minutes)"
              value={compensationForm.delayMinutes}
              onChange={(e) => setCompensationForm({...compensationForm, delayMinutes: parseInt(e.target.value) || ''})}
              className="form-input"
            />
            <select 
              value={compensationForm.compensationType}
              onChange={(e) => setCompensationForm({...compensationForm, compensationType: e.target.value})}
              className="form-select form-full"
            >
              <option value="">Select Compensation Type</option>
              <option value="food">Food Voucher</option>
              <option value="hotel">Hotel Accommodation</option>
              <option value="refund">Ticket Refund</option>
              <option value="transport">Ground Transport</option>
            </select>
          </div>

          <div className="buttons-grid">
            <button 
              className="btn btn-primary" 
              onClick={handleFileCompensation}
              disabled={filing || !account?.address}
              style={{ opacity: filing || !account?.address ? 0.6 : 1 }}
            >
              {filing ? (
                <>
                  <Loader className="btn-icon" style={{ animation: 'spin 1s linear infinite' }} />
                  Filing Claim...
                </>
              ) : (
                <>
                  <FileText className="btn-icon" />
                  File Claim on Blockchain
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Compensation History */}
      <section className="compensate-section">
        <div className="history-card">
          <h3 className="section-title-md">Your Compensation History</h3>
          <p className="total-claims">Total Claims: {compensations.length}</p>
          
          {compensations.length === 0 ? (
            <div className="empty-state">
              <p>No compensation claims yet</p>
            </div>
          ) : (
            <div className="claims-list">
              {compensations.map((comp, idx) => (
                <div key={idx} className="claim-item">
                  <div className="claim-header">
                    <h4>{comp.flightNumber} - {comp.route}</h4>
                    <p className="claim-amount">+{comp.amount} ETH</p>
                  </div>
                  <div className="claim-details">
                    <p><span>Delay:</span> {comp.delayMinutes} minutes</p>
                    <p><span>Type:</span> {comp.compensationType || comp.type}</p>
                    <p><span>Filed:</span> {new Date(comp.timestamp || comp.createdAt).toLocaleString()}</p>
                    <p><span>Status:</span> <span className="status-badge">{comp.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CompensatePage;

import React, { useState, useEffect } from 'react';
import { Gift, Coffee, Hotel, DollarSign, MapPin, RefreshCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import blockchainService from '../../services/blockchainDataService';

const voucherTypeInfo = {
  food: {
    title: 'Food Voucher',
    icon: Coffee,
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-600',
    description: 'Meal voucher for partner restaurants and airport cafes.'
  },
  hotel: {
    title: 'Hotel Voucher',
    icon: Hotel,
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-600',
    description: 'Hotel voucher for overnight stays and lounge access.'
  },
  transport: {
    title: 'Transport Voucher',
    icon: MapPin,
    bgClass: 'bg-violet-100',
    textClass: 'text-violet-600',
    description: 'Transport voucher for taxis, shuttles, or ride-share services.'
  },
  refund: {
    title: 'Refund Voucher',
    icon: DollarSign,
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-600',
    description: 'Refund voucher that can be redeemed for reimbursement.'
  }
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const formatAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(4) : '0.0000';
};

const VouchersPageSimple = ({ account, setDialog }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userAddress = account?.address;

  const loadVouchers = async () => {
    if (!userAddress) {
      setVouchers([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await blockchainService.getUserVouchers(userAddress);
      if (result.success) {
        setVouchers(result.vouchers || []);
      } else {
        setError(result.error || 'Unable to load vouchers.');
        setVouchers([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load vouchers.');
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [userAddress]);


  const voucherStatus = (voucher) => {
    if (!voucher) return 'unknown';
    if (voucher.status === 'redeemed') return 'Redeemed';
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) return 'Expired';
    return voucher.status === 'active' ? 'Active' : voucher.status;
  };

  const activeVouchers = vouchers.filter(v => voucherStatus(v) === 'Active');
  const redeemedVouchers = vouchers.filter(v => voucherStatus(v) === 'Redeemed');
  const expiredVouchers = vouchers.filter(v => voucherStatus(v) === 'Expired');

  const totalValue = vouchers.reduce((sum, voucher) => sum + Number(voucher.compensationAmount || 0), 0);
  const groupedByType = vouchers.reduce((groups, voucher) => {
    const type = voucher.voucherType || 'refund';
    groups[type] = groups[type] || [];
    groups[type].push(voucher);
    return groups;
  }, {});

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-8 h-8 text-sky-600" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-500">Voucher Wallet</p>
                <h2 className="text-3xl font-bold text-slate-900">My Vouchers</h2>
              </div>
            </div>
            <p className="text-slate-600 max-w-2xl">Manage your voucher claims and review issued voucher details. Voucher redemption is handled through the developer/admin tools and is not available from this user view.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total vouchers</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{vouchers.length}</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Redeemed</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{redeemedVouchers.length}</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Active</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{activeVouchers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {!userAddress && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Wallet Required</h3>
          </div>
          <p>Please connect your MetaMask wallet to see your vouchers and redeem them.</p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load vouchers</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">Voucher history</p>
              </div>
              <button
                type="button"
                onClick={loadVouchers}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <RefreshCcw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Voucher claim history</h3>
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Loading vouchers...</div>
            ) : vouchers.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                No vouchers yet. File a compensation claim to receive vouchers.
              </div>
            ) : (
              <div className="space-y-3">
                {vouchers.map((voucher) => (
                  <div key={voucher._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500 uppercase tracking-[0.16em]">{voucher.voucherType || 'voucher'}</p>
                        <p className="font-semibold text-slate-900">{voucher.flightNumber} • {voucher.voucherType?.replace('_', ' ') || 'Voucher'}</p>
                        <p className="text-sm text-slate-500">Issued {formatDateTime(voucher.createdAt)}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-start sm:items-end">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">{voucherStatus(voucher)}</span>
                        <p className="text-sm text-slate-500">Expires {formatDateTime(voucher.expiresAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-3 border border-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Voucher Code</p>
                        <p className="mt-2 font-mono text-sm text-slate-700 break-all">{voucher.voucherCode}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 border border-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reference</p>
                        <p className="mt-2 text-sm text-slate-700">{voucher.voucher_description || 'Service voucher available'}</p>
                        <p className="mt-1 text-xs text-slate-500">Type: {voucher.voucherType || 'Service'} • Delay {voucher.delayMinutes} min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(voucherTypeInfo).map(([type, info]) => {
            const items = groupedByType[type] || [];
            const Icon = info.icon;
            return (
              <div key={type} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${info.bgClass} ${info.textClass}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">{info.title}</p>
                      <p className="text-sm text-slate-600">{items.length} voucher{items.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mb-4">{info.description}</p>
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.slice(0, 3).map(voucher => (
                      <div key={voucher._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{voucher.flightNumber}</p>
                            <p className="text-xs text-slate-500">{formatDateTime(voucher.createdAt)}</p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{voucher.voucher_description || 'Voucher benefit'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No vouchers of this type yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VouchersPageSimple;

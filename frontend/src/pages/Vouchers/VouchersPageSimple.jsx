import React, { useState } from 'react';
import { Gift, Coffee, Hotel, DollarSign, AlertCircle } from 'lucide-react';

const VouchersPageSimple = ({ account, setDialog, compensations = [] }) => {
  const filteredCompensations = compensations.filter(c => c.method === 'voucher');
  
  const foodVouchers = filteredCompensations.filter(c => c.compensationType === 'food');
  const hotelVouchers = filteredCompensations.filter(c => c.compensationType === 'hotel');
  const refundVouchers = filteredCompensations.filter(c => c.compensationType === 'refund');

  return (
    <div className="space-y-6">
      {/* Vouchers Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md border border-green-200 p-8">
        <h2 className="text-3xl font-bold text-green-900 mb-2 flex items-center gap-3">
          <Gift className="w-8 h-8 text-green-600" />
          My Vouchers
        </h2>
        <p className="text-green-700 text-lg">View and manage all your compensation vouchers</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Vouchers</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{filteredCompensations.length}</p>
            <p className="text-xs text-gray-500">Active vouchers</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Value</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{filteredCompensations.reduce((sum, c) => sum + c.amount, 0)}</p>
            <p className="text-xs text-gray-500">Voucher points</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-600 uppercase font-semibold">Food</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{foodVouchers.length}</p>
            <p className="text-xs text-gray-500">Food vouchers</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-600 uppercase font-semibold">Hotel</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{hotelVouchers.length}</p>
            <p className="text-xs text-gray-500">Hotel vouchers</p>
          </div>
        </div>
      </div>

      {/* Vouchers by Type */}
      <div className="space-y-6">
        {/* Food Vouchers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Coffee className="w-6 h-6 text-orange-600" />
            Food Vouchers 🍽️
          </h3>
          {foodVouchers.length > 0 ? (
            <div className="space-y-3">
              {foodVouchers.map(voucher => (
                <div key={voucher.id} className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{voucher.flightNumber}</h4>
                    <p className="text-sm text-gray-600 mt-1">Delay: {voucher.delayMinutes} minutes</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(voucher.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{voucher.amount}</p>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No food vouchers yet</p>
          )}
        </div>

        {/* Hotel Vouchers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="w-6 h-6 text-blue-600" />
            Hotel Vouchers 🏨
          </h3>
          {hotelVouchers.length > 0 ? (
            <div className="space-y-3">
              {hotelVouchers.map(voucher => (
                <div key={voucher.id} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{voucher.flightNumber}</h4>
                    <p className="text-sm text-gray-600 mt-1">Delay: {voucher.delayMinutes} minutes</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(voucher.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{voucher.amount}</p>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hotel vouchers yet</p>
          )}
        </div>

        {/* Refund Vouchers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Refund Vouchers 💰
          </h3>
          {refundVouchers.length > 0 ? (
            <div className="space-y-3">
              {refundVouchers.map(voucher => (
                <div key={voucher.id} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{voucher.flightNumber}</h4>
                    <p className="text-sm text-gray-600 mt-1">Delay: {voucher.delayMinutes} minutes</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(voucher.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${voucher.amount}</p>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Value</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No refund vouchers yet</p>
          )}
        </div>
      </div>

      {filteredCompensations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No vouchers yet. File a compensation claim to receive vouchers.</p>
        </div>
      )}
    </div>
  );
};

export default VouchersPageSimple;

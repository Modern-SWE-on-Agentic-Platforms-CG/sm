/**
 * ReferralAnalytics — pie + bar charts for referral data
 * Uses simple CSS-based charts (no external charting lib required for MVP)
 */
import React from 'react'
import type { ReferralAnalytics } from '@appTypes/referral'

interface ReferralAnalyticsProps {
  analytics: ReferralAnalytics
}

const BU_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
]

export const ReferralAnalyticsPanel: React.FC<ReferralAnalyticsProps> = ({ analytics }) => {
  const total = analytics.totalReferrals || 1

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Referrals by BU — horizontal bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Referrals by BU</h3>
        <div className="space-y-3">
          {analytics.byBU.map((item, i) => (
            <div key={item.bu}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{item.bu}</span>
                <span className="font-medium">{item.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${BU_COLORS[i % BU_COLORS.length]}`}
                  style={{ width: `${(item.count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {analytics.byBU.length === 0 && (
            <p className="text-xs text-gray-400">No data available</p>
          )}
        </div>
      </div>

      {/* Conversion rate by BU — bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversion Rate by BU</h3>
        <div className="space-y-3">
          {analytics.byBU.map((item, i) => (
            <div key={item.bu}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{item.bu}</span>
                <span className="font-medium">{item.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${BU_COLORS[i % BU_COLORS.length]}`}
                  style={{ width: `${item.conversionRate}%` }}
                />
              </div>
            </div>
          ))}
          {analytics.byBU.length === 0 && (
            <p className="text-xs text-gray-400">No data available</p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="md:col-span-2 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{analytics.totalReferrals}</p>
          <p className="text-xs text-blue-600 mt-1">Total Referrals</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{analytics.totalConverted}</p>
          <p className="text-xs text-green-600 mt-1">Converted</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {analytics.totalReferrals > 0
              ? ((analytics.totalConverted / analytics.totalReferrals) * 100).toFixed(1)
              : '0.0'}%
          </p>
          <p className="text-xs text-purple-600 mt-1">Overall Conversion</p>
        </div>
      </div>
    </div>
  )
}

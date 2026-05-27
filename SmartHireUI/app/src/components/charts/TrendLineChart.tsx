/**
 * TrendLineChart — time-series line chart (interviewed, selected, rejected)
 */
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TrendChartReport } from '@appTypes/reports'

interface TrendLineChartProps {
  data: TrendChartReport
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Hiring Trend (Last 12 Months)</h3>
      {data.data.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No trend data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="interviewed" stroke="#3b82f6" name="Interviewed" strokeWidth={2} />
            <Line type="monotone" dataKey="selected" stroke="#10b981" name="Selected" strokeWidth={2} />
            <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

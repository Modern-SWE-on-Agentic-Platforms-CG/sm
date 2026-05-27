/**
 * RejectionRatioPie — pie chart showing selection/rejection/hold ratios
 */
import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import type { RejectionRatioReport } from '@appTypes/reports'

interface RejectionRatioPieProps {
  data: RejectionRatioReport
}

interface LabelProps {
  name?: string
  value: number
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6b7280']

const renderLabel = (props: LabelProps) => {
  const { name = '', value } = props
  const percent = ((value / 100) * 100).toFixed(0)
  return `${name} ${percent}%`
}

export const RejectionRatioPie: React.FC<RejectionRatioPieProps> = ({ data }) => {
  const chartData = [
    { name: 'Selected', value: data.selected },
    { name: 'Rejected', value: data.rejected },
    { name: 'On Hold', value: data.onHold },
  ].filter((d) => d.value > 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Selection / Rejection Ratio</h3>
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={80}>
              {chartData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{data.selected}</p>
          <p className="text-xs text-gray-600 mt-1">{(data.selectedPercentage ?? 0).toFixed(1)}% Selected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{data.rejected}</p>
          <p className="text-xs text-gray-600 mt-1">{(data.rejectedPercentage ?? 0).toFixed(1)}% Rejected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">{data.onHold}</p>
          <p className="text-xs text-gray-600 mt-1">On Hold</p>
        </div>
      </div>
    </div>
  )
}

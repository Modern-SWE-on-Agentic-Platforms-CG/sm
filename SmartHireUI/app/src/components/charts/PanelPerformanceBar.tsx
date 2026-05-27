/**
 * PanelPerformanceBar — bar chart of interviews per panel member
 */
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PanelPerformanceReport } from '@appTypes/reports'

interface PanelPerformanceBarProps {
  data: PanelPerformanceReport
}

export const PanelPerformanceBar: React.FC<PanelPerformanceBarProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Panel Performance</h3>
      {data.data.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No panel data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="panelMember" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="interviewCount" fill="#3b82f6" name="Interviews" />
            <Bar dataKey="utilizationRate" fill="#8b5cf6" name="Utilization Rate %" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

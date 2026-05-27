/**
 * L2AgingTable — table of candidates at L2 with color-coded severity
 */
import React from 'react'
import type { L2AgingCandidate } from '@appTypes/reports'

interface L2AgingTableProps {
  data: L2AgingCandidate[]
  isLoading?: boolean
}

const SEVERITY_COLORS = {
  low: 'bg-green-50 text-green-700',
  medium: 'bg-yellow-50 text-yellow-700',
  high: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
}

const SEVERITY_BADGE = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export const L2AgingTable: React.FC<L2AgingTableProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">L2 Aging Report</h3>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No candidates at L2 stage</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Candidate', 'Email', 'Skill', 'Aging (Days)', 'Severity', 'At L2 Since'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr key={row.candidateId} className={`hover:bg-gray-50 ${SEVERITY_COLORS[row.severity]}`}>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.email}</td>
                  <td className="px-4 py-3">{row.skill}</td>
                  <td className="px-4 py-3 font-semibold">{row.agingDays}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${SEVERITY_BADGE[row.severity]}`}>
                      {row.severity.charAt(0).toUpperCase() + row.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(row.dateAtL2).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

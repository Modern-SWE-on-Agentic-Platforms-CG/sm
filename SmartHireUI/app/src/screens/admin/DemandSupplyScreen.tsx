/**
 * DemandSupplyScreen — BU/Practice/Skill demand vs supply grid
 */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import { loadDemandSupply } from '@store/slices/adminSlice'
import { selectDemandSupply, selectAdminIsLoading, selectAdminError } from '@store/selectors/adminSelectors'
import { clearError } from '@store/slices/adminSlice'

const DemandSupplyScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const rows = useSelector(selectDemandSupply)
  const isLoading = useSelector(selectAdminIsLoading)
  const error = useSelector(selectAdminError)

  useEffect(() => { dispatch(loadDemandSupply()) }, [dispatch])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-bold text-gray-900 pb-4">Demand &amp; Supply</h1>

      {error && (
        <div role="alert" className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="font-bold">&times;</button>
        </div>
      )}

      <div className="overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No data available</p>
        ) : (
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['BU', 'Practice', 'Skill', 'Open Demand', 'Active Candidates', 'Gap'].map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{row.bu}</td>
                  <td className="px-4 py-3">{row.practice}</td>
                  <td className="px-4 py-3">{row.skill}</td>
                  <td className="px-4 py-3">{row.openDemand}</td>
                  <td className="px-4 py-3">{row.activeCandidates}</td>
                  <td className={`px-4 py-3 font-medium ${row.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {row.gap > 0 ? `+${row.gap}` : row.gap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DemandSupplyScreen

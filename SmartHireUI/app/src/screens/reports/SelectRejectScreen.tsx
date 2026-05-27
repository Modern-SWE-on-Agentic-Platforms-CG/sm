/**
 * SelectRejectScreen — rejection/selection ratio report
 */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import type { AppDispatch, RootState } from '@store/store'
import { fetchRejectionRatio, clearError } from '@store/slices/reportsSlice'
import { RejectionRatioPie } from '@components/charts/RejectionRatioPie'
import { exportReport } from '@services/api/reports'

const SelectRejectScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const rejectionRatio = useSelector((s: RootState) => s.reports.rejectionRatio)
  const isLoading = useSelector((s: RootState) => s.reports.isLoading)
  const error = useSelector((s: RootState) => s.reports.error)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => { dispatch(fetchRejectionRatio()) }, [dispatch])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await exportReport('rejection-ratio')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rejection-ratio-${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setIsExporting(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Selection / Rejection Report</h1>
        <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>
      {error && (
        <div role="alert" className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="font-bold">&times;</button>
        </div>
      )}
      {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      : rejectionRatio ? (
        <div className="space-y-6">
          <RejectionRatioPie data={rejectionRatio} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{path: '/panel-insights', name: 'Panel Performance', color: 'blue'}, {path: '/trend-chart', name: 'Trends', color: 'green'}, {path: '/l2-aging', name: 'L2 Aging', color: 'orange'}, {path: '/reports-dashboard', name: 'Dashboard', color: 'purple'}].map((link) => (
              <Link key={link.path} to={link.path} className={`p-4 bg-${link.color}-50 border border-${link.color}-200 rounded-lg hover:bg-${link.color}-100 text-center`}>
                <p className={`text-sm font-semibold text-${link.color}-900`}>{link.name}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SelectRejectScreen

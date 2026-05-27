/**
 * PanelInsightsScreen — panel performance analytics
 */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@store/store'
import { fetchPanelPerformance } from '@store/slices/reportsSlice'
import { PanelPerformanceBar } from '@components/charts/PanelPerformanceBar'
import { exportReport } from '@services/api/reports'

const PanelInsightsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const panelPerf = useSelector((s: RootState) => s.reports.panelPerformance)
  const isLoading = useSelector((s: RootState) => s.reports.isLoading)
  const error = useSelector((s: RootState) => s.reports.error)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => { dispatch(fetchPanelPerformance()) }, [dispatch])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await exportReport('panel-performance')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `panel-performance-${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setIsExporting(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Panel Performance</h1>
        <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>
      {error && <div role="alert" className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      : panelPerf ? <PanelPerformanceBar data={panelPerf} /> : null}
    </div>
  )
}

export default PanelInsightsScreen

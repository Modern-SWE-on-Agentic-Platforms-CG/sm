/**
 * L2AgingScreen — candidates stuck at L2 stage
 */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@store/store'
import { fetchL2Aging } from '@store/slices/reportsSlice'
import { L2AgingTable } from '@components/tables/L2AgingTable'
import { exportReport } from '@services/api/reports'

const L2AgingScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const l2Aging = useSelector((s: RootState) => s.reports.l2Aging)
  const isLoading = useSelector((s: RootState) => s.reports.isLoading)
  const error = useSelector((s: RootState) => s.reports.error)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => { dispatch(fetchL2Aging()) }, [dispatch])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await exportReport('l2-aging')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `l2-aging-${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setIsExporting(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">L2 Aging Report</h1>
        <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>
      {error && <div role="alert" className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      {l2Aging && <L2AgingTable data={l2Aging.data} isLoading={isLoading} />}
    </div>
  )
}

export default L2AgingScreen

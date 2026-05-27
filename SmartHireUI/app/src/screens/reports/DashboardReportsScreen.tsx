/**
 * DashboardReportsScreen — executive summary with key metrics
 */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import type { AppDispatch, RootState } from '@store/store'
import { fetchDashboardMetrics } from '@store/slices/reportsSlice'

const DashboardReportsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const metrics = useSelector((s: RootState) => s.reports.dashboardMetrics)
  const isLoading = useSelector((s: RootState) => s.reports.isLoading)

  useEffect(() => { dispatch(fetchDashboardMetrics()) }, [dispatch])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Reports Dashboard</h1>

      {metrics && (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-3xl font-bold text-blue-700">{metrics.totalCandidates}</p>
              <p className="text-xs text-blue-600 mt-1">Total Candidates</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-3xl font-bold text-green-700">{metrics.averageDaysInPipeline}</p>
              <p className="text-xs text-green-600 mt-1">Avg Days in Pipeline</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-3xl font-bold text-red-700">{(metrics.rejectionRate ?? 0).toFixed(1)}%</p>
              <p className="text-xs text-red-600 mt-1">Rejection Rate</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-lg font-bold text-purple-700">6</p>
              <p className="text-xs text-purple-600 mt-1">Report Types</p>
            </div>
          </div>

          {/* Pipeline stages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Stages</h3>
            <div className="space-y-2">
              {Object.entries(metrics.pipelineStages).map(([stage, count]) => (
                <div key={stage} className="flex justify-between text-sm">
                  <span className="text-gray-700">{stage}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/select-reject" className="p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-gray-200 rounded-xl hover:shadow-md">
              <p className="font-semibold text-gray-900">Selection Ratio</p>
              <p className="text-xs text-gray-600 mt-1">View selection/rejection</p>
            </Link>
            <Link to="/panel-insights" className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 rounded-xl hover:shadow-md">
              <p className="font-semibold text-gray-900">Panel Performance</p>
              <p className="text-xs text-gray-600 mt-1">Interview counts & rates</p>
            </Link>
            <Link to="/trend-chart" className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-200 rounded-xl hover:shadow-md">
              <p className="font-semibold text-gray-900">Trends</p>
              <p className="text-xs text-gray-600 mt-1">Time-series analysis</p>
            </Link>
            <Link to="/l2-aging" className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-gray-200 rounded-xl hover:shadow-md">
              <p className="font-semibold text-gray-900">L2 Aging</p>
              <p className="text-xs text-gray-600 mt-1">Candidates stuck at L2</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardReportsScreen

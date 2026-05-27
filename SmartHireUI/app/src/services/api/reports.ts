/**
 * Reports API client — mapped to actual backend paths
 */
import { apiClient } from './client'
import type {
  RejectionRatioReport,
  TrendChartReport,
  PanelPerformanceReport,
  L2AgingReport,
  DateOfJoiningRecord,
  ARCDeviationRecord,
  ReportFilters,
  DashboardReportMetrics,
} from '@appTypes/reports'

/** Generic helper to call POST /reports/candidatePipeline
 *  Returns raw rows array from { response: [...] } wrapper */
async function pipelineRawRows(reportType: string, filters?: ReportFilters): Promise<Record<string, unknown>[]> {
  const res = await apiClient.post('/reports/candidatePipeline', {
    report_type: reportType,
    ...filters,
  })
  const raw = res.data as unknown as { response?: Record<string, unknown>[]; data?: Record<string, unknown>[] }
  const rows = raw.response ?? raw.data ?? (Array.isArray(res.data) ? (res.data as Record<string, unknown>[]) : [])
  return rows
}

/** Get rejection/selection ratio data — computed from raw pipeline rows */
export async function getRejectionRatio(filters?: ReportFilters): Promise<RejectionRatioReport> {
  const rows = await pipelineRawRows('rejection-ratio', filters)
  const total = rows.length
  // Use Status field if available; otherwise treat all as active
  const selected = rows.filter(r => String(r.Status ?? '').toUpperCase().includes('SELECT') || String(r.Status ?? '').toUpperCase().includes('JOIN')).length
  const rejected = rows.filter(r => String(r.Status ?? '').toUpperCase().includes('REJECT')).length
  const onHold = rows.filter(r => String(r.Status ?? '').toUpperCase().includes('HOLD')).length
  const selectedPct = total > 0 ? (selected / total) * 100 : 0
  const rejectedPct = total > 0 ? (rejected / total) * 100 : 0
  return {
    totalCandidates: total,
    selected,
    rejected,
    onHold,
    selectedPercentage: selectedPct,
    rejectedPercentage: rejectedPct,
    data: [
      { name: 'Selected', value: selected },
      { name: 'Rejected', value: rejected },
      { name: 'On Hold', value: onHold },
    ],
  }
}

/** Get trend chart data (time-series) */
export async function getTrendChart(filters?: ReportFilters): Promise<TrendChartReport> {
  const rows = await pipelineRawRows('trend-chart', filters)
  return { data: rows as unknown[] } as TrendChartReport
}

/** Get panel performance data */
export async function getPanelPerformance(filters?: ReportFilters): Promise<PanelPerformanceReport> {
  const rows = await pipelineRawRows('panel-performance', filters)
  return { data: rows as unknown[] } as PanelPerformanceReport
}

/** Get L2 aging candidates */
export async function getL2Aging(filters?: ReportFilters & { page?: number; pageSize?: number }): Promise<L2AgingReport> {
  const rows = await pipelineRawRows('l2-aging', filters)
  return { data: rows as unknown[], total: rows.length } as L2AgingReport
}

/** Get Date of Joining report */
export async function getDateOfJoining(filters?: ReportFilters): Promise<DateOfJoiningRecord[]> {
  const rows = await pipelineRawRows('date-of-joining', filters)
  return rows as unknown as DateOfJoiningRecord[]
}

/** Get ARC Deviation (demand vs supply) */
export async function getARCDeviation(filters?: ReportFilters): Promise<ARCDeviationRecord[]> {
  const rows = await pipelineRawRows('arc-deviation', filters)
  return rows as unknown as ARCDeviationRecord[]
}

/** Get dashboard metrics */
export async function getDashboardMetrics(): Promise<DashboardReportMetrics> {
  const rows = await pipelineRawRows('dashboard-metrics')
  const total = rows.length
  return {
    totalCandidates: total,
    pipelineStages: {},
    rejectionRate: 0,
    averageDaysInPipeline: 0,
    topSources: [],
    topSkills: [],
  }
}

/** Export report data to Excel
 *  Backend: GET /downloadExcel/exportExcel
 */
export async function exportReport(
  reportType: 'rejection-ratio' | 'trend-chart' | 'panel-performance' | 'l2-aging' | 'date-of-joining' | 'arc-deviation',
  filters?: ReportFilters
): Promise<Blob> {
  const res = await apiClient.get('/downloadExcel/exportExcel', {
    params: { report_type: reportType, ...filters },
    responseType: 'blob',
  })
  return res.data as unknown as Blob
}

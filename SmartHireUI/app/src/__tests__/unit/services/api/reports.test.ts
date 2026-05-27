/**
 * T155 - Reports API unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRejectionRatio,
  getTrendChart,
  getPanelPerformance,
  getL2Aging,
  getDashboardMetrics,
  exportReport,
} from '@services/api/reports'

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '@services/api/client'

describe('Reports API Client', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should get rejection ratio', async () => {
    const mockData = { totalCandidates: 100, selected: 60, rejected: 30, onHold: 10, selectedPercentage: 60, rejectedPercentage: 30, data: [] }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData })
    const result = await getRejectionRatio()
    expect(result.selectedPercentage).toBe(60)
    expect(apiClient.get).toHaveBeenCalledWith('/reports/rejection-ratio', expect.any(Object))
  })

  it('should get trend chart data', async () => {
    const mockData = { data: [{ date: '2026-05-01', interviewed: 10, selected: 5, rejected: 2 }] }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData })
    const result = await getTrendChart()
    expect(result.data).toHaveLength(1)
    expect(apiClient.get).toHaveBeenCalledWith('/reports/trend-chart', expect.any(Object))
  })

  it('should get panel performance', async () => {
    const mockData = { data: [{ panelMember: 'John', interviewCount: 20, utilizationRate: 85 }] }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData })
    const result = await getPanelPerformance()
    expect(result.data).toHaveLength(1)
    expect(apiClient.get).toHaveBeenCalledWith('/reports/panel-performance', expect.any(Object))
  })

  it('should get L2 aging data', async () => {
    const mockData = { data: [{ candidateId: 'c1', name: 'John', email: 'john@test.com', skill: 'Java', agingDays: 15, severity: 'high' as const, dateAtL2: '2026-05-01' }], total: 1 }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData })
    const result = await getL2Aging()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].severity).toBe('high')
  })

  it('should get dashboard metrics', async () => {
    const mockData = { totalCandidates: 200, pipelineStages: { Applied: 100 }, rejectionRate: 25, averageDaysInPipeline: 20, topSources: [], topSkills: [] }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData })
    const result = await getDashboardMetrics()
    expect(result.totalCandidates).toBe(200)
    expect(apiClient.get).toHaveBeenCalledWith('/reports/dashboard-metrics')
  })

  it('should export report as blob', async () => {
    const blob = new Blob(['data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: blob })
    const result = await exportReport('rejection-ratio')
    expect(result).toBeInstanceOf(Blob)
    expect(apiClient.get).toHaveBeenCalledWith('/reports/rejection-ratio/export', expect.objectContaining({ responseType: 'blob' }))
  })
})

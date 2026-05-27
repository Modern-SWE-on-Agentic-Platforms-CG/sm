/**
 * Reports & Analytics domain types
 */

export interface ChartDataPoint {
  name: string
  value: number
  percentage?: number
}

export interface PanelPerformanceData {
  panelMember: string
  interviewCount: number
  utilizationRate: number
}

export interface TrendDataPoint {
  date: string
  interviewed: number
  selected: number
  rejected: number
}

export interface L2AgingCandidate {
  candidateId: string
  name: string
  email: string
  skill: string
  agingDays: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  dateAtL2: string
}

export interface DateOfJoiningRecord {
  candidateId: string
  name: string
  skill: string
  expectedDOJ?: string
  confirmedDOJ?: string
  status: 'pending' | 'confirmed' | 'delayed'
}

export interface ARCDeviationRecord {
  bu: string
  practice: string
  demand: number
  supply: number
  deviation: number
}

export interface ReportFilters {
  technology?: string
  bu?: string
  source?: string
  dateFrom?: string
  dateTo?: string
  panelMember?: string
}

export interface RejectionRatioReport {
  totalCandidates: number
  selected: number
  rejected: number
  onHold: number
  selectedPercentage: number
  rejectedPercentage: number
  data: ChartDataPoint[]
}

export interface TrendChartReport {
  data: TrendDataPoint[]
}

export interface PanelPerformanceReport {
  data: PanelPerformanceData[]
}

export interface L2AgingReport {
  data: L2AgingCandidate[]
  total: number
}

export interface DashboardReportMetrics {
  totalCandidates: number
  pipelineStages: { [key: string]: number }
  rejectionRate: number
  averageDaysInPipeline: number
  topSources: ChartDataPoint[]
  topSkills: ChartDataPoint[]
}

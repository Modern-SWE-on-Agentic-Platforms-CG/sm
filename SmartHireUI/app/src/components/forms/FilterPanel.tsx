/**
 * FilterPanel — Technology, BU, Source, Status, Date range filters
 */
import React, { useState } from 'react'
import type { CandidateFilter, CandidateStatus, CandidateSource } from '@appTypes/candidate'

interface FilterPanelProps {
  filter: CandidateFilter
  onApply: (filter: CandidateFilter) => void
  onReset: () => void
  isOpen?: boolean
}

const TECHNOLOGIES = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', '.NET',
  'Node.js', 'DevOps', 'Data Engineering', 'QA', 'iOS', 'Android',
]

const BUS = [
  'EAS', 'Analytics', 'CG', 'Infrastructure', 'Product', 'ATS',
]

const STATUSES: CandidateStatus[] = [
  'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED',
  'SELECTED', 'REJECTED', 'HOLD', 'WITHDRAWN',
] as CandidateStatus[]

const SOURCES: CandidateSource[] = [
  'REFERRAL', 'NAUKRI', 'LINKEDIN', 'DIRECT', 'CAMPUS', 'CONSULTANT', 'OTHER',
] as CandidateSource[]

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onApply,
  onReset,
}) => {
  const [local, setLocal] = useState<CandidateFilter>(filter)

  const toggle = <K extends keyof CandidateFilter>(
    field: K,
    value: string,
    currentValues?: string[]
  ) => {
    const vals = currentValues ?? []
    const next = vals.includes(value) ? vals.filter((v) => v !== value) : [...vals, value]
    setLocal((prev) => ({ ...prev, [field]: next.length ? next : undefined }))
  }

  const handleApply = () => onApply(local)
  const handleReset = () => {
    setLocal({})
    onReset()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 w-64">
      <h3 className="font-semibold text-gray-800 text-sm">Filters</h3>

      {/* Technology */}
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase mb-2">Technology</p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {TECHNOLOGIES.map((tech) => (
            <label key={tech} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={local.technology?.includes(tech) ?? false}
                onChange={() => toggle('technology', tech, local.technology)}
                className="accent-blue-600"
              />
              {tech}
            </label>
          ))}
        </div>
      </div>

      {/* BU */}
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase mb-2">Business Unit</p>
        <div className="space-y-1">
          {BUS.map((bu) => (
            <label key={bu} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={local.bu?.includes(bu) ?? false}
                onChange={() => toggle('bu', bu, local.bu)}
                className="accent-blue-600"
              />
              {bu}
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase mb-2">Status</p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {STATUSES.map((status) => (
            <label key={status} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={local.status?.includes(status) ?? false}
                onChange={() => toggle('status', status, local.status)}
                className="accent-blue-600"
              />
              {status.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
      </div>

      {/* Source */}
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase mb-2">Source</p>
        <div className="space-y-1">
          {SOURCES.map((src) => (
            <label key={src} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={local.source?.includes(src) ?? false}
                onChange={() => toggle('source', src, local.source)}
                className="accent-blue-600"
              />
              {src}
            </label>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase mb-2">Date Range</p>
        <div className="space-y-2">
          <input
            type="date"
            value={local.dateFrom ?? ''}
            onChange={(e) => setLocal((p) => ({ ...p, dateFrom: e.target.value || undefined }))}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1"
            placeholder="From"
          />
          <input
            type="date"
            value={local.dateTo ?? ''}
            onChange={(e) => setLocal((p) => ({ ...p, dateTo: e.target.value || undefined }))}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1"
            placeholder="To"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleReset}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-1.5 text-xs bg-blue-600 rounded text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default FilterPanel

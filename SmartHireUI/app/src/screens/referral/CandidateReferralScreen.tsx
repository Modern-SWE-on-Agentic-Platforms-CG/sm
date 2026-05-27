/**
 * CandidateReferralScreen — Admin view of all referrals, with filtering + export
 */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@store/store'
import { fetchAllReferrals, fetchAnalytics, setFilter } from '@store/slices/referralSlice'
import { ReferralAnalyticsPanel } from '@components/charts/ReferralAnalytics'
import { exportReferrals } from '@services/api/referral'

const CandidateReferralScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const candidates = useSelector((s: RootState) => s.referral.allCandidates)
  const analytics = useSelector((s: RootState) => s.referral.analytics)
  const isLoading = useSelector((s: RootState) => s.referral.isLoading)
  const total = useSelector((s: RootState) => s.referral.total)
  const error = useSelector((s: RootState) => s.referral.error)

  const [search, setSearch] = useState('')
  const [buFilter, setBuFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    dispatch(fetchAllReferrals())
    dispatch(fetchAnalytics())
  }, [dispatch])

  const handleFilter = () => {
    const f = { search: search || undefined, bu: buFilter || undefined }
    dispatch(setFilter(f))
    dispatch(fetchAllReferrals(f))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await exportReferrals({ search: search || undefined, bu: buFilter || undefined })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `referrals-${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">All Referrals</h1>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isExporting ? 'Exporting…' : 'Export Excel'}
        </button>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="mb-6">
          <ReferralAnalyticsPanel analytics={analytics} />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name/email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56"
        />
        <input
          type="text"
          placeholder="BU filter…"
          value={buFilter}
          onChange={(e) => setBuFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40"
        />
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-2">{total} referral{total !== 1 ? 's' : ''} found</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Candidate', 'Email', 'Skill', 'Referred By', 'BU', 'Status', 'Date Referred'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500 text-sm">No referrals found</td>
                  </tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3">{c.skill}</td>
                      <td className="px-4 py-3">{c.referrerName}</td>
                      <td className="px-4 py-3">{c.bu ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{new Date(c.referralDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default CandidateReferralScreen

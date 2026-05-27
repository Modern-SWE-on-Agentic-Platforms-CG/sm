/**
 * RefCandidateDetailsScreen — SPOC's own referred candidates table
 */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import type { AppDispatch, RootState } from '@store/store'
import { fetchMyCandidates } from '@store/slices/referralSlice'

const RefCandidateDetailsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const candidates = useSelector((s: RootState) => s.referral.myCandidates)
  const isLoading = useSelector((s: RootState) => s.referral.isLoading)
  const error = useSelector((s: RootState) => s.referral.error)

  useEffect(() => { dispatch(fetchMyCandidates()) }, [dispatch])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Referrals</h1>
        <Link
          to="/referral-portal/referral-form"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Refer Candidate
        </Link>
      </div>

      {error && (
        <div role="alert" className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No referrals yet.</p>
          <Link to="/referral-portal/referral-form" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Submit your first referral</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Skill', 'Status', 'Date Referred', 'Last Modified'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3">{c.skill}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(c.referralDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(c.lastModified).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RefCandidateDetailsScreen

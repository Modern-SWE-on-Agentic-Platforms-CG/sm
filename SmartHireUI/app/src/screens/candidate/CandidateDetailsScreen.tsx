/**
 * T167 - CandidateDetailsScreen: Full candidate profile with skills, documents, and lifecycle
 */
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getCandidateById } from '@services/api/candidates'
import type { CandidateDetailView } from '@appTypes/candidate'
import { SkillMatchDisplay } from '@components/candidate/SkillMatchDisplay'
import { DocumentDownloadSection } from '@components/candidate/DocumentDownloadSection'
import { DocumentUploadSection } from '@components/candidate/DocumentUploadSection'
import { LifecycleTimeline } from '@components/candidate/LifecycleTimeline'

const CandidateDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [candidate, setCandidate] = useState<CandidateDetailView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const loadCandidate = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCandidateById(id)
        setCandidate(data as CandidateDetailView)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load candidate')
      } finally {
        setIsLoading(false)
      }
    }
    loadCandidate()
  }, [id])

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  }

  if (error || !candidate) {
    return <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error || 'Candidate not found'}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          {candidate.photo && (
            <img src={`data:image/jpeg;base64,${candidate.photo}`} alt={candidate.name} className="w-20 h-20 rounded-full object-cover" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{candidate.email}</p>
            <p className="text-sm text-gray-600">{candidate.contact}</p>
            <div className="flex gap-4 mt-4">
              <div><span className="text-xs text-gray-500">Grade:</span> <span className="text-sm font-medium">{candidate.grade || 'N/A'}</span></div>
              <div><span className="text-xs text-gray-500">Location:</span> <span className="text-sm font-medium">{candidate.location || 'N/A'}</span></div>
              <div><span className="text-xs text-gray-500">Status:</span> <span className="text-sm font-medium text-blue-600">{candidate.status}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Matching */}
      {candidate.skillMatch != null && <SkillMatchDisplay skillMatch={candidate.skillMatch} />}

      {/* Documents */}
      <div className="grid grid-cols-2 gap-6">
        <DocumentDownloadSection documents={candidate.documents ?? []} />
        <DocumentUploadSection candidateId={candidate.id} />
      </div>

      {/* Lifecycle Timeline */}
      <LifecycleTimeline events={candidate.lifecycleHistory ?? []} />
    </div>
  )
}

export default CandidateDetailsScreen

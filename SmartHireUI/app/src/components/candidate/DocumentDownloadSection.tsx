/**
 * T169 - DocumentDownloadSection: Download resume, email, and feedback forms
 */
import React, { useState } from 'react'
import type { CandidateDocument } from '@appTypes/candidate'
import { downloadDocument } from '@services/utils/fileUpload'

interface DocumentDownloadSectionProps {
  documents: CandidateDocument[]
}

export const DocumentDownloadSection: React.FC<DocumentDownloadSectionProps> = ({ documents }) => {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (doc: CandidateDocument) => {
    setDownloading(doc.id)
    setError(null)
    try {
      await downloadDocument(doc)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloading(null)
    }
  }

  const groupedDocs = {
    RESUME: documents.filter((d) => d.type === 'RESUME'),
    EMAIL: documents.filter((d) => d.type === 'EMAIL'),
    FEEDBACK: documents.filter((d) => d.type === 'FEEDBACK'),
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>

      {error && <div className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">No documents uploaded</p>
      ) : (
        <div className="space-y-4">
          {/* Resume */}
          {groupedDocs.RESUME.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Resume</h4>
              <div className="space-y-2">
                {groupedDocs.RESUME.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDownload(doc)}
                    disabled={downloading === doc.id}
                    className="w-full px-3 py-2 text-left text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex justify-between items-center"
                  >
                    <span>{doc.fileName}</span>
                    <span className="text-xs text-blue-600">
                      {downloading === doc.id ? 'Downloading...' : `${(doc.fileSize / 1024).toFixed(1)} KB`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email */}
          {groupedDocs.EMAIL.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Email</h4>
              <div className="space-y-2">
                {groupedDocs.EMAIL.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDownload(doc)}
                    disabled={downloading === doc.id}
                    className="w-full px-3 py-2 text-left text-sm bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 flex justify-between items-center"
                  >
                    <span>{doc.fileName}</span>
                    <span className="text-xs text-green-600">
                      {downloading === doc.id ? 'Downloading...' : `${(doc.fileSize / 1024).toFixed(1)} KB`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Forms */}
          {groupedDocs.FEEDBACK.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Feedback Forms</h4>
              <div className="space-y-2">
                {groupedDocs.FEEDBACK.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDownload(doc)}
                    disabled={downloading === doc.id}
                    className="w-full px-3 py-2 text-left text-sm bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-50 flex justify-between items-center"
                  >
                    <span>{doc.fileName}</span>
                    <span className="text-xs text-purple-600">
                      {downloading === doc.id ? 'Downloading...' : `${(doc.fileSize / 1024).toFixed(1)} KB`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

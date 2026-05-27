/**
 * T170 - DocumentUploadSection: Upload resume and email documents
 */
import React, { useRef, useState } from 'react'
import { uploadDocument } from '@services/utils/fileUpload'

interface DocumentUploadSectionProps {
  candidateId: string
  onUploadSuccess?: () => void
}

const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EMAIL_TYPES = ['application/vnd.ms-outlook']

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ candidateId, onUploadSuccess }) => {
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [resumeUpload, setResumeUpload] = useState({ loading: false, error: null as string | null })
  const [emailUpload, setEmailUpload] = useState({ loading: false, error: null as string | null })

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setResumeUpload({ loading: true, error: null })
    try {
      // Validate file type
      if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
        setResumeUpload({ loading: false, error: 'Only PDF and DOC files allowed' })
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setResumeUpload({ loading: false, error: 'File size must be less than 10MB' })
        return
      }

      await uploadDocument(candidateId, file, 'RESUME')
      setResumeUpload({ loading: false, error: null })
      if (resumeInputRef.current) resumeInputRef.current.value = ''
      onUploadSuccess?.()
    } catch (err: unknown) {
      setResumeUpload({ loading: false, error: err instanceof Error ? err.message : 'Upload failed' })
    }
  }

  const handleEmailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEmailUpload({ loading: true, error: null })
    try {
      // Validate file type
      if (!ALLOWED_EMAIL_TYPES.includes(file.type) && !file.name.endsWith('.msg')) {
        setEmailUpload({ loading: false, error: 'Only .msg files allowed' })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setEmailUpload({ loading: false, error: 'File size must be less than 5MB' })
        return
      }

      await uploadDocument(candidateId, file, 'EMAIL')
      setEmailUpload({ loading: false, error: null })
      if (emailInputRef.current) emailInputRef.current.value = ''
      onUploadSuccess?.()
    } catch (err: unknown) {
      setEmailUpload({ loading: false, error: err instanceof Error ? err.message : 'Upload failed' })
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>

      <div className="space-y-4">
        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resume</label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              disabled={resumeUpload.loading}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="text-sm text-blue-600 font-medium">Click to upload or drag and drop</div>
              <p className="text-xs text-gray-500 mt-1">PDF or DOC (max 10MB)</p>
            </label>
          </div>
          {resumeUpload.error && <p className="mt-2 text-sm text-red-600">{resumeUpload.error}</p>}
          {resumeUpload.loading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
        </div>

        {/* Email Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Email (.msg)</label>
          <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
            <input
              ref={emailInputRef}
              type="file"
              accept=".msg"
              onChange={handleEmailUpload}
              disabled={emailUpload.loading}
              className="hidden"
              id="email-upload"
            />
            <label htmlFor="email-upload" className="cursor-pointer">
              <div className="text-sm text-green-600 font-medium">Click to upload or drag and drop</div>
              <p className="text-xs text-gray-500 mt-1">.msg files only (max 5MB)</p>
            </label>
          </div>
          {emailUpload.error && <p className="mt-2 text-sm text-red-600">{emailUpload.error}</p>}
          {emailUpload.loading && <p className="mt-2 text-sm text-green-600">Uploading...</p>}
        </div>
      </div>
    </div>
  )
}

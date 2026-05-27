/**
 * FileUpload — drag-and-drop Excel upload for bulk candidate import
 */
import React, { useRef, useState } from 'react'

const ALLOWED_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

interface FileUploadProps {
  onUpload: (file: File) => void
  isUploading?: boolean
  disabled?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  isUploading = false,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only Excel files (.xls, .xlsx) are supported'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size must not exceed ${MAX_SIZE_MB}MB`
    }
    return null
  }

  const handleFile = (file: File) => {
    const error = validate(file)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    onUpload(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload Excel file"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && !isUploading && inputRef.current?.click()}
        className={[
          'border-2 border-dashed rounded-lg px-6 py-8 text-center transition-colors cursor-pointer',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400',
          (disabled || isUploading) ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={handleChange}
          disabled={disabled || isUploading}
          aria-hidden="true"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Drop Excel file here or{' '}
              <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-400">.xls or .xlsx · max {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </div>

      {validationError && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {validationError}
        </p>
      )}
    </div>
  )
}

export default FileUpload

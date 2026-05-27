/**
 * T172 - File upload/download service with presigned S3 URL handling
 */
import { apiClient } from '@services/api/client'
import type { CandidateDocument } from '@appTypes/candidate'

/**
 * Get presigned S3 URL for document download
 */
export const getPresignedDownloadUrl = async (documentId: string): Promise<string> => {
  const response = await apiClient.get<{ url: string }>(`/documents/${documentId}/presigned-url`)
  return response.data.url
}

/**
 * Download document from presigned S3 URL
 */
export const downloadDocument = async (doc: CandidateDocument): Promise<void> => {
  try {
    const url = await getPresignedDownloadUrl(doc.id)
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = doc.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
  } catch (err: unknown) {
    throw new Error('Failed to download document', {
      cause: err instanceof Error ? err : new Error(String(err))
    })
  }
}

/**
 * Upload document to presigned S3 URL
 */
export const uploadDocument = async (
  candidateId: string,
  file: File,
  docType: 'RESUME' | 'EMAIL' | 'FEEDBACK' | 'OTHER'
): Promise<CandidateDocument> => {
  try {
    // Step 1: Request presigned URL from backend
    const presignedResponse = await apiClient.post<{
      url: string
      s3Key: string
    }>(`/candidates/${candidateId}/documents/presigned-url`, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      documentType: docType,
    })

    const { url: presignedUrl, s3Key } = presignedResponse.data

    // Step 2: Upload file to S3 using presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error('S3 upload failed')
    }

    // Step 3: Notify backend that upload completed
    const finalResponse = await apiClient.post<CandidateDocument>(
      `/candidates/${candidateId}/documents`,
      {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentType: docType,
        s3Key,
      }
    )

    return finalResponse.data
  } catch (err: unknown) {
    throw new Error('Failed to upload document', {
      cause: err instanceof Error ? err : new Error(String(err))
    })
  }
}

/**
 * Validate file type for upload
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    }
  }
  return { valid: true }
}

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSizeBytes: number
): { valid: boolean; error?: string } => {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }
  return { valid: true }
}

/**
 * Decode base64 image for display
 */
export const decodeBase64Image = (base64: string, mimeType: string = 'image/jpeg'): string => {
  return `data:${mimeType};base64,${base64}`
}

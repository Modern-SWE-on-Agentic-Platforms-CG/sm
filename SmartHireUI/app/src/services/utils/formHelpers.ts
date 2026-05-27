/**
 * T161 - Form helper utilities for BU-specific conditional field rendering
 */

/**
 * Get BU-specific required fields for weekend drive form
 */
export const getBUSpecificFields = (bu: string): string[] => {
  switch (bu) {
    case 'SAP':
      return ['sapCapabilities']
    case 'GCCA':
      return ['gccaAccount']
    case 'Invent':
      return ['inventMeetingLink']
    default:
      return []
  }
}

/**
 * Validate BU-specific fields
 */
export const validateBUSpecificFields = (bu: string, data: Record<string, string | number | boolean>): { valid: boolean; error?: string } => {
  const requiredFields = getBUSpecificFields(bu)

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !(data[field] as string).trim())) {
      return {
        valid: false,
        error: `${field} is required for ${bu} BU`,
      }
    }
  }

  // SAP-specific validation
  if (bu === 'SAP' && data.sapCapabilities) {
    const validCapabilities = ['ABAP', 'FIFO', 'MM', 'SD', 'CO', 'HR', 'PS', 'QM']
    const capabilities = String(data.sapCapabilities).split(',').map((c: string) => c.trim().toUpperCase())
    if (!capabilities.some((c: string) => validCapabilities.includes(c))) {
      return {
        valid: false,
        error: 'Invalid SAP capabilities. Expected: ABAP, FIFO, MM, SD, CO, HR, PS, or QM',
      }
    }
  }

  // GCCA-specific validation
  if (bu === 'GCCA' && data.gccaRegion) {
    const validRegions = ['APAC', 'EMEA', 'AMERICAS', 'JP', 'AU']
    if (!validRegions.includes(String(data.gccaRegion).toUpperCase())) {
      return {
        valid: false,
        error: `Invalid GCCA region. Expected: ${validRegions.join(', ')}`,
      }
    }
  }

  // Invent-specific validation
  if (bu === 'Invent' && data.inventMeetingLink) {
    const urlPattern = /^https:\/\/(meet\.google\.com|zoom\.us|teams\.microsoft\.com)\//
    if (!urlPattern.test(String(data.inventMeetingLink))) {
      return {
        valid: false,
        error: 'Invalid meeting link. Expected Google Meet, Zoom, or Teams link',
      }
    }
  }

  return { valid: true }
}

/**
 * Get field labels for BU-specific fields
 */
export const getBUFieldLabels = (bu: string): Record<string, string> => {
  const baseLabels = {
    name: 'Full Name',
    contact: 'Contact Number',
    email: 'Email Address',
    gender: 'Gender',
    experience: 'Years of Experience',
    skill: 'Primary Skill',
    timeSlot: 'Preferred Interview Slot',
    interviewType: 'Interview Type',
  }

  switch (bu) {
    case 'SAP':
      return { ...baseLabels, sapCapabilities: 'SAP Modules (comma-separated)' }
    case 'GCCA':
      return { ...baseLabels, gccaAccount: 'GCCA Account ID', gccaRegion: 'GCCA Region' }
    case 'Invent':
      return { ...baseLabels, inventMeetingLink: 'Meeting Link (Google Meet/Zoom/Teams)' }
    default:
      return baseLabels
  }
}

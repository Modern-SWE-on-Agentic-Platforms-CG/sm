/**
 * T071 - Candidate domain unit tests
 */
import { describe, it, expect } from 'vitest'
import {
  CandidateStatus,
  CandidateSource,
  type Candidate,
  type CandidateFilter,
  type UploadResult,
  type CandidateComment,
} from '@appTypes/candidate'

describe('Candidate Types', () => {
  it('should define all CandidateStatus enum values', () => {
    expect(CandidateStatus.APPLIED).toBe('APPLIED')
    expect(CandidateStatus.SHORTLISTED).toBe('SHORTLISTED')
    expect(CandidateStatus.INTERVIEW_SCHEDULED).toBe('INTERVIEW_SCHEDULED')
    expect(CandidateStatus.INTERVIEWED).toBe('INTERVIEWED')
    expect(CandidateStatus.SELECTED).toBe('SELECTED')
    expect(CandidateStatus.REJECTED).toBe('REJECTED')
    expect(CandidateStatus.HOLD).toBe('HOLD')
    expect(CandidateStatus.WITHDRAWN).toBe('WITHDRAWN')
  })

  it('should define CandidateSource enum values', () => {
    expect(CandidateSource.NAUKRI).toBe('NAUKRI')
    expect(CandidateSource.LINKEDIN).toBe('LINKEDIN')
    expect(CandidateSource.REFERRAL).toBe('REFERRAL')
    expect(CandidateSource.DIRECT).toBe('DIRECT')
    expect(CandidateSource.CAMPUS).toBe('CAMPUS')
  })

  it('should create valid Candidate object', () => {
    const candidate: Candidate = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      contact: '+91 9999999999',
      technology: 'Java',
      experience: 5,
      bu: 'EAS',
      source: CandidateSource.LINKEDIN,
      status: CandidateStatus.SHORTLISTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
    expect(candidate.name).toBe('John Doe')
    expect(candidate.status).toBe(CandidateStatus.SHORTLISTED)
  })

  it('should create valid CandidateFilter', () => {
    const filter: CandidateFilter = {
      technology: ['Java', 'Python'],
      bu: ['EAS'],
      status: ['SHORTLISTED', 'INTERVIEWED'],
      search: 'John',
      page: 1,
      pageSize: 10,
    }
    expect(filter.technology).toContain('Java')
    expect(filter.search).toBe('John')
  })

  it('should create valid UploadResult', () => {
    const result: UploadResult = {
      totalRows: 10,
      successCount: 9,
      failureCount: 1,
      errors: [{ row: 5, field: 'email', message: 'Invalid email format' }],
    }
    expect(result.successCount + result.failureCount).toBe(result.totalRows)
  })

  it('should create valid CandidateComment', () => {
    const comment: CandidateComment = {
      id: '1',
      candidateId: '123',
      text: 'Good technical skills',
      createdBy: 'interviewer1@company.com',
      createdAt: new Date().toISOString(),
    }
    expect(comment.candidateId).toBe('123')
    expect(comment.text).toBe('Good technical skills')
  })
})

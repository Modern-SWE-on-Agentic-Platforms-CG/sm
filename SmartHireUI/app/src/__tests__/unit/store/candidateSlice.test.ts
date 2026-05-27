/**
 * T073 - Candidate slice and selectors tests
 */
import { describe, it, expect } from 'vitest'
import candidateReducer, {
  setFilter,
  setPage,
  setPageSize,
  clearSelected,
  clearError,
  type CandidateState,
} from '@store/slices/candidateSlice'
import {
  selectCandidateList,
  selectSelectedCandidate,
  selectCandidateTotalPages,
  selectCandidateIsLoading,
} from '@store/selectors/candidateSelectors'
import { CandidateStatus, CandidateSource } from '@appTypes/candidate'
import type { Candidate } from '@appTypes/candidate'
import type { RootState } from '@store/store'

describe('Candidate Slice', () => {
  const initialState: CandidateState = {
    list: [],
    selected: null,
    total: 0,
    page: 1,
    pageSize: 10,
    isLoading: false,
    isUploading: false,
    isExporting: false,
    error: null,
    uploadResult: null,
    filter: {},
  }

  const mockCandidate: Candidate = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    contact: '+91 9999999999',
    technology: 'Java',
    experience: 5,
    bu: 'EAS',
    source: CandidateSource.LINKEDIN,
    status: CandidateStatus.SHORTLISTED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z',
  }

  it('should return initial state', () => {
    const state = candidateReducer(undefined, { type: '' })
    expect(state.list).toEqual([])
    expect(state.page).toBe(1)
    expect(state.pageSize).toBe(10)
  })

  it('should handle setFilter', () => {
    const state = candidateReducer(initialState, setFilter({ technology: ['Java'] }))
    expect(state.filter.technology).toContain('Java')
    expect(state.page).toBe(1) // page resets on filter change
  })

  it('should handle setPage', () => {
    const state = candidateReducer(initialState, setPage(2))
    expect(state.page).toBe(2)
  })

  it('should handle setPageSize', () => {
    const state = candidateReducer(initialState, setPageSize(25))
    expect(state.pageSize).toBe(25)
    expect(state.page).toBe(1) // page resets on pageSize change
  })

  it('should handle clearSelected', () => {
    const stateWithSelected = { ...initialState, selected: mockCandidate }
    const state = candidateReducer(stateWithSelected, clearSelected())
    expect(state.selected).toBeNull()
  })

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' }
    const state = candidateReducer(stateWithError, clearError())
    expect(state.error).toBeNull()
  })
})

describe('Candidate Selectors', () => {
  it('should select candidate list from state', () => {
    const mockCandidate: Candidate = {
      id: '1',
      name: 'John',
      email: 'john@example.com',
      contact: '+91 9999999999',
      technology: 'Java',
      experience: 5,
      bu: 'EAS',
      source: CandidateSource.LINKEDIN,
      status: CandidateStatus.SHORTLISTED,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lastModified: '2024-01-01T00:00:00Z',
    }

    const mockState = {
      candidates: {
        list: [mockCandidate],
        selected: null,
        total: 100,
        page: 1,
        pageSize: 10,
        isLoading: false,
        isUploading: false,
        isExporting: false,
        error: null,
        uploadResult: null,
        filter: {},
      },
    } as unknown as RootState

    const list = selectCandidateList(mockState)
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('John')
  })

  it('should select total pages from state', () => {
    const mockState = {
      candidates: {
        list: [],
        selected: null,
        total: 100,
        page: 1,
        pageSize: 10,
        isLoading: false,
        isUploading: false,
        isExporting: false,
        error: null,
        uploadResult: null,
        filter: {},
      },
    } as unknown as RootState

    const pages = selectCandidateTotalPages(mockState)
    expect(pages).toBe(10) // 100 total / 10 per page
  })

  it('should select loading state from state', () => {
    const mockState = {
      candidates: {
        list: [],
        selected: null,
        total: 0,
        page: 1,
        pageSize: 10,
        isLoading: false,
        isUploading: false,
        isExporting: false,
        error: null,
        uploadResult: null,
        filter: {},
      },
    } as unknown as RootState

    const isLoading = selectCandidateIsLoading(mockState)
    expect(isLoading).toBe(false)
  })

  it('should select null when no selected candidate', () => {
    const mockState = {
      candidates: {
        list: [],
        selected: null,
        total: 0,
        page: 1,
        pageSize: 10,
        isLoading: false,
        isUploading: false,
        isExporting: false,
        error: null,
        uploadResult: null,
        filter: {},
      },
    } as unknown as RootState

    const selected = selectSelectedCandidate(mockState)
    expect(selected).toBeNull()
  })
})

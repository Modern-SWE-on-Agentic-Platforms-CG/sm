/**
 * PipelineScreen — main candidate management view
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import type { SortingState } from '@tanstack/react-table'
import {
  fetchCandidates,
  updateCandidateStatus,
  uploadCandidates,
  exportCandidates,
  setFilter,
  setPage,
  clearUploadResult,
  clearError,
} from '@store/slices/candidateSlice'
import {
  selectCandidateList,
  selectCandidateIsLoading,
  selectCandidateIsUploading,
  selectCandidateIsExporting,
  selectCandidateError,
  selectCandidateFilter,
  selectCandidatePage,
  selectCandidatePageSize,
  selectCandidateTotalPages,
  selectUploadResult,
} from '@store/selectors/candidateSelectors'
import { CandidateTable } from '@components/tables/CandidateTable'
import { FilterPanel } from '@components/forms/FilterPanel'
import { SearchInput } from '@components/forms/SearchInput'
import { FileUpload } from '@components/forms/FileUpload'
import type { CandidateFilter, CandidateStatus } from '@appTypes/candidate'

const PipelineScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  const candidates = useSelector(selectCandidateList)
  const isLoading = useSelector(selectCandidateIsLoading)
  const isUploading = useSelector(selectCandidateIsUploading)
  const isExporting = useSelector(selectCandidateIsExporting)
  const error = useSelector(selectCandidateError)
  const filter = useSelector(selectCandidateFilter)
  const page = useSelector(selectCandidatePage)
  const pageSize = useSelector(selectCandidatePageSize)
  const totalPages = useSelector(selectCandidateTotalPages)
  const uploadResult = useSelector(selectUploadResult)

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])

  // Keep a ref to the latest filter to avoid re-creating handleSearch on every filter change
  const filterRef = useRef(filter)
  useEffect(() => {
    filterRef.current = filter
  }, [filter])

  // Fetch on filter/page change
  useEffect(() => {
    dispatch(fetchCandidates({ ...filter, page, pageSize }))
  }, [dispatch, filter, page, pageSize])

  const handleSearch = useCallback(
    (search: string) => {
      dispatch(setFilter({ ...filterRef.current, search: search || undefined }))
    },
    [dispatch]
  )

  const handleFilterApply = useCallback(
    (newFilter: CandidateFilter) => {
      dispatch(setFilter(newFilter))
      setIsFilterOpen(false)
    },
    [dispatch]
  )

  const handleFilterReset = useCallback(() => {
    dispatch(setFilter({}))
    setIsFilterOpen(false)
  }, [dispatch])

  const handleStatusChange = useCallback(
    (id: string, status: CandidateStatus) => {
      dispatch(updateCandidateStatus({ id, status })).then(() => {
        dispatch(fetchCandidates({ ...filterRef.current, page, pageSize }))
      })
    },
    [dispatch, page, pageSize]
  )

  const handleUpload = useCallback(
    (file: File) => {
      dispatch(uploadCandidates(file)).then(() => {
        dispatch(fetchCandidates({ ...filter, page, pageSize }))
      })
    },
    [dispatch, filter, page, pageSize]
  )

  const handleExport = useCallback(() => {
    dispatch(exportCandidates(filter))
  }, [dispatch, filter])

  const handleRowClick = useCallback(() => {
    // TODO: open candidate detail drawer/modal
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Candidate Pipeline</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isExporting ? (
              <span className="animate-spin inline-block w-4 h-4 border-b-2 border-blue-600 rounded-full" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Export
          </button>
        </div>
      </div>

      {/* Upload panel */}
      {isUploadOpen && (
        <div className="mt-3 mb-2">
          <FileUpload onUpload={handleUpload} isUploading={isUploading} />
          {uploadResult && (
            <div className="mt-2 text-xs p-2 rounded bg-green-50 border border-green-200 text-green-700">
              Upload complete: {uploadResult.successCount} added
              {uploadResult.failureCount > 0 && `, ${uploadResult.failureCount} failed`}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 my-3">
        <SearchInput
          onSearch={handleSearch}
          className="flex-1 max-w-sm"
        />
        <button
          onClick={() => setIsFilterOpen((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg ${
            isFilterOpen ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mb-3 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between"
        >
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Upload result */}
      {uploadResult && !isUploadOpen && (
        <div className="mb-3 px-3 py-2 text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between">
          <span>
            Last upload: {uploadResult.successCount} added
            {uploadResult.failureCount > 0 && `, ${uploadResult.failureCount} failed`}
          </span>
          <button onClick={() => dispatch(clearUploadResult())} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Filter panel */}
        {isFilterOpen && (
          <div className="flex-shrink-0">
            <FilterPanel
              filter={filter}
              onApply={handleFilterApply}
              onReset={handleFilterReset}
            />
          </div>
        )}

        {/* Table + pagination */}
        <div className="flex-1 flex flex-col min-w-0">
          <CandidateTable
            candidates={candidates}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onRowClick={handleRowClick}
            sorting={sorting}
            onSortingChange={setSorting}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch(setPage(page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => dispatch(setPage(page + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PipelineScreen

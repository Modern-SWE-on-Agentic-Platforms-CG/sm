/**
 * CandidateTable — paginated, sortable candidate list using @tanstack/react-table
 */
import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import type { Candidate, CandidateStatus } from '@appTypes/candidate'
import { CandidateStatusBadge } from './CandidateStatusBadge'

interface CandidateTableProps {
  candidates: Candidate[]
  isLoading?: boolean
  onStatusChange?: (id: string, status: CandidateStatus) => void
  onRowClick?: (candidate: Candidate) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  isLoading = false,
  onStatusChange,
  onRowClick,
  sorting = [],
  onSortingChange,
}) => {
  const AVAILABLE_STATUSES: CandidateStatus[] = [
    'APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED',
    'SELECTED', 'REJECTED', 'HOLD', 'WITHDRAWN',
  ] as CandidateStatus[]

  const columns: ColumnDef<Candidate>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-blue-600 truncate max-w-xs block">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'technology',
      header: 'Technology',
    },
    {
      accessorKey: 'experience',
      header: 'Exp (yrs)',
      cell: ({ getValue }) => {
        const years = getValue<number>()
        return years === 0 ? 'Fresher' : `${years}y`
      },
    },
    {
      accessorKey: 'bu',
      header: 'BU',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row, getValue }) => {
        const status = getValue<CandidateStatus>()
        if (onStatusChange) {
          return (
            <select
              value={status}
              onChange={(e) =>
                onStatusChange(row.original.id, e.target.value as CandidateStatus)
              }
              onClick={(e) => e.stopPropagation()}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            >
              {AVAILABLE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          )
        }
        return <CandidateStatusBadge status={status} />
      },
    },
    {
      accessorKey: 'agingDays',
      header: 'Aging',
      cell: ({ getValue }) => {
        const days = getValue<number | undefined>()
        if (days == null) return '-'
        const color = days > 30 ? 'text-red-600' : days > 14 ? 'text-yellow-600' : 'text-green-600'
        return <span className={`font-medium ${color}`}>{days}d</span>
      },
    },
    {
      accessorKey: 'lastModified',
      header: 'Last Modified',
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>())
        return <span className="text-gray-500 text-xs">{date.toLocaleDateString()}</span>
      },
    },
  ]

  const table = useReactTable({
    data: candidates,
    columns,
    state: { sorting },
    onSortingChange: onSortingChange
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(sorting) : updater
          onSortingChange(next)
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No candidates found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' ↑'}
                    {header.column.getIsSorted() === 'desc' && ' ↓'}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={`hover:bg-blue-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CandidateTable

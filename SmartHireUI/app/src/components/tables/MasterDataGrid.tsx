/**
 * MasterDataGrid — generic grid for any admin category
 */
import React from 'react'
import type { MasterRecord, DataCategory } from '@appTypes/admin'

interface MasterDataGridProps {
  category: DataCategory
  records: MasterRecord[]
  isLoading: boolean
  onAdd: () => void
  onEdit: (record: MasterRecord) => void
  onDelete: (record: MasterRecord) => void
}

export const MasterDataGrid: React.FC<MasterDataGridProps> = ({
  records,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Derive column keys from first record
  const columns = records.length > 0
    ? Object.keys(records[0].data ?? {})
    : []

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={onAdd}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add
        </button>
      </div>

      {records.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-12">No records found. Click Add to create one.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3">
                      {String(record.data[col] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(record)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                        aria-label={`Edit record ${record.id}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(record)}
                        disabled={record.inUse}
                        title={record.inUse ? 'Cannot delete, record is in use' : 'Delete'}
                        className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Delete record ${record.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

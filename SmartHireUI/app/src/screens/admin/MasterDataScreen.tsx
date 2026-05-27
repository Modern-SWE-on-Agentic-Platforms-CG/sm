/**
 * MasterDataScreen — sidebar category list + grid view
 */
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import {
  loadCategory,
  createRecord,
  editRecord,
  removeRecord,
  setSelectedCategory,
  clearError,
} from '@store/slices/adminSlice'
import {
  selectSelectedCategory,
  selectAdminRecords,
  selectAdminIsLoading,
  selectAdminIsSaving,
  selectAdminError,
} from '@store/selectors/adminSelectors'
import { CategorySidebar } from '@components/common/CategorySidebar'
import { MasterDataGrid } from '@components/tables/MasterDataGrid'
import { MasterDataForm } from '@components/forms/MasterDataForm'
import type { DataCategory, MasterRecord, FieldSchema } from '@appTypes/admin'

// Default 2-field schema — real app would load from backend per category
const DEFAULT_FIELDS: FieldSchema[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'text', required: false },
]

const MasterDataScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const selectedCategory = useSelector(selectSelectedCategory)
  const records = useSelector(selectAdminRecords)
  const isLoading = useSelector(selectAdminIsLoading)
  const isSaving = useSelector(selectAdminIsSaving)
  const error = useSelector(selectAdminError)

  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<MasterRecord | null>(null)

  useEffect(() => {
    if (selectedCategory) {
      dispatch(loadCategory({ category: selectedCategory }))
    }
  }, [dispatch, selectedCategory])

  const handleSelectCategory = useCallback(
    (cat: DataCategory) => dispatch(setSelectedCategory(cat)),
    [dispatch]
  )

  const handleAdd = useCallback(() => {
    setEditTarget(null)
    setFormMode('add')
  }, [])

  const handleEdit = useCallback((record: MasterRecord) => {
    setEditTarget(record)
    setFormMode('edit')
  }, [])

  const handleDelete = useCallback(
    (record: MasterRecord) => {
      if (record.inUse) return
      if (confirm(`Delete this record?`)) {
        dispatch(removeRecord({ category: record.category, id: record.id }))
      }
    },
    [dispatch]
  )

  const handleFormSubmit = useCallback(
    async (data: Record<string, string | number>) => {
      if (!selectedCategory) return
      if (formMode === 'add') {
        await dispatch(createRecord({ category: selectedCategory, data }))
      } else if (formMode === 'edit' && editTarget) {
        await dispatch(editRecord({ category: selectedCategory, id: editTarget.id, data }))
      }
      setFormMode(null)
    },
    [dispatch, selectedCategory, formMode, editTarget]
  )

  return (
    <div className="flex h-full">
      <CategorySidebar selected={selectedCategory} onSelect={handleSelectCategory} />

      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {selectedCategory ? selectedCategory.replace(/_/g, ' ') : 'Master Data'}
          </h1>
        </div>

        {error && (
          <div role="alert" className="mb-4 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())} className="font-bold">&times;</button>
          </div>
        )}

        {!selectedCategory ? (
          <p className="text-gray-500 text-sm">Select a category from the sidebar.</p>
        ) : (
          <MasterDataGrid
            category={selectedCategory}
            records={records}
            isLoading={isLoading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add / Edit modal */}
      {formMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              {formMode === 'add' ? 'Add Record' : 'Edit Record'}
            </h2>
            <MasterDataForm
              fields={DEFAULT_FIELDS}
              initialValues={editTarget?.data}
              onSubmit={handleFormSubmit}
              onCancel={() => setFormMode(null)}
              isSaving={isSaving}
              isEdit={formMode === 'edit'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MasterDataScreen

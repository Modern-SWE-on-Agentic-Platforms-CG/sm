/**
 * MasterDataForm — dynamic add/edit form based on category schema
 */
import React, { useState } from 'react'
import type { FieldSchema } from '@appTypes/admin'

interface MasterDataFormProps {
  fields: FieldSchema[]
  initialValues?: Record<string, string | number>
  onSubmit: (data: Record<string, string | number>) => void
  onCancel: () => void
  isSaving?: boolean
  isEdit?: boolean
}

export const MasterDataForm: React.FC<MasterDataFormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  isSaving = false,
  isEdit = false,
}) => {
  const [values, setValues] = useState<Record<string, string | number>>(
    Object.fromEntries(fields.map((f) => [f.name, initialValues[f.name] ?? '']))
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    for (const field of fields) {
      if (field.required && !String(values[field.name]).trim()) {
        newErrors[field.name] = `${field.label} is required`
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.type === 'select' ? (
            <select
              id={field.name}
              value={String(values[field.name])}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              type={field.type}
              value={String(values[field.name])}
              onChange={(e) => setValues((v) => ({
                ...v,
                [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value,
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          )}
          {errors[field.name] && (
            <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : isEdit ? 'Update' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

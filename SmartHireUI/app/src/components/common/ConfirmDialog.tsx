import React from 'react'
import { useAppDispatch } from '@store/store'
import { closeModal, removeModal } from '@store/slices/uiSlice'

interface ConfirmDialogProps {
  modalId: string
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  isDangerous?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  modalId,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-blue-600 hover:bg-blue-700',
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}) => {
  const dispatch = useAppDispatch()

  const handleConfirm = async () => {
    try {
      await onConfirm()
      dispatch(removeModal(modalId))
    } catch (error) {
      console.error('Dialog action failed:', error)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    dispatch(closeModal(modalId))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              isDangerous ? 'bg-red-600 hover:bg-red-700' : confirmButtonClass
            }`}
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

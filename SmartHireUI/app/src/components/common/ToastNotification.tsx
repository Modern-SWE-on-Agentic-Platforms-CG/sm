import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@store/store'
import { selectToasts } from '@store/selectors/uiSelectors'
import { removeToast } from '@store/slices/uiSlice'
import type { Toast } from '@store/slices/uiSlice'

const toastTypeStyles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
}

const toastIconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, onRemove])

  return (
    <div
      className={`border rounded-lg p-4 shadow-lg flex items-start gap-3 ${
        toastTypeStyles[toast.type]
      }`}
      role="alert"
    >
      <svg
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          toastIconColors[toast.type]
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-lg font-semibold opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  )
}

export const ToastNotification: React.FC = () => {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector(selectToasts)

  const handleRemove = (id: string) => {
    dispatch(removeToast(id))
  }

  return (
    <div
      className="fixed bottom-4 right-4 max-w-md z-50 space-y-3"
      role="region"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={handleRemove}
        />
      ))}
    </div>
  )
}

export default ToastNotification

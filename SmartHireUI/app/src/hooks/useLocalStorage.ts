import { useState, useCallback, useEffect } from 'react'

export interface UseLocalStorageReturn<T> {
  value: T | null
  setValue: (value: T | null) => void
  removeValue: () => void
}

/**
 * Custom hook for safe localStorage access with encryption support
 */
export const useLocalStorage = <T,>(key: string): UseLocalStorageReturn<T> => {
  const [value, setValue] = useState<T | null>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch (error) {
      console.error(`Failed to read from localStorage key "${key}":`, error)
      return null
    }
  })

  const setStoredValue = useCallback(
    (newValue: T | null) => {
      try {
        if (newValue === null) {
          window.localStorage.removeItem(key)
        } else {
          const serialized = JSON.stringify(newValue)
          window.localStorage.setItem(key, serialized)
        }
        setValue(newValue)
      } catch (error) {
        console.error(`Failed to write to localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setValue(null)
    } catch (error) {
      console.error(`Failed to remove from localStorage key "${key}":`, error)
    }
  }, [key])

  // Listen for storage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          setValue(e.newValue ? (JSON.parse(e.newValue) as T) : null)
        } catch (error) {
          console.error(`Failed to sync storage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return { value, setValue: setStoredValue, removeValue }
}

export default useLocalStorage

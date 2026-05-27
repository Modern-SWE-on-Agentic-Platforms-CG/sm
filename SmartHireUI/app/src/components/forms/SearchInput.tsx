/**
 * SearchInput — debounced text search input
 */
import React, { useState } from 'react'
import { useDebounce } from '@hooks/useDebounce'

interface SearchInputProps {
  placeholder?: string
  onSearch: (value: string) => void
  debounceMs?: number
  className?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search candidates...',
  onSearch,
  debounceMs = 400,
  className = '',
}) => {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, debounceMs)

  // Trigger search when debounced value changes
  React.useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-3 text-gray-400 pointer-events-none">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search"
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchInput

/**
 * CategorySidebar — left sidebar for admin category selection
 */
import React from 'react'
import { DataCategory, CATEGORY_LABELS } from '@appTypes/admin'

interface CategorySidebarProps {
  selected: DataCategory | null
  onSelect: (category: DataCategory) => void
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ selected, onSelect }) => {
  return (
    <nav className="w-56 flex-shrink-0 bg-white border-r border-gray-200 py-4 overflow-y-auto">
      <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2 tracking-wide">Categories</p>
      <ul>
        {Object.values(DataCategory).map((cat) => (
          <li key={cat}>
            <button
              onClick={() => onSelect(cat)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                selected === cat
                  ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * ChangeRolesScreen — employee email search + role update form
 */
import React, { useCallback, useState } from 'react'
import { searchEmployee, updateEmployeeRoles } from '@services/api/admin'

const AVAILABLE_ROLES = [
  'Interviewer', 'Recruiter', 'PMO', 'Lead', 'Tower Lead', 'SL-BU Lead',
  'NA Lead', 'Recruiter Lead', 'Practice Lead', 'BU Admin', 'Practice Admin',
  'Admin', 'SuperUser',
]

const ChangeRolesScreen: React.FC = () => {
  const [emailQuery, setEmailQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ email: string; name: string; bu: string; roles: string[] }[]>([])
  const [selected, setSelected] = useState<{ email: string; name: string; bu: string; roles: string[] } | null>(null)
  const [newRoles, setNewRoles] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = useCallback(async (val: string) => {
    setEmailQuery(val)
    if (val.length >= 3) {
      try {
        const results = await searchEmployee(val)
        setSuggestions(results)
      } catch {
        setSuggestions([])
      }
    } else {
      setSuggestions([])
    }
  }, [])

  const handleSelect = useCallback((emp: typeof suggestions[0]) => {
    setSelected(emp)
    setNewRoles(emp.roles)
    setSuggestions([])
    setEmailQuery(emp.email)
    setSuccess(false)
    setError('')
  }, [])

  const toggleRole = useCallback((role: string) => {
    setNewRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selected) return
      setIsSaving(true)
      try {
        await updateEmployeeRoles({ employeeEmail: selected.email, bu: selected.bu, newRoles })
        setSuccess(true)
        setSelected(null)
        setEmailQuery('')
        setNewRoles([])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Update failed')
      } finally {
        setIsSaving(false)
      }
    },
    [selected, newRoles]
  )

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Change Roles</h1>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          Roles updated successfully.
        </div>
      )}
      {error && (
        <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Email search */}
      <div className="relative mb-6">
        <label htmlFor="empEmail" className="block text-sm font-medium text-gray-700 mb-1">Employee Email</label>
        <input
          id="empEmail"
          type="text"
          value={emailQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by email…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((s) => (
              <li key={s.email}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50"
                >
                  {s.name} <span className="text-gray-400">({s.email})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BU</label>
            <input value={selected.bu} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || newRoles.length === 0}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Update Roles'}
          </button>
        </form>
      )}
    </div>
  )
}

export default ChangeRolesScreen

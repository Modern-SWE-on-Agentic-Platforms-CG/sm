/**
 * Admin HTTP API client — mapped to actual backend paths
 */
import { apiClient } from './client'
import type { DataCategory, MasterRecord, DemandSupplyRow, EmployeeRoleUpdate } from '@appTypes/admin'
import type { PaginatedResponse } from './types'

/** Map frontend DataCategory names to backend lookup entity keys */
const categoryToLookupEntity = (category: DataCategory): string | null => {
  const map: Record<string, string> = {
    tower: 'tower',
    grade: 'grade',
    bu: 'bu',
    bu_account: 'bu',
    practice: 'practice',
    technology: 'technology',
    skill: 'technology',
    skillgroup: 'skillGroup',
    skill_group: 'skillGroup',
    status: 'status',
    role: 'role',
    account: 'account',
    location: 'location',
    interviewtype: 'interviewType',
    interview_type: 'interviewType',
    source: 'source',
    rejectionreason: 'rejectionReason',
    rejection_reason: 'rejectionReason',
    declinereason: 'declineReason',
    decline_reason: 'declineReason',
    benchstatus: 'benchStatus',
    bench_status: 'benchStatus',
  }
  return map[category.toLowerCase()] ?? null
}

/** Fetch all records for a category
 *  Backend: GET /lookup/{entity}
 */
export async function fetchCategory(
  category: DataCategory,
  _params?: { page?: number; pageSize?: number }
): Promise<PaginatedResponse<MasterRecord>> {
  const entity = categoryToLookupEntity(category)
  if (!entity) {
    return { items: [], total: 0, page: 0, pageSize: 0 }
  }
  const res = await apiClient.get(`/lookup/${entity}`)
  const raw = res.data as unknown as { response?: Record<string, unknown>[]; data?: Record<string, unknown>[] }
  const rawItems: Record<string, unknown>[] = raw.response ?? raw.data ?? (Array.isArray(res.data) ? (res.data as unknown as Record<string, unknown>[]) : [])
  const items: MasterRecord[] = rawItems.map((row) => {
    const { id, created_date, updated_date, ...rest } = row as Record<string, unknown>
    return {
      id: String(id ?? ''),
      category,
      data: rest as Record<string, string | number>,
      createdAt: String(created_date ?? ''),
      updatedAt: String(updated_date ?? ''),
    }
  })
  return { items, total: items.length, page: 0, pageSize: items.length }
}

/** Add a new record — POST /lookup/{entity} */
export async function addRecord(
  category: DataCategory,
  data: Record<string, string | number>
): Promise<MasterRecord> {
  const entity = categoryToLookupEntity(category)
  if (!entity) throw new Error(`No lookup entity for category: ${category}`)
  const res = await apiClient.post(`/lookup/${entity}`, data)
  const raw = res.data as unknown as { response?: unknown[] }
  const row = (raw.response?.[0] ?? {}) as Record<string, unknown>
  const { id, created_date, updated_date, ...rest } = row
  return { id: String(id ?? ''), category, data: rest, createdAt: String(created_date ?? ''), updatedAt: String(updated_date ?? '') }
}

/** Update an existing record — PUT /lookup/{entity}/{id} */
export async function updateRecord(
  category: DataCategory,
  recordId: string,
  data: Record<string, string | number>
): Promise<MasterRecord> {
  const entity = categoryToLookupEntity(category)
  if (!entity) throw new Error(`No lookup entity for category: ${category}`)
  const res = await apiClient.put(`/lookup/${entity}/${recordId}`, data)
  const raw = res.data as unknown as { response?: unknown[] }
  const row = (raw.response?.[0] ?? {}) as Record<string, unknown>
  const { id, created_date, updated_date, ...rest } = row
  return { id: String(id ?? ''), category, data: rest, createdAt: String(created_date ?? ''), updatedAt: String(updated_date ?? '') }
}

/** Delete a record — DELETE /lookup/{entity}/{id} */
export async function deleteRecord(category: DataCategory, recordId: string): Promise<void> {
  const entity = categoryToLookupEntity(category)
  if (!entity) throw new Error(`No lookup entity for category: ${category}`)
  await apiClient.delete(`/lookup/${entity}/${recordId}`)
}

/** Get demand vs supply data
 *  Backend: GET /demandScreen/getDemandInfo
 */
export async function getDemandSupply(): Promise<DemandSupplyRow[]> {
  const res = await apiClient.get<{ data: DemandSupplyRow[] }>('/demandScreen/getDemandInfo')
  const raw = res.data as unknown as { data?: DemandSupplyRow[] }
  return raw.data ?? []
}

/** Search employees by email (for role change)
 *  Backend: GET /keycloak/getUserDetails (closest equivalent)
 */
export async function searchEmployee(email: string): Promise<{ email: string; name: string; bu: string; roles: string[] }[]> {
  const res = await apiClient.get('/keycloak/getUserDetails', { params: { email } })
  const raw = res.data as unknown as { data?: { email: string; name: string; bu: string; roles: string[] }[] }
  return raw.data ?? []
}

/** Update employee roles
 *  Backend: POST /users/updateAssignedRole
 */
export async function updateEmployeeRoles(payload: EmployeeRoleUpdate): Promise<void> {
  await apiClient.post('/users/updateAssignedRole', payload)
}

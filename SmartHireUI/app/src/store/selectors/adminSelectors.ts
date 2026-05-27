/**
 * Admin selectors
 */
import type { RootState } from '@store/store'

export const selectSelectedCategory = (state: RootState) => state.admin.selectedCategory
export const selectAdminRecords = (state: RootState) => state.admin.records
export const selectDemandSupply = (state: RootState) => state.admin.demandSupply
export const selectAdminIsLoading = (state: RootState) => state.admin.isLoading
export const selectAdminIsSaving = (state: RootState) => state.admin.isSaving
export const selectAdminError = (state: RootState) => state.admin.error
export const selectAdminTotal = (state: RootState) => state.admin.total
export const selectAdminPage = (state: RootState) => state.admin.page
export const selectAdminPageSize = (state: RootState) => state.admin.pageSize
export const selectAdminTotalPages = (state: RootState) =>
  Math.ceil(state.admin.total / state.admin.pageSize)
export const selectRecordInUse = (id: string) => (state: RootState) =>
  state.admin.records.find((r) => r.id === id)?.inUse ?? false

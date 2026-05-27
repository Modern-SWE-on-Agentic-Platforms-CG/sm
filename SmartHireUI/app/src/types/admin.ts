/**
 * Admin / Master Data domain types
 */

export enum DataCategory {
  TOWER = 'TOWER',
  SKILL = 'SKILL',
  SKILL_GROUP = 'SKILL_GROUP',
  SOURCE = 'SOURCE',
  VENDOR = 'VENDOR',
  ROLE_COMMENT = 'ROLE_COMMENT',
  FEEDBACK_FORM = 'FEEDBACK_FORM',
  PMO_DL_SKILL_MAPPING = 'PMO_DL_SKILL_MAPPING',
  APPROVER_DL_MAPPING = 'APPROVER_DL_MAPPING',
  BU_ACCOUNT = 'BU_ACCOUNT',
  DEMAND_TYPE = 'DEMAND_TYPE',
  ACCOUNT_REGION_MAPPING = 'ACCOUNT_REGION_MAPPING',
}

export const CATEGORY_LABELS: Record<DataCategory, string> = {
  [DataCategory.TOWER]: 'Tower',
  [DataCategory.SKILL]: 'Skill',
  [DataCategory.SKILL_GROUP]: 'Skill Group',
  [DataCategory.SOURCE]: 'Source',
  [DataCategory.VENDOR]: 'Vendor',
  [DataCategory.ROLE_COMMENT]: 'Role Comment',
  [DataCategory.FEEDBACK_FORM]: 'Feedback Form',
  [DataCategory.PMO_DL_SKILL_MAPPING]: 'PMO DL Skill Mapping',
  [DataCategory.APPROVER_DL_MAPPING]: 'Approver DL Mapping',
  [DataCategory.BU_ACCOUNT]: 'BU Account',
  [DataCategory.DEMAND_TYPE]: 'Demand Type',
  [DataCategory.ACCOUNT_REGION_MAPPING]: 'Account Region Mapping',
}

export interface FieldSchema {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'email'
  required: boolean
  options?: string[]
}

export interface CategorySchema {
  category: DataCategory
  fields: FieldSchema[]
}

export interface MasterRecord {
  id: string
  category: DataCategory
  data: Record<string, string | number>
  createdAt: string
  updatedAt: string
  inUse?: boolean
}

export interface AdminActions {
  canAdd: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface DemandSupplyRow {
  bu: string
  practice: string
  skill: string
  openDemand: number
  activeCandidates: number
  gap: number
}

export interface EmployeeRoleUpdate {
  employeeEmail: string
  bu: string
  newRoles: string[]
}

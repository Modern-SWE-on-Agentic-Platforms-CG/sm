/**
 * Workflow approval domain types
 */

export enum ApprovalStage {
  TOWER_LEAD = 'TOWER_LEAD',
  SL_BU_LEAD = 'SL_BU_LEAD',
  NA_LEAD = 'NA_LEAD',
  RECRUITER_LEAD = 'RECRUITER_LEAD',
}

export enum ApprovalDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HELD = 'HELD',
  PENDING = 'PENDING',
}

export interface WorkflowCandidate {
  candidateId: string
  candidateName: string
  technology: string
  bu: string
  experience: number
  currentStage: ApprovalStage
  currentDecision: ApprovalDecision
  submittedAt: string
  submittedBy: string
}

export interface WorkflowApproval {
  id: string
  candidateId: string
  stage: ApprovalStage
  approverId: string
  approverName: string
  decision: ApprovalDecision
  comments?: string
  timestamp: string
}

export interface ApprovalHistory {
  candidateId: string
  candidateName: string
  stages: WorkflowApproval[]
}

export interface ApprovalAction {
  candidateIds: string[]
  decision: ApprovalDecision.APPROVED | ApprovalDecision.REJECTED | ApprovalDecision.HELD
  comments?: string   // mandatory for REJECTED
}

export interface WorkflowFilter {
  stage?: ApprovalStage
  decision?: ApprovalDecision
  bu?: string
  page?: number
  pageSize?: number
}

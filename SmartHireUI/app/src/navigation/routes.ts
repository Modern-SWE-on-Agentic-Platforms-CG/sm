import { lazy } from 'react'
import { UserRole } from '@services/auth/roleService'

/**
 * Route definitions with lazy loading for code splitting
 */

// Lazy load route components
const LoginScreen = lazy(() => import('@screens/auth/LoginScreen'))
const DashboardScreen = lazy(() => import('@screens/scheduling/DashboardScreen'))
const PipelineScreen = lazy(() => import('@screens/candidate/PipelineScreen'))
const CandidateDetailsScreen = lazy(() => import('@screens/candidate/CandidateDetailsScreen'))
const BookingFormScreen = lazy(() => import('@screens/scheduling/BookingFormScreen'))
const BookingViewScreen = lazy(() => import('@screens/scheduling/BookingViewScreen'))
const FeedbackFormScreen = lazy(() => import('@screens/feedback/FeedbackFormScreen'))
const WorkflowScreen = lazy(() => import('@screens/workflow/WorkflowScreen'))
const WorkflowInfoScreen = lazy(() => import('@screens/workflow/WorkflowInfoScreen'))
const MasterDataScreen = lazy(() => import('@screens/admin/MasterDataScreen'))
const ChangeRolesScreen = lazy(() => import('@screens/admin/ChangeRolesScreen'))
const DemandSupplyScreen = lazy(() => import('@screens/admin/DemandSupplyScreen'))
const ReferralRegisterScreen = lazy(() => import('@screens/referral/ReferralRegisterScreen'))
const ReferralFormScreen = lazy(() => import('@screens/referral/ReferralFormScreen'))
const RefCandidateDetailsScreen = lazy(() => import('@screens/referral/RefCandidateDetailsScreen'))
const CandidateReferralScreen = lazy(() => import('@screens/referral/CandidateReferralScreen'))
const SelectRejectScreen = lazy(() => import('@screens/reports/SelectRejectScreen'))
const PanelInsightsScreen = lazy(() => import('@screens/reports/PanelInsightsScreen'))
const TrendChartScreen = lazy(() => import('@screens/reports/TrendChartScreen'))
const WeekendDriveScreen = lazy(() => import('@screens/candidate/WeekendDriveScreen'))
const TodoListScreen = lazy(() => import('@screens/candidate/TodoListScreen'))

export interface RouteConfig {
  path: string
  element: React.ComponentType<object> | React.ReactElement
  label: string
  requiredRoles?: string[]
  children?: RouteConfig[]
}

export const routes: RouteConfig[] = [
  // Auth routes
  {
    path: '/home',
    element: LoginScreen,
    label: 'Login',
  },

  // Dashboard
  {
    path: '/dashboard',
    element: DashboardScreen,
    label: 'Dashboard',
    requiredRoles: ['INTERVIEWER', 'RECRUITER', 'PMO'],
  },

  // Candidate management
  {
    path: '/candidates',
    element: PipelineScreen,
    label: 'Pipeline',
    requiredRoles: ['RECRUITER', 'PMO'],
  },
  {
    path: '/candidates/weekend-drive',
    element: WeekendDriveScreen,
    label: 'Weekend Drive',
    requiredRoles: ['RECRUITER'],
  },
  {
    path: '/todo-list',
    element: TodoListScreen,
    label: 'To-Do List',
    requiredRoles: ['RECRUITER', 'INTERVIEWER'],
  },
  {
      path: '/candidates/:id',
      element: CandidateDetailsScreen,
      label: 'Candidate Details',
      requiredRoles: ['RECRUITER', 'PMO', 'INTERVIEWER'],
  },

  // Scheduling
  {
    path: '/booking/form',
    element: BookingFormScreen,
    label: 'Booking Form',
    requiredRoles: ['RECRUITER', 'INTERVIEWER'],
  },
  {
    path: '/booking/view',
    element: BookingViewScreen,
    label: 'Booking View',
    requiredRoles: ['RECRUITER', 'INTERVIEWER'],
  },

  // Feedback
  {
    path: '/feedback',
    element: FeedbackFormScreen,
    label: 'Feedback',
    requiredRoles: ['INTERVIEWER'],
  },

  // Workflow
  {
    path: '/workflow',
    element: WorkflowScreen,
    label: 'Approvals',
    requiredRoles: ['TOWER_LEAD', 'SL_BU_LEAD', 'NA_LEAD', 'RECRUITER_LEAD'],
  },
  {
    path: '/workflow/:id',
    element: WorkflowInfoScreen,
    label: 'Approval Details',
    requiredRoles: ['TOWER_LEAD', 'SL_BU_LEAD', 'NA_LEAD', 'RECRUITER_LEAD'],
  },

  // Admin
  {
    path: '/admin/master-data',
    element: MasterDataScreen,
    label: 'Master Data',
    requiredRoles: ['ADMIN', 'BU_ADMIN'],
  },
  {
    path: '/admin/roles',
    element: ChangeRolesScreen,
    label: 'Change Roles',
    requiredRoles: ['ADMIN'],
  },
  {
    path: '/admin/demand-supply',
    element: DemandSupplyScreen,
    label: 'Demand & Supply',
    requiredRoles: ['ADMIN', 'BU_ADMIN'],
  },

  // Referral
  {
    path: '/referral/register',
    element: ReferralRegisterScreen,
    label: 'Referral Registration',
    requiredRoles: ['SPOC'],
  },
  {
    path: '/referral/form',
    element: ReferralFormScreen,
    label: 'Referral Form',
    requiredRoles: ['SPOC'],
  },
  {
    path: '/referral/my-candidates',
    element: RefCandidateDetailsScreen,
    label: 'My Referrals',
    requiredRoles: ['SPOC'],
  },
  {
    path: '/referral/all-candidates',
    element: CandidateReferralScreen,
    label: 'All Referrals',
    requiredRoles: ['ADMIN'],
  },

  // Reports
  {
    path: '/reports/rejection-ratio',
    element: SelectRejectScreen,
    label: 'Rejection Ratio',
    requiredRoles: ['RECRUITER_LEAD', 'ADMIN'],
  },
  {
    path: '/reports/panel-insights',
    element: PanelInsightsScreen,
    label: 'Panel Insights',
    requiredRoles: ['RECRUITER_LEAD', 'ADMIN'],
  },
  {
    path: '/reports/trends',
    element: TrendChartScreen,
    label: 'Trends',
    requiredRoles: ['RECRUITER_LEAD', 'ADMIN'],
  },
]

/**
 * Map a user role to its default landing page after login.
 * Spec: Recruiter → /todo-list, Tower Lead/Approvers → /workflow, Admin → /admin/master-data,
 *       Interviewer → /booking/view, SPOC → /referral/form, default → /dashboard
 */
export const getRoleDashboardPath = (role: string): string => {
  const roleMap: Partial<Record<UserRole, string>> = {
    [UserRole.RECRUITER]: '/todo-list',
    [UserRole.PMO]: '/candidates',
    [UserRole.TOWER_LEAD]: '/workflow',
    [UserRole.SL_BU_LEAD]: '/workflow',
    [UserRole.NA_LEAD]: '/workflow',
    [UserRole.RECRUITER_LEAD]: '/workflow',
    [UserRole.INTERVIEWER]: '/booking/view',
    [UserRole.ADMIN]: '/admin/master-data',
    [UserRole.BU_ADMIN]: '/admin/master-data',
    [UserRole.SPOC]: '/referral/form',
  }
  return roleMap[role as UserRole] ?? '/dashboard'
}

export default routes

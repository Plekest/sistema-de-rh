import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserPermissions } from '@/modules/auth/types'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Views - Dashboard
import DashboardView from '@/modules/dashboard/views/DashboardView.vue'

// Views - Auth
import LoginView from '@/modules/auth/views/LoginView.vue'
import ForgotPasswordView from '@/modules/auth/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/modules/auth/views/ResetPasswordView.vue'

// Views - Employees
import EmployeeListView from '@/modules/employees/views/EmployeeListView.vue'
import EmployeeFormView from '@/modules/employees/views/EmployeeFormView.vue'
import EmployeeDetailView from '@/modules/employees/views/EmployeeDetailView.vue'

// Views - Attendance
import AttendanceView from '@/modules/attendance/views/AttendanceView.vue'
import AttendanceListView from '@/modules/attendance/views/AttendanceListView.vue'

// Views - Hours Bank
import HoursBankView from '@/modules/hours-bank/views/HoursBankView.vue'

// Views - Documents
import DocumentsView from '@/modules/documents/views/DocumentsView.vue'

// Views - History
import HistoryView from '@/modules/history/views/HistoryView.vue'

// Views - Users
import UserListView from '@/modules/users/views/UserListView.vue'
import UserFormView from '@/modules/users/views/UserFormView.vue'

// Views - Leave
import LeaveListView from '@/modules/leave/views/LeaveListView.vue'

// Views - Benefits
import BenefitsListView from '@/modules/benefits/views/BenefitsListView.vue'

// Views - Payroll
import PayrollView from '@/modules/payroll/views/PayrollView.vue'

// Views - Performance
import PerformanceView from '@/modules/performance/views/PerformanceView.vue'

// Views - Recruitment
import RecruitmentView from '@/modules/recruitment/views/RecruitmentView.vue'

// Views - Training
import TrainingListView from '@/modules/training/views/TrainingListView.vue'

// Views - Admin
import PermissionsView from '@/modules/admin/views/PermissionsView.vue'
import AuditLogView from '@/modules/admin/views/AuditLogView.vue'

// Views - Notifications
import NotificationsView from '@/modules/notifications/views/NotificationsView.vue'

// Views - Calendar
import TeamCalendarView from '@/modules/calendar/views/TeamCalendarView.vue'

// Views - Onboarding
import OnboardingTemplatesView from '@/modules/onboarding/views/OnboardingTemplatesView.vue'
import OnboardingChecklistView from '@/modules/onboarding/views/OnboardingChecklistView.vue'

// Views - Surveys
import SurveyListView from '@/modules/surveys/views/SurveyListView.vue'
import SurveyCreateView from '@/modules/surveys/views/SurveyCreateView.vue'
import SurveyRespondView from '@/modules/surveys/views/SurveyRespondView.vue'
import SurveyResultsView from '@/modules/surveys/views/SurveyResultsView.vue'

// Views - Document Templates
import DocumentTemplatesView from '@/modules/documents/views/DocumentTemplatesView.vue'

// Views - Orgchart
import OrgChartView from '@/modules/orgchart/views/OrgChartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirect raiz para home
    {
      path: '/',
      redirect: '/home',
    },

    // Redirect antigo dashboard para home
    {
      path: '/dashboard',
      redirect: '/home',
    },

    // Rotas de autenticacao (guest only)
    {
      path: '/login',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
          meta: { guest: true },
        },
      ],
    },
    {
      path: '/forgot-password',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'forgot-password',
          component: ForgotPasswordView,
          meta: { guest: true },
        },
      ],
    },
    {
      path: '/reset-password',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'reset-password',
          component: ResetPasswordView,
          meta: { guest: true },
        },
      ],
    },

    // Rotas autenticadas
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        // Home / Dashboard
        {
          path: 'home',
          name: 'home',
          component: DashboardView,
        },

        // Colaboradores
        {
          path: 'employees',
          name: 'employees',
          component: EmployeeListView,
          meta: { module: 'employees' },
        },
        {
          path: 'employees/new',
          name: 'employee-create',
          component: EmployeeFormView,
          meta: { module: 'employees' },
        },
        {
          path: 'employees/:id',
          name: 'employee-detail',
          component: EmployeeDetailView,
          meta: { module: 'employees' },
        },
        {
          path: 'employees/:id/edit',
          name: 'employee-edit',
          component: EmployeeFormView,
          meta: { module: 'employees' },
        },

        // Registro de Ponto
        {
          path: 'attendance',
          name: 'attendance',
          component: AttendanceView,
          meta: { module: 'attendance' },
        },
        {
          path: 'attendance/manage',
          name: 'attendance-manage',
          component: AttendanceListView,
          meta: { module: 'attendance' },
        },

        // Banco de Horas
        {
          path: 'hours-bank',
          name: 'hours-bank',
          component: HoursBankView,
          meta: { module: 'hours_bank' },
        },

        // Documentos
        {
          path: 'documents',
          name: 'documents',
          component: DocumentsView,
          meta: { module: 'documents' },
        },

        // Historico
        {
          path: 'history',
          name: 'history',
          component: HistoryView,
          meta: { module: 'history' },
        },

        // Ferias e Licencas
        {
          path: 'leave',
          name: 'leave',
          component: LeaveListView,
          meta: { module: 'leave' },
        },

        // Beneficios
        {
          path: 'benefits',
          name: 'benefits',
          component: BenefitsListView,
          meta: { module: 'benefits' },
        },

        // Folha de Pagamento
        {
          path: 'payroll',
          name: 'payroll',
          component: PayrollView,
          meta: { module: 'payroll' },
        },

        // Avaliacao de Desempenho
        {
          path: 'performance',
          name: 'performance',
          component: PerformanceView,
          meta: { module: 'performance' },
        },

        // Recrutamento e Selecao
        {
          path: 'recruitment',
          name: 'recruitment',
          component: RecruitmentView,
          meta: { module: 'recruitment' },
        },
        {
          path: 'recruitment/kanban',
          name: 'recruitment-kanban',
          component: () => import('@/modules/recruitment/views/RecruitmentKanbanView.vue'),
          meta: { requiresAuth: true, module: 'recruitment' },
        },

        // Talent Pool
        {
          path: 'talent-pool',
          name: 'talent-pool',
          component: () => import('@/modules/talent-pool/views/TalentPoolView.vue'),
          meta: { requiresAuth: true, module: 'recruitment' },
        },

        // Lifecycle
        {
          path: 'employees/:id/lifecycle',
          name: 'employee-lifecycle',
          component: () => import('@/modules/lifecycle/views/EmployeeLifecycleView.vue'),
          meta: { requiresAuth: true, module: 'employees' },
        },

        // Treinamentos
        {
          path: 'training',
          name: 'training',
          component: TrainingListView,
          meta: { module: 'training' },
        },

        // Notificacoes (todos os usuarios)
        {
          path: 'notifications',
          name: 'notifications',
          component: NotificationsView,
        },

        // Calendario de Equipe
        {
          path: 'calendar',
          name: 'calendar',
          component: TeamCalendarView,
          meta: { module: 'calendar' },
        },

        // Onboarding
        {
          path: 'onboarding',
          name: 'onboarding',
          component: OnboardingTemplatesView,
          meta: { module: 'onboarding' },
        },
        {
          path: 'onboarding/checklists',
          name: 'onboarding-checklists',
          component: OnboardingChecklistView,
          meta: { module: 'onboarding' },
        },

        // Surveys (Pesquisas)
        {
          path: 'surveys',
          name: 'surveys',
          component: SurveyListView,
          meta: { module: 'surveys' },
        },
        {
          path: 'surveys/create',
          name: 'survey-create',
          component: SurveyCreateView,
          meta: { module: 'surveys' },
        },
        {
          path: 'surveys/:id/respond',
          name: 'survey-respond',
          component: SurveyRespondView,
          meta: { module: 'surveys' },
        },
        {
          path: 'surveys/:id/results',
          name: 'survey-results',
          component: SurveyResultsView,
          meta: { module: 'surveys' },
        },

        // Templates de Documentos
        {
          path: 'document-templates',
          name: 'document-templates',
          component: DocumentTemplatesView,
          meta: { module: 'documents' },
        },

        // Organograma
        {
          path: 'orgchart',
          name: 'orgchart',
          component: OrgChartView,
          meta: { module: 'orgchart' },
        },

        // Usuarios (admin)
        {
          path: 'users',
          name: 'users',
          component: UserListView,
          meta: { adminOnly: true },
        },
        {
          path: 'users/new',
          name: 'user-create',
          component: UserFormView,
          meta: { adminOnly: true },
        },
        {
          path: 'users/:id/edit',
          name: 'user-edit',
          component: UserFormView,
          meta: { adminOnly: true },
        },

        // Permissoes (admin)
        {
          path: 'admin/permissions',
          name: 'admin-permissions',
          component: PermissionsView,
          meta: { adminOnly: true },
        },

        // Audit Log (admin)
        {
          path: 'audit-log',
          name: 'audit-log',
          component: AuditLogView,
          meta: { adminOnly: true },
        },

        // Engagement Dashboard
        {
          path: 'engagement',
          name: 'engagement',
          component: () => import('@/modules/engagement/views/EngagementDashboardView.vue'),
          meta: { requiresAuth: true, module: 'performance' },
        },

        // Turnover Dashboard
        {
          path: 'turnover',
          name: 'turnover',
          component: () => import('@/modules/turnover/views/TurnoverDashboardView.vue'),
          meta: { requiresAuth: true, module: 'dashboard' },
        },

        // Comunicações Automatizadas
        {
          path: 'communications',
          name: 'communications',
          component: () => import('@/modules/communications/views/CommunicationsView.vue'),
          meta: { requiresAuth: true, module: 'admin' },
        },

        // Skills Matrix
        {
          path: 'skills',
          name: 'skills',
          component: () => import('@/modules/skills/views/SkillsMatrixView.vue'),
          meta: { requiresAuth: true, module: 'skills' },
        },

        // Career Planning
        {
          path: 'career',
          name: 'career',
          component: () => import('@/modules/career/views/CareerPlanningView.vue'),
          meta: { requiresAuth: true, module: 'career' },
        },

        // Occupational Health
        {
          path: 'health',
          name: 'health',
          component: () => import('@/modules/health/views/OccupationalHealthView.vue'),
          meta: { requiresAuth: true, module: 'health' },
        },

        // People Analytics
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/modules/analytics/views/PeopleAnalyticsView.vue'),
          meta: { requiresAuth: true, module: 'analytics' },
        },
      ],
    },
  ],
})

/**
 * Navigation guard - verifica autenticacao e permissoes antes de cada rota
 */
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Verifica se a rota requer autenticacao
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Verifica se a rota e apenas para guests (nao autenticados)
  const guestOnly = to.matched.some((record) => record.meta.guest)

  // Se requer autenticacao e nao esta autenticado
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // Se e rota guest e esta autenticado, redireciona para rota padrao
  if (guestOnly && authStore.isAuthenticated) {
    const defaultRoute = authStore.getDefaultRoute()
    next(defaultRoute)
    return
  }

  // Redireciona / para a rota padrao do usuario
  if (to.path === '/' && authStore.isAuthenticated) {
    const defaultRoute = authStore.getDefaultRoute()
    next(defaultRoute)
    return
  }

  // Verifica permissao de admin
  if (to.meta?.adminOnly && !authStore.isAdmin) {
    const defaultRoute = authStore.getDefaultRoute()
    next(defaultRoute)
    return
  }

  // Verifica permissao de modulo
  if (to.meta?.module && authStore.permissions) {
    const module = to.meta.module as keyof UserPermissions
    if (!authStore.permissions[module]) {
      const defaultRoute = authStore.getDefaultRoute()
      next(defaultRoute)
      return
    }
  }

  next()
})

export default router

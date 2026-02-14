/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const HealthController = () => import('#controllers/health_controller')
const AuthController = () => import('#controllers/auth_controller')
const DepartmentsController = () => import('#controllers/departments_controller')
const PositionsController = () => import('#controllers/positions_controller')
const EmployeesController = () => import('#controllers/employees_controller')
const DocumentsController = () => import('#controllers/documents_controller')
const TimeEntriesController = () => import('#controllers/time_entries_controller')
const HoursBankController = () => import('#controllers/hours_bank_controller')
const EmployeeHistoriesController = () => import('#controllers/employee_histories_controller')
const UsersController = () => import('#controllers/users_controller')
const RolePermissionsController = () => import('#controllers/role_permissions_controller')
const LeavesController = () => import('#controllers/leaves_controller')
const BenefitsController = () => import('#controllers/benefits_controller')
const PayrollController = () => import('#controllers/payroll_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const PerformanceController = () => import('#controllers/performance_controller')
const RecruitmentController = () => import('#controllers/recruitment_controller')
const NotificationsController = () => import('#controllers/notifications_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Healthcheck - rota publica (sem autenticacao)
router.get('api/v1/health', [HealthController, 'check'])

// Rotas de autenticacao
router
  .group(() => {
    // Rotas publicas (com rate limiting para protecao contra brute force)
    router
      .post('login', [AuthController, 'login'])
      .use(middleware.rateLimit({ maxAttempts: 5, windowSeconds: 60 }))
    router
      .post('forgot-password', [AuthController, 'forgotPassword'])
      .use(middleware.rateLimit({ maxAttempts: 3, windowSeconds: 120 }))
    router
      .post('reset-password', [AuthController, 'resetPassword'])
      .use(middleware.rateLimit({ maxAttempts: 5, windowSeconds: 120 }))

    // Rotas autenticadas
    router
      .group(() => {
        router.post('logout', [AuthController, 'logout'])
        router.get('me', [AuthController, 'me'])
        router.post('register', [AuthController, 'register'])
      })
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('api/v1/auth')

// ==========================================
// Rotas autenticadas - API v1
// ==========================================
router
  .group(() => {
    // --- Dashboard ---
    router.get('dashboard/admin', [DashboardController, 'admin'])
    router.get('dashboard/employee', [DashboardController, 'employee'])

    // --- Departamentos ---
    router.get('departments', [DepartmentsController, 'index'])
    router.get('departments/:id', [DepartmentsController, 'show'])
    router
      .post('departments', [DepartmentsController, 'store'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('departments/:id', [DepartmentsController, 'update'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .delete('departments/:id', [DepartmentsController, 'destroy'])
      .use(middleware.role({ roles: ['admin'] }))

    // --- Cargos ---
    router.get('positions', [PositionsController, 'index'])
    router.get('positions/:id', [PositionsController, 'show'])
    router
      .post('positions', [PositionsController, 'store'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('positions/:id', [PositionsController, 'update'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .delete('positions/:id', [PositionsController, 'destroy'])
      .use(middleware.role({ roles: ['admin'] }))

    // --- Colaboradores ---
    router.get('employees', [EmployeesController, 'index'])
    router.get('employees/:id', [EmployeesController, 'show'])
    router
      .post('employees', [EmployeesController, 'store'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('employees/:id', [EmployeesController, 'update'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .delete('employees/:id', [EmployeesController, 'destroy'])
      .use(middleware.role({ roles: ['admin'] }))

    // --- Documentos ---
    router.get('employees/:employeeId/documents', [DocumentsController, 'index'])
    router.post('employees/:employeeId/documents', [DocumentsController, 'store'])
    router.get('documents/:id', [DocumentsController, 'show'])
    router.get('documents/:id/download', [DocumentsController, 'download'])
    router.get('documents/:id/view', [DocumentsController, 'view'])
    router
      .delete('documents/:id', [DocumentsController, 'destroy'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Registro de Ponto (usuario logado) ---
    router.post('attendance/clock-in', [TimeEntriesController, 'clockIn'])
    router.post('attendance/clock-out', [TimeEntriesController, 'clockOut'])
    router.post('attendance/lunch-start', [TimeEntriesController, 'lunchStart'])
    router.post('attendance/lunch-end', [TimeEntriesController, 'lunchEnd'])
    router.get('attendance/today', [TimeEntriesController, 'today'])
    router.get('attendance/recent', [TimeEntriesController, 'recent'])

    // --- Registro de Ponto (por colaborador) ---
    router.get('employees/:employeeId/attendance', [TimeEntriesController, 'index'])
    router
      .post('employees/:employeeId/attendance', [TimeEntriesController, 'manualEntry'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Banco de Horas ---
    router.get('employees/:employeeId/hours-bank', [HoursBankController, 'index'])
    router.get('employees/:employeeId/hours-bank/balance', [HoursBankController, 'balance'])
    router
      .post('employees/:employeeId/hours-bank/calculate', [HoursBankController, 'calculate'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Historico do Colaborador ---
    router.get('employees/:employeeId/history', [EmployeeHistoriesController, 'index'])
    router
      .post('employees/:employeeId/history', [EmployeeHistoriesController, 'store'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Usuarios (apenas admin) ---
    router
      .group(() => {
        router.get('/', [UsersController, 'index'])
        router.get('/:id', [UsersController, 'show'])
        router.post('/', [UsersController, 'store'])
        router.put('/:id', [UsersController, 'update'])
        router.delete('/:id', [UsersController, 'destroy'])
      })
      .prefix('users')
      .use(middleware.role({ roles: ['admin'] }))

    // --- Ferias e Licencas ---
    router.get('leaves', [LeavesController, 'index'])
    router.get('leaves/calendar', [LeavesController, 'calendar'])
    router.get('leaves/:id', [LeavesController, 'show'])
    router.post('leaves', [LeavesController, 'store'])
    router
      .patch('leaves/:id/approve', [LeavesController, 'approve'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('leaves/:id/reject', [LeavesController, 'reject'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router.patch('leaves/:id/cancel', [LeavesController, 'cancel'])

    // --- Saldo de Ferias ---
    router.get('employees/:employeeId/leave-balance', [LeavesController, 'balances'])
    router
      .post('employees/:employeeId/leave-balance/calculate', [LeavesController, 'calculateBalances'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Configuracoes de Licencas (admin only) ---
    router
      .group(() => {
        router.get('/', [LeavesController, 'configs'])
        router.put('/:id', [LeavesController, 'updateConfig'])
      })
      .prefix('leave-configs')
      .use(middleware.role({ roles: ['admin'] }))

    // --- Beneficios ---
    router.get('benefits', [BenefitsController, 'index'])
    router.get('benefits/:id', [BenefitsController, 'show'])
    router
      .post('benefits', [BenefitsController, 'store'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .put('benefits/:id', [BenefitsController, 'update'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .delete('benefits/:id', [BenefitsController, 'destroy'])
      .use(middleware.role({ roles: ['admin'] }))

    // --- Planos de Beneficio ---
    router
      .post('benefits/:id/plans', [BenefitsController, 'storePlan'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .put('benefit-plans/:id', [BenefitsController, 'updatePlan'])
      .use(middleware.role({ roles: ['admin'] }))

    // --- Beneficios do Colaborador ---
    router.get('employees/:employeeId/benefits', [BenefitsController, 'employeeBenefits'])
    router
      .post('employees/:employeeId/benefits', [BenefitsController, 'enroll'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .delete('employees/:employeeId/benefits/:id', [BenefitsController, 'cancelEnrollment'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Dependentes de Beneficio ---
    router
      .post('employee-benefits/:id/dependents', [BenefitsController, 'addDependent'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .delete('benefit-dependents/:id', [BenefitsController, 'removeDependent'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Folha de Pagamento ---
    // Periodos: admin/manager podem listar, employee nao
    router
      .get('payroll/periods', [PayrollController, 'periods'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .post('payroll/periods', [PayrollController, 'createPeriod'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .patch('payroll/periods/:id/close', [PayrollController, 'closePeriod'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .post('payroll/periods/:id/calculate', [PayrollController, 'calculatePayroll'])
      .use(middleware.role({ roles: ['admin'] }))
    // Contracheques de um periodo: controller filtra por role (employee ve apenas o proprio)
    router.get('payroll/periods/:periodId/slips', [PayrollController, 'slips'])

    // --- Contracheques ---
    // Controller filtra por role: employee ve apenas os proprios
    router.get('payroll/slips', [PayrollController, 'employeeSlips'])
    router.get('payroll/slips/:id', [PayrollController, 'slipDetail'])

    // --- Componentes Salariais ---
    router.get('employees/:employeeId/payroll-components', [PayrollController, 'components'])
    router
      .post('payroll/components', [PayrollController, 'createComponent'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .put('payroll/components/:id', [PayrollController, 'updateComponent'])
      .use(middleware.role({ roles: ['admin'] }))

    // --- Lancamentos ---
    router
      .post('payroll/entries', [PayrollController, 'createEntry'])
      .use(middleware.role({ roles: ['admin'] }))

    // --- Permissoes (admin only) ---
    router
      .group(() => {
        router.get('/', [RolePermissionsController, 'index'])
        router.put('/', [RolePermissionsController, 'update'])
      })
      .prefix('admin/permissions')
      .use(middleware.role({ roles: ['admin'] }))

    // --- Performance / Avaliacao de Desempenho ---
    router.get('performance/cycles', [PerformanceController, 'listCycles'])
    router
      .post('performance/cycles', [PerformanceController, 'createCycle'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router.get('performance/cycles/:id', [PerformanceController, 'getCycle'])
    router
      .put('performance/cycles/:id', [PerformanceController, 'updateCycle'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('performance/cycles/:id/advance', [PerformanceController, 'advanceCycleStatus'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .post('performance/cycles/:id/competencies', [PerformanceController, 'addCompetency'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .delete('performance/cycles/:cycleId/competencies/:competencyId', [PerformanceController, 'removeCompetency'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    router.get('performance/competencies', [PerformanceController, 'listCompetencies'])
    router
      .post('performance/competencies', [PerformanceController, 'createCompetency'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('performance/competencies/:id', [PerformanceController, 'updateCompetency'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    router.get('performance/cycles/:cycleId/goals', [PerformanceController, 'listGoals'])
    router
      .post('performance/goals', [PerformanceController, 'createGoal'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('performance/goals/:id', [PerformanceController, 'updateGoal'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    router.get('performance/cycles/:cycleId/evaluations', [PerformanceController, 'listEvaluations'])
    router.get('performance/evaluations/:id', [PerformanceController, 'getEvaluation'])
    router.post('performance/evaluations', [PerformanceController, 'createEvaluation'])
    router.post('performance/evaluations/:id/submit', [PerformanceController, 'submitEvaluation'])

    router.get('performance/development-plans', [PerformanceController, 'listDevelopmentPlans'])
    router
      .post('performance/development-plans', [PerformanceController, 'createDevelopmentPlan'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('performance/development-plans/:id', [PerformanceController, 'updateDevelopmentPlan'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    // --- Recrutamento ---
    router.get('recruitment/requisitions', [RecruitmentController, 'requisitions'])
    router.get('recruitment/requisitions/:id', [RecruitmentController, 'showRequisition'])
    router
      .post('recruitment/requisitions', [RecruitmentController, 'createRequisition'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('recruitment/requisitions/:id', [RecruitmentController, 'updateRequisition'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('recruitment/requisitions/:id/approve', [RecruitmentController, 'approveRequisition'])
      .use(middleware.role({ roles: ['admin'] }))
    router
      .patch('recruitment/requisitions/:id/cancel', [RecruitmentController, 'cancelRequisition'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router.get('recruitment/requisitions/:id/stats', [RecruitmentController, 'requisitionStats'])

    router.get('recruitment/stages', [RecruitmentController, 'stages'])

    router.get('recruitment/candidates', [RecruitmentController, 'candidates'])
    router.get('recruitment/candidates/:id', [RecruitmentController, 'showCandidate'])
    router
      .post('recruitment/candidates', [RecruitmentController, 'createCandidate'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('recruitment/candidates/:id', [RecruitmentController, 'updateCandidate'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('recruitment/candidates/:id/move', [RecruitmentController, 'moveCandidate'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('recruitment/candidates/:id/hire', [RecruitmentController, 'hireCandidate'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('recruitment/candidates/:id/reject', [RecruitmentController, 'rejectCandidate'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    router.get('recruitment/interviews', [RecruitmentController, 'allInterviews'])
    router.get('recruitment/candidates/:candidateId/interviews', [RecruitmentController, 'interviews'])
    router
      .post('recruitment/interviews', [RecruitmentController, 'createInterview'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .put('recruitment/interviews/:id', [RecruitmentController, 'updateInterview'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('recruitment/interviews/:id/complete', [RecruitmentController, 'completeInterview'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))
    router
      .patch('recruitment/interviews/:id/cancel', [RecruitmentController, 'cancelInterview'])
      .use(middleware.role({ roles: ['admin', 'manager'] }))

    router.get('recruitment/dashboard', [RecruitmentController, 'dashboard'])

    // --- Notificacoes ---
    router.get('notifications', [NotificationsController, 'index'])
    router.get('notifications/unread-count', [NotificationsController, 'unreadCount'])
    router.patch('notifications/:id/read', [NotificationsController, 'markAsRead'])
    router.patch('notifications/read-all', [NotificationsController, 'markAllAsRead'])
  })
  .prefix('api/v1')
  .use(middleware.auth({ guards: ['api'] }))

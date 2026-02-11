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

const AuthController = () => import('#controllers/auth_controller')
const DepartmentsController = () => import('#controllers/departments_controller')
const PositionsController = () => import('#controllers/positions_controller')
const EmployeesController = () => import('#controllers/employees_controller')
const DocumentsController = () => import('#controllers/documents_controller')
const TimeEntriesController = () => import('#controllers/time_entries_controller')
const HoursBankController = () => import('#controllers/hours_bank_controller')
const EmployeeHistoriesController = () => import('#controllers/employee_histories_controller')
const UsersController = () => import('#controllers/users_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Rotas de autenticacao
router
  .group(() => {
    // Rota publica
    router.post('login', [AuthController, 'login'])

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
  })
  .prefix('api/v1')
  .use(middleware.auth({ guards: ['api'] }))

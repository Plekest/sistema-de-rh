import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// Views - Auth
import LoginView from '@/modules/auth/views/LoginView.vue'

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirect raiz para employees
    {
      path: '/',
      redirect: '/employees',
    },

    // Redirect antigo dashboard para employees
    {
      path: '/dashboard',
      redirect: '/employees',
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

    // Rotas autenticadas
    {
      path: '/',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        // Colaboradores
        {
          path: 'employees',
          name: 'employees',
          component: EmployeeListView,
        },
        {
          path: 'employees/new',
          name: 'employee-create',
          component: EmployeeFormView,
        },
        {
          path: 'employees/:id',
          name: 'employee-detail',
          component: EmployeeDetailView,
        },
        {
          path: 'employees/:id/edit',
          name: 'employee-edit',
          component: EmployeeFormView,
        },

        // Registro de Ponto
        {
          path: 'attendance',
          name: 'attendance',
          component: AttendanceView,
        },
        {
          path: 'attendance/manage',
          name: 'attendance-manage',
          component: AttendanceListView,
        },

        // Banco de Horas
        {
          path: 'hours-bank',
          name: 'hours-bank',
          component: HoursBankView,
        },

        // Documentos
        {
          path: 'documents',
          name: 'documents',
          component: DocumentsView,
        },

        // Historico
        {
          path: 'history',
          name: 'history',
          component: HistoryView,
        },

        // Usuarios (admin)
        {
          path: 'users',
          name: 'users',
          component: UserListView,
        },
        {
          path: 'users/new',
          name: 'user-create',
          component: UserFormView,
        },
        {
          path: 'users/:id/edit',
          name: 'user-edit',
          component: UserFormView,
        },
      ],
    },
  ],
})

/**
 * Navigation guard - verifica autenticacao antes de cada rota
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

  // Se e rota guest e esta autenticado
  if (guestOnly && authStore.isAuthenticated) {
    next({ name: 'employees' })
    return
  }

  next()
})

export default router

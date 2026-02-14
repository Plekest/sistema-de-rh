<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import type { UserPermissions } from '@/modules/auth/types'

const route = useRoute()
const authStore = useAuthStore()
const { unreadCount } = useNotifications()

// Estado do menu mobile
const isMobileMenuOpen = ref(false)

/**
 * Realiza logout do usuario
 */
async function handleLogout() {
  await authStore.logout()
}

/**
 * Fecha menu mobile ao navegar
 */
function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

// Itens do menu principal filtrados por permissao
const menuItems = computed(() => {
  const all = [
    { name: 'Inicio', path: '/home', module: null },
    { name: 'Colaboradores', path: '/employees', module: 'employees' },
    { name: 'Registro de Ponto', path: '/attendance', module: 'attendance' },
    { name: 'Banco de Horas', path: '/hours-bank', module: 'hours_bank' },
    { name: 'Documentos', path: '/documents', module: 'documents' },
    { name: 'Historico', path: '/history', module: 'history' },
    { name: 'Ferias e Licencas', path: '/leave', module: 'leave' },
    { name: 'Beneficios', path: '/benefits', module: 'benefits' },
    { name: 'Folha de Pagamento', path: '/payroll', module: 'payroll' },
    { name: 'Avaliacao', path: '/performance', module: 'performance' },
    { name: 'Recrutamento', path: '/recruitment', module: 'recruitment' },
    { name: 'Treinamentos', path: '/training', module: 'training' },
  ]
  if (!authStore.permissions) return all
  return all.filter(item => !item.module || authStore.permissions![item.module as keyof UserPermissions])
})

// Itens do menu admin (separados)
const adminMenuItems = [
  { name: 'Usuarios', path: '/users' },
  { name: 'Permissoes', path: '/admin/permissions' },
]

/**
 * Retorna titulo da pagina atual baseado na rota
 */
function getPageTitle(): string {
  const path = route.path
  if (path === '/home') return 'Inicio'
  if (path.startsWith('/employees')) {
    if (path.includes('/new')) return 'Novo Colaborador'
    if (path.includes('/edit')) return 'Editar Colaborador'
    if (path.match(/\/employees\/\d+$/)) return 'Detalhes do Colaborador'
    return 'Colaboradores'
  }
  if (path.startsWith('/attendance')) {
    if (path.includes('/manage')) return 'Gerenciamento de Ponto'
    return 'Registro de Ponto'
  }
  if (path.startsWith('/hours-bank')) return 'Banco de Horas'
  if (path.startsWith('/documents')) return 'Documentos'
  if (path.startsWith('/history')) return 'Historico'
  if (path.startsWith('/leave')) {
    if (path.includes('/new')) return 'Nova Solicitacao'
    if (path.includes('/calendar')) return 'Calendario de Ausencias'
    return 'Ferias e Licencas'
  }
  if (path.startsWith('/payroll')) return 'Folha de Pagamento'
  if (path.startsWith('/performance')) return 'Avaliacao de Desempenho'
  if (path.startsWith('/recruitment')) return 'Recrutamento e Selecao'
  if (path.startsWith('/training')) return 'Treinamentos'
  if (path.startsWith('/users')) {
    if (path.includes('/new')) return 'Novo Usuario'
    if (path.includes('/edit')) return 'Editar Usuario'
    return 'Usuarios'
  }
  if (path.startsWith('/admin/permissions')) return 'Permissoes'
  return 'Sistema RH'
}
</script>

<template>
  <div class="layout">
    <!-- Overlay mobile -->
    <div
      v-if="isMobileMenuOpen"
      class="sidebar-overlay"
      @click="closeMobileMenu"
      @keydown.escape="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': isMobileMenuOpen }" role="navigation" aria-label="Menu principal">
      <div class="sidebar-header">
        <span class="sidebar-logo">RH</span>
        <span class="sidebar-brand">Sistema RH</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="nav-item-active"
          @click="closeMobileMenu"
        >
          <span class="nav-indicator"></span>
          <span class="nav-label">{{ item.name }}</span>
        </RouterLink>

        <template v-if="authStore.isAdmin">
          <div class="nav-divider"></div>
          <RouterLink
            v-for="item in adminMenuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            active-class="nav-item-active"
            @click="closeMobileMenu"
          >
            <span class="nav-indicator"></span>
            <span class="nav-label">{{ item.name }}</span>
          </RouterLink>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <span class="sidebar-user-name">{{ authStore.user?.fullName || 'Usuario' }}</span>
          <span class="sidebar-user-role">{{ authStore.user?.role || '' }}</span>
        </div>
        <button class="sidebar-logout" @click="handleLogout">
          Sair
        </button>
      </div>
    </aside>

    <!-- Conteudo principal -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <button class="hamburger" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Abrir menu" :aria-expanded="isMobileMenuOpen">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <h2 class="header-title">{{ getPageTitle() }}</h2>
        </div>
        <div class="header-right">
          <RouterLink to="/notifications" class="notification-bell" aria-label="Notificacoes">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </RouterLink>
          <span class="header-user">{{ authStore.user?.fullName }}</span>
        </div>
      </header>

      <!-- Area de conteudo -->
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-page);
  font-family: var(--font-family);
}

/* ==================== SIDEBAR ==================== */

.sidebar {
  width: var(--sidebar-width);
  background-color: var(--color-sidebar-bg);
  color: var(--color-sidebar-text);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: var(--z-sidebar);
}

/* Header da sidebar */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-12) var(--space-10);
  border-bottom: var(--border-width) solid var(--color-sidebar-border);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-sidebar-text-active);
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.sidebar-brand {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-sidebar-text-active);
  letter-spacing: -0.01em;
}

/* Navegacao */
.sidebar-nav {
  flex: 1;
  padding: var(--space-6) 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-5) var(--space-10);
  color: var(--color-sidebar-text);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  transition: color var(--transition-fast), background-color var(--transition-fast);
  position: relative;
}

.nav-indicator {
  width: 3px;
  height: 0;
  background-color: transparent;
  border-radius: 0 2px 2px 0;
  position: absolute;
  left: 0;
  transition: height var(--transition-fast), background-color var(--transition-fast);
}

.nav-item:hover {
  color: var(--color-sidebar-text-hover);
  background-color: rgba(255, 255, 255, 0.03);
}

.nav-item-active {
  color: var(--color-sidebar-text-active);
  background-color: rgba(255, 255, 255, 0.06);
}

.nav-item-active .nav-indicator {
  height: 20px;
  background-color: var(--color-sidebar-accent);
}

.nav-label {
  line-height: var(--line-height-tight);
}

.nav-divider {
  height: var(--border-width);
  background-color: var(--color-sidebar-border);
  margin: var(--space-4) var(--space-10);
}

/* Footer da sidebar */
.sidebar-footer {
  padding: var(--space-8) var(--space-10);
  border-top: var(--border-width) solid var(--color-sidebar-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.sidebar-user {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar-user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-sidebar-text-hover);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-role {
  font-size: var(--font-size-2xs);
  color: #6b6b80;
  text-transform: capitalize;
}

.sidebar-logout {
  display: inline-flex;
  align-items: center;
  background: none;
  border: var(--border-width) solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-6);
  color: var(--color-sidebar-text);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  width: fit-content;
  min-height: 44px;
}

.sidebar-logout:hover {
  color: var(--color-sidebar-text-hover);
  border-color: rgba(255, 255, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.03);
}

/* ==================== MAIN ==================== */

.main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.header {
  background-color: var(--color-bg-card);
  border-bottom: var(--border-width) solid var(--color-border);
  padding: 0 var(--space-12);
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.header-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.header-user {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

/* Badge de notificacoes */
.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.notification-bell:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-hover);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: var(--color-error);
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 4px;
  line-height: 1;
  box-shadow: 0 0 0 2px var(--color-bg-card);
}

/* Hamburger (mobile only) */
.hamburger {
  display: none;
  flex-direction: column;
  gap: var(--space-2);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  min-height: 44px;
  min-width: 44px;
  justify-content: center;
  align-items: center;
}

.hamburger-line {
  display: block;
  width: 18px;
  height: 2px;
  background-color: var(--color-text-tertiary);
  border-radius: var(--radius-xs);
}

/* Overlay mobile */
.sidebar-overlay {
  display: none;
}

/* Conteudo */
.content {
  flex: 1;
  padding: var(--space-12);
}

/* ==================== RESPONSIVO ==================== */

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-slow);
    box-shadow: none;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: var(--shadow-xl);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: var(--z-sidebar-overlay);
  }

  .main {
    margin-left: 0;
  }

  .hamburger {
    display: flex;
  }

  .header-user {
    display: none;
  }

  .content {
    padding: var(--space-8);
  }
}
</style>

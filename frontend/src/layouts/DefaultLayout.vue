<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

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

// Itens do menu principal
const menuItems = [
  { name: 'Colaboradores', path: '/employees' },
  { name: 'Registro de Ponto', path: '/attendance' },
  { name: 'Banco de Horas', path: '/hours-bank' },
  { name: 'Documentos', path: '/documents' },
  { name: 'Historico', path: '/history' },
]

// Itens do menu admin (separados)
const adminMenuItems = [
  { name: 'Usuarios', path: '/users' },
]

/**
 * Retorna titulo da pagina atual baseado na rota
 */
function getPageTitle(): string {
  const path = route.path
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
  if (path.startsWith('/users')) {
    if (path.includes('/new')) return 'Novo Usuario'
    if (path.includes('/edit')) return 'Editar Usuario'
    return 'Usuarios'
  }
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
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': isMobileMenuOpen }">
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
          <button class="hamburger" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Abrir menu">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <h2 class="header-title">{{ getPageTitle() }}</h2>
        </div>
        <div class="header-right">
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
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ==================== SIDEBAR ==================== */

.sidebar {
  width: 240px;
  background-color: #1a1a2e;
  color: #c8c8d4;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

/* Header da sidebar */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 700;
  color: #e2e2ea;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.sidebar-brand {
  font-size: 1rem;
  font-weight: 600;
  color: #e2e2ea;
  letter-spacing: -0.01em;
}

/* Navegacao */
.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.688rem 1.25rem;
  color: #8e8ea0;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 400;
  transition: color 0.15s, background-color 0.15s;
  position: relative;
}

.nav-indicator {
  width: 3px;
  height: 0;
  background-color: transparent;
  border-radius: 0 2px 2px 0;
  position: absolute;
  left: 0;
  transition: height 0.15s, background-color 0.15s;
}

.nav-item:hover {
  color: #d4d4e0;
  background-color: rgba(255, 255, 255, 0.03);
}

.nav-item-active {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.06);
}

.nav-item-active .nav-indicator {
  height: 20px;
  background-color: #5a7fca;
}

.nav-label {
  line-height: 1.3;
}

.nav-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.06);
  margin: 0.5rem 1.25rem;
}

/* Footer da sidebar */
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-user {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sidebar-user-name {
  font-size: 0.813rem;
  font-weight: 500;
  color: #d4d4e0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-role {
  font-size: 0.688rem;
  color: #6b6b80;
  text-transform: capitalize;
}

.sidebar-logout {
  display: inline-flex;
  align-items: center;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  padding: 0.375rem 0.75rem;
  color: #8e8ea0;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  width: fit-content;
}

.sidebar-logout:hover {
  color: #d4d4e0;
  border-color: rgba(255, 255, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.03);
}

/* ==================== MAIN ==================== */

.main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8ed;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-user {
  font-size: 0.813rem;
  color: #718096;
  font-weight: 500;
}

/* Hamburger (mobile only) */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger-line {
  display: block;
  width: 18px;
  height: 2px;
  background-color: #4a5568;
  border-radius: 1px;
}

/* Overlay mobile */
.sidebar-overlay {
  display: none;
}

/* Conteudo */
.content {
  flex: 1;
  padding: 1.5rem;
}

/* ==================== RESPONSIVO ==================== */

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: none;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
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
    padding: 1rem;
  }
}
</style>

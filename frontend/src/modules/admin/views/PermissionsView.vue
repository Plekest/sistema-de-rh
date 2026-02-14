<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import permissionsService from '../services/permissions.service'
import { useAuthStore } from '@/stores/auth'
import type { RolePermission } from '../types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const authStore = useAuthStore()

// Estado
const permissions = ref<RolePermission[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

// Definicao dos modulos e roles
const modules = [
  { key: 'employees', label: 'Colaboradores' },
  { key: 'attendance', label: 'Registro de Ponto' },
  { key: 'hours_bank', label: 'Banco de Horas' },
  { key: 'documents', label: 'Documentos' },
  { key: 'history', label: 'Historico' },
  { key: 'leave', label: 'Ferias e Licencas' },
  { key: 'benefits', label: 'Beneficios' },
  { key: 'payroll', label: 'Folha de Pagamento' },
  { key: 'performance', label: 'Avaliacao de Desempenho' },
  { key: 'recruitment', label: 'Recrutamento' },
]

const roles = [
  { key: 'admin', label: 'Admin' },
  { key: 'manager', label: 'Gerente' },
  { key: 'employee', label: 'Colaborador' },
]

/**
 * Retorna o valor de permissao para uma combinacao role/module
 */
function getPermission(role: string, module: string): boolean {
  const perm = permissions.value.find(p => p.role === role && p.module === module)
  return perm ? perm.canAccess : false
}

/**
 * Altera o valor de permissao para uma combinacao role/module
 */
function togglePermission(role: string, module: string) {
  const index = permissions.value.findIndex(p => p.role === role && p.module === module)
  if (index >= 0) {
    permissions.value[index]!.canAccess = !permissions.value[index]!.canAccess
  } else {
    permissions.value.push({ role, module, canAccess: true })
  }
  success.value = ''
}

/**
 * Verifica se houve alteracoes
 */
const hasChanges = computed(() => {
  return permissions.value.length > 0
})

/**
 * Carrega permissoes do servidor
 */
async function loadPermissions() {
  try {
    isLoading.value = true
    error.value = ''
    permissions.value = await permissionsService.getAll()
  } catch (err: unknown) {
    error.value = 'Erro ao carregar permissoes.'
    console.error(err)
    // Inicializa com valores padrao se a API falhar
    initializeDefaults()
  } finally {
    isLoading.value = false
  }
}

/**
 * Inicializa permissoes com valores padrao
 */
function initializeDefaults() {
  const employeeModules = ['attendance', 'hours_bank', 'documents', 'leave', 'benefits', 'payroll', 'performance']
  const defaults: RolePermission[] = []
  for (const role of roles) {
    for (const mod of modules) {
      let canAccess = true
      if (role.key === 'employee') {
        canAccess = employeeModules.includes(mod.key)
      }
      defaults.push({
        role: role.key,
        module: mod.key,
        canAccess,
      })
    }
  }
  permissions.value = defaults
}

/**
 * Salva permissoes no servidor
 */
async function handleSave() {
  try {
    isSaving.value = true
    error.value = ''
    success.value = ''
    const updated = await permissionsService.update(permissions.value)
    permissions.value = updated
    // Atualiza as permissoes no auth store para refletir no menu imediatamente
    await authStore.fetchUser()
    success.value = 'Permissoes salvas com sucesso.'
    setTimeout(() => { success.value = '' }, 5000)
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    error.value = axiosErr.response?.data?.message || 'Erro ao salvar permissoes.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadPermissions()
})
</script>

<template>
  <div class="permissions-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Permissoes por Perfil</h1>
        <p class="page-subtitle">Configure o acesso de cada perfil aos modulos do sistema.</p>
      </div>
    </div>

    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>
    <Transition name="fade">
      <div v-if="success" class="alert alert-success" role="status" aria-live="polite">{{ success }}</div>
    </Transition>

    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="Carregando permissoes..." />
    </div>

    <template v-else>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-module">Modulo</th>
              <th v-for="role in roles" :key="role.key" class="th-role">
                {{ role.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in modules" :key="mod.key">
              <td class="td-module">{{ mod.label }}</td>
              <td v-for="role in roles" :key="role.key" class="td-toggle">
                <button
                  type="button"
                  class="toggle"
                  :class="{ 'toggle-on': getPermission(role.key, mod.key) }"
                  :aria-label="`${mod.label} - ${role.label}: ${getPermission(role.key, mod.key) ? 'Ativo' : 'Inativo'}`"
                  @click="togglePermission(role.key, mod.key)"
                >
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="actions-bar">
        <button
          class="btn btn-primary"
          :disabled="isSaving || !hasChanges"
          @click="handleSave"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar Permissoes' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.permissions-view {
  max-width: var(--max-width-md, 800px);
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-12, 1.5rem);
}

.page-title {
  font-size: var(--font-size-3xl, 1.5rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #1a202c);
  margin: 0;
}

.page-subtitle {
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-muted, #718096);
  margin: var(--space-2, 0.25rem) 0 0;
}

/* Tabela */
.table-container {
  background: var(--color-bg-card, #fff);
  border-radius: var(--card-border-radius, 8px);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: var(--table-cell-padding-y, 0.75rem) var(--table-cell-padding-x, 1rem);
  font-size: var(--table-header-font-size, 0.75rem);
  font-weight: var(--table-header-font-weight, 600);
  color: var(--table-header-color, #4a5568);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: var(--border-width-thick, 2px) solid var(--color-border, #e2e8f0);
  white-space: nowrap;
}

.data-table td {
  padding: var(--table-cell-padding-y, 0.75rem) var(--table-cell-padding-x, 1rem);
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-secondary, #2d3748);
  border-bottom: var(--border-width, 1px) solid var(--color-border-light, #f0f0f0);
}

.data-table tbody tr:hover {
  background-color: var(--table-row-hover-bg, #f7fafc);
}

.th-module {
  width: 40%;
}

.th-role {
  text-align: center;
  width: 20%;
}

.td-module {
  font-weight: var(--font-weight-medium, 500);
}

.td-toggle {
  text-align: center;
}

/* Toggle switch */
.toggle {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-track {
  display: flex;
  align-items: center;
  width: 40px;
  height: 22px;
  background-color: var(--color-text-disabled, #cbd5e0);
  border-radius: 11px;
  position: relative;
  transition: background-color var(--transition-base, 0.2s ease);
}

.toggle-on .toggle-track {
  background-color: var(--color-primary, #667eea);
}

.toggle-thumb {
  display: block;
  width: 18px;
  height: 18px;
  background-color: var(--color-bg-card, #fff);
  border-radius: var(--radius-full, 50%);
  position: absolute;
  left: 2px;
  transition: transform var(--transition-base, 0.2s ease);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.15));
}

.toggle-on .toggle-thumb {
  transform: translateX(18px);
}

/* Barra de acoes */
.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-12, 1.5rem);
}

/* Botao */
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-y, 0.625rem) var(--btn-padding-x, 1.25rem);
  border: none;
  border-radius: var(--btn-border-radius, 6px);
  font-size: var(--btn-font-size, 0.875rem);
  font-weight: var(--btn-font-weight, 600);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: var(--color-bg-card, #fff);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary, 0 4px 12px rgba(102, 126, 234, 0.35));
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estados */
.alert {
  padding: var(--alert-padding-y, 0.75rem) var(--alert-padding-x, 1rem);
  border-radius: var(--alert-border-radius, 6px);
  font-size: var(--alert-font-size, 0.875rem);
  margin-bottom: var(--space-8, 1rem);
}

.alert-error {
  background: var(--color-danger-light, #fff5f5);
  border: var(--border-width, 1px) solid var(--color-danger-lighter, #fed7d7);
  color: var(--color-danger-dark, #c53030);
}

.alert-success {
  background: var(--color-success-light, #f0fff4);
  border: var(--border-width, 1px) solid var(--color-success-lighter, #c6f6d5);
  color: var(--color-success-dark, #276749);
}

.loading-state {
  text-align: center;
  padding: var(--space-24, 3rem) var(--space-8, 1rem);
  color: var(--color-text-muted, #718096);
  font-size: var(--font-size-base, 0.875rem);
}

/* Fade transition */
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .th-role {
    font-size: var(--font-size-2xs, 0.688rem);
  }
}
</style>

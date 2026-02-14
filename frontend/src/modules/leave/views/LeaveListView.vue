<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useLeaves } from '../composables/useLeaves'
import LeaveFilters from '../components/LeaveFilters.vue'
import LeaveTable from '../components/LeaveTable.vue'
import LeaveRequestForm from '../components/LeaveRequestForm.vue'

/**
 * View principal de ferias e licencas.
 *
 * Decomposta em componentes menores:
 * - LeaveFilters: filtros por colaborador, tipo e status
 * - LeaveTable: tabela de solicitacoes com acoes
 * - LeaveRequestForm: modal de nova solicitacao
 * - LeaveBalanceCard: cards de saldo (disponivel para uso futuro)
 *
 * Toda a logica de negocio esta centralizada no composable useLeaves.
 */

const {
  // Estado
  leaves,
  employees,
  isLoading,
  error,
  successMessage,
  // Filtros
  selectedEmployee,
  filterType,
  filterStatus,
  // Formulario
  showForm,
  formLoading,
  formError,
  formData,
  // Computed
  isAdmin,
  // Labels
  typeLabels,
  statusLabels,
  typeOptions,
  statusOptions,
  // Metodos
  loadLeaves,
  openForm,
  closeForm,
  submitForm,
  approveLeave,
  rejectLeave,
  cancelLeave,
  init,
} = useLeaves()

// Recarrega ao mudar filtros
watch([selectedEmployee, filterType, filterStatus], () => {
  loadLeaves()
})

onMounted(() => {
  init()
})
</script>

<template>
  <div class="leave-list-view">
    <div class="page-header">
      <h1 class="page-title">Ferias e Licencas</h1>
      <button class="btn-primary" @click="openForm">Nova Solicitacao</button>
    </div>

    <!-- Mensagens -->
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">{{ successMessage }}</div>
    </Transition>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Filtros -->
    <LeaveFilters
      :isAdmin="isAdmin"
      :employees="employees"
      :selectedEmployee="selectedEmployee"
      :filterType="filterType"
      :filterStatus="filterStatus"
      :typeLabels="typeLabels"
      :statusLabels="statusLabels"
      :typeOptions="typeOptions"
      :statusOptions="statusOptions"
      @update:selectedEmployee="selectedEmployee = $event"
      @update:filterType="filterType = $event"
      @update:filterStatus="filterStatus = $event"
    />

    <!-- Tabela de solicitacoes -->
    <LeaveTable
      :leaves="leaves"
      :loading="isLoading"
      :isAdmin="isAdmin"
      :typeLabels="typeLabels"
      :statusLabels="statusLabels"
      @approve="approveLeave"
      @reject="rejectLeave"
      @cancel="cancelLeave"
    />

    <!-- Modal de nova solicitacao -->
    <LeaveRequestForm
      :show="showForm"
      :isAdmin="isAdmin"
      :employees="employees"
      :formData="formData"
      :formLoading="formLoading"
      :formError="formError"
      :typeLabels="typeLabels"
      :typeOptions="typeOptions"
      @close="closeForm"
      @submit="submitForm"
      @update:formData="formData = $event"
    />
  </div>
</template>

<style scoped>
.leave-list-view {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-12);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

/* Botoes */
.btn-primary {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  background: var(--color-primary-gradient);
  color: var(--color-bg-card);
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alertas */
.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
  margin-bottom: var(--space-8);
}

.alert-success {
  background: var(--color-success-lighter);
  border: var(--border-width) solid var(--color-success-bg);
  color: var(--color-success-dark);
}

.alert-error {
  background: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

/* Animacao fade para mensagens de sucesso */
.fade-enter-active {
  transition: opacity var(--transition-slow);
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-8);
  }
}
</style>

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
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

/* Botoes */
.btn-primary {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alertas */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-success {
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  color: #276749;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
}

/* Animacao fade para mensagens de sucesso */
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
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>

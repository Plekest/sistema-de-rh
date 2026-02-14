<script setup lang="ts">
import type { Leave } from '../types'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { DataTableColumn } from '@/components/common/types'

/**
 * Tabela de solicitacoes de ferias/licencas.
 *
 * Usa DataTable reutilizavel com StatusBadge para status.
 * Exibe botoes de acao (aprovar, rejeitar, cancelar) conforme permissoes.
 */

interface Props {
  leaves: Leave[]
  loading: boolean
  isAdmin: boolean
  typeLabels: Record<string, string>
  statusLabels: Record<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'approve', id: number): void
  (e: 'reject', id: number): void
  (e: 'cancel', id: number): void
}>()

/**
 * Verifica se pode aprovar/rejeitar
 */
function canApprove(leave: Leave): boolean {
  return props.isAdmin && leave.status === 'pending'
}

/**
 * Verifica se pode cancelar (admin ou dono da solicitacao pendente)
 */
function canCancel(leave: Leave): boolean {
  return leave.status === 'pending'
}

/**
 * Formata data para exibicao
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Colunas da tabela - montadas dinamicamente com base no perfil
 */
const columns: DataTableColumn[] = [
  ...(props.isAdmin ? [{ key: 'employee.fullName', label: 'Colaborador' }] : []),
  { key: 'type', label: 'Tipo' },
  { key: 'period', label: 'Periodo' },
  { key: 'daysCount', label: 'Dias', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'actions', label: 'Acoes', align: 'center' as const },
]

/**
 * Mapeia dados de Leave para o formato esperado pela DataTable
 */
const tableData = computed(() =>
  props.leaves.map((leave) => ({
    ...leave,
    'employee.fullName': leave.employee?.fullName || 'N/A',
    period: `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`,
  }))
)

import { computed } from 'vue'
</script>

<template>
  <DataTable
    :columns="columns"
    :data="(tableData as Record<string, unknown>[])"
    :loading="loading"
    emptyMessage="Nenhuma solicitacao encontrada"
    emptyDescription="Nao ha solicitacoes de ferias ou licencas para exibir."
  >
    <template #cell-type="{ row }">
      {{ typeLabels[(row as Record<string, unknown>).type as string] || (row as Record<string, unknown>).type }}
    </template>

    <template #cell-status="{ row }">
      <StatusBadge
        :status="statusLabels[(row as Record<string, unknown>).status as string] || ((row as Record<string, unknown>).status as string)"
      />
    </template>

    <template #cell-actions="{ row }">
      <div class="action-buttons">
        <button
          v-if="canApprove(row as unknown as Leave)"
          class="btn-action btn-approve"
          @click="emit('approve', (row as Record<string, unknown>).id as number)"
        >
          Aprovar
        </button>
        <button
          v-if="canApprove(row as unknown as Leave)"
          class="btn-action btn-reject"
          @click="emit('reject', (row as Record<string, unknown>).id as number)"
        >
          Rejeitar
        </button>
        <button
          v-if="canCancel(row as unknown as Leave)"
          class="btn-action btn-cancel-action"
          @click="emit('cancel', (row as Record<string, unknown>).id as number)"
        >
          Cancelar
        </button>
      </div>
    </template>
  </DataTable>
</template>

<style scoped>
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.btn-action {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #c6f6d5;
  color: #276749;
}

.btn-approve:hover {
  background: #9ae6b4;
}

.btn-reject {
  background: #fed7d7;
  color: #c53030;
}

.btn-reject:hover {
  background: #fc8181;
}

.btn-cancel-action {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel-action:hover {
  background: #cbd5e0;
}

@media (max-width: 768px) {
  /* Touch targets - minimo 44px para mobile */
  .btn-action {
    padding: 0.5rem 0.75rem;
    font-size: 0.813rem;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
</style>

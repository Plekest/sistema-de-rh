/**
 * Componentes comuns reutilizaveis do Sistema de RH
 *
 * Importacao centralizada:
 * import { DataTable, FormField, AppModal, StatusBadge, EmptyState, LoadingSpinner } from '@/components/common'
 */

export { default as DataTable } from './DataTable.vue'
export { default as FormField } from './FormField.vue'
export { default as AppModal } from './AppModal.vue'

// Componentes antigos (manter para compatibilidade)
export { default as StatusBadge } from './StatusBadge.vue'
export { default as EmptyState } from './EmptyState.vue'
export { default as LoadingSpinner } from './LoadingSpinner.vue'

// Novos componentes (Fase 5 - Polish)
export { default as AppLoadingSpinner } from './AppLoadingSpinner.vue'
export { default as AppEmptyState } from './AppEmptyState.vue'
export { default as AppErrorState } from './AppErrorState.vue'
export { default as AppConfirmDialog } from './AppConfirmDialog.vue'
export { default as AppStatusBadge } from './AppStatusBadge.vue'

// Re-exporta tipos para uso externo
export type { DataTableColumn, SortInfo } from './types'

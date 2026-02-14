<script setup lang="ts">
import { computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import EmptyState from './EmptyState.vue'
import type { DataTableColumn, SortInfo } from './types'

/**
 * Componente de tabela de dados reutilizavel
 *
 * Suporta colunas configuráveis, ordenacao, paginacao,
 * estados de loading e vazio, e slots para customizacao de celulas.
 *
 * @example
 * <DataTable
 *   :columns="columns"
 *   :data="employees"
 *   :loading="isLoading"
 *   :currentPage="page"
 *   :totalPages="totalPages"
 *   emptyMessage="Nenhum colaborador encontrado"
 *   @page-change="onPageChange"
 *   @sort="onSort"
 * >
 *   <template #cell-status="{ row }">
 *     <StatusBadge :status="row.status" />
 *   </template>
 *   <template #cell-actions="{ row }">
 *     <button @click="edit(row)">Editar</button>
 *   </template>
 * </DataTable>
 */

interface Props {
  /** Definicoes das colunas */
  columns: DataTableColumn[]
  /** Array de dados (cada item e uma linha) */
  data: Record<string, unknown>[]
  /** Estado de carregamento */
  loading?: boolean
  /** Mensagem quando nao ha dados */
  emptyMessage?: string
  /** Descricao complementar do estado vazio */
  emptyDescription?: string
  /** Pagina atual (1-indexed). Se 0 ou undefined, paginacao nao e exibida */
  currentPage?: number
  /** Total de paginas */
  totalPages?: number
  /** Ordenacao atual */
  sortBy?: SortInfo | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'Nenhum registro encontrado',
  emptyDescription: '',
  currentPage: 0,
  totalPages: 0,
  sortBy: null,
})

const emit = defineEmits<{
  /** Emitido quando o usuario muda de pagina */
  (e: 'page-change', page: number): void
  /** Emitido quando o usuario clica em uma coluna ordenavel */
  (e: 'sort', sortInfo: SortInfo): void
}>()

/** Indica se a paginacao deve ser exibida */
const showPagination = computed(() => props.currentPage > 0 && props.totalPages > 1)

/** Array de numeros de pagina para exibir */
const pageNumbers = computed(() => {
  if (!showPagination.value) return []

  const total = props.totalPages
  const current = props.currentPage
  const pages: number[] = []

  // Exibe no maximo 5 paginas ao redor da atual
  const range = 2
  let start = Math.max(1, current - range)
  let end = Math.min(total, current + range)

  // Ajusta para sempre mostrar 5 paginas se possivel
  if (end - start < range * 2) {
    if (start === 1) {
      end = Math.min(total, start + range * 2)
    } else if (end === total) {
      start = Math.max(1, end - range * 2)
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

/**
 * Trata click no header de coluna para ordenacao
 */
function handleSort(column: DataTableColumn) {
  if (!column.sortable) return

  let direction: 'asc' | 'desc' = 'asc'
  if (props.sortBy?.key === column.key && props.sortBy.direction === 'asc') {
    direction = 'desc'
  }

  emit('sort', { key: column.key, direction })
}

/**
 * Retorna icone de ordenacao para a coluna
 */
function getSortIndicator(column: DataTableColumn): string {
  if (!column.sortable) return ''
  if (props.sortBy?.key !== column.key) return ''
  return props.sortBy.direction === 'asc' ? ' \u2191' : ' \u2193'
}

/**
 * Navega para uma pagina
 */
function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}

/**
 * Acessa valor de uma celula no objeto de dados
 * Suporta chaves aninhadas (ex: "department.name")
 */
function getCellValue(row: Record<string, unknown>, key: string): unknown {
  const keys = key.split('.')
  let value: unknown = row
  for (const k of keys) {
    if (value === null || value === undefined) return '-'
    value = (value as Record<string, unknown>)[k]
  }
  return value ?? '-'
}
</script>

<template>
  <div class="data-table-wrapper">
    <!-- Estado de loading -->
    <div v-if="loading" class="data-table-loading">
      <LoadingSpinner text="Carregando..." />
    </div>

    <!-- Estado vazio -->
    <EmptyState
      v-else-if="data.length === 0"
      :title="emptyMessage"
      :description="emptyDescription"
    />

    <!-- Tabela com dados -->
    <template v-else>
      <div class="table-container">
        <table class="data-table" role="grid">
          <thead>
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                scope="col"
                :class="{
                  'th-sortable': col.sortable,
                  'th-sorted': sortBy?.key === col.key,
                  [`th-align-${col.align || 'left'}`]: true,
                }"
                :style="col.width ? { width: col.width } : {}"
                @click="handleSort(col)"
                :role="col.sortable ? 'columnheader button' : 'columnheader'"
                :aria-sort="sortBy?.key === col.key ? (sortBy.direction === 'asc' ? 'ascending' : 'descending') : undefined"
                :tabindex="col.sortable ? 0 : undefined"
                @keydown.enter="handleSort(col)"
                @keydown.space.prevent="handleSort(col)"
              >
                <span class="th-content">
                  {{ col.label }}
                  <span v-if="col.sortable" class="th-sort-indicator" aria-hidden="true">
                    {{ getSortIndicator(col) || ' \u2195' }}
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in data" :key="rowIndex">
              <td
                v-for="col in columns"
                :key="col.key"
                :class="{ [`td-align-${col.align || 'left'}`]: true }"
              >
                <!-- Slot nomeado para customizar celula de uma coluna especifica -->
                <slot :name="`cell-${col.key}`" :row="row" :value="getCellValue(row, col.key)" :index="rowIndex">
                  {{ getCellValue(row, col.key) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginacao -->
      <nav v-if="showPagination" class="pagination" role="navigation" aria-label="Paginacao">
        <button
          class="pagination-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
          aria-label="Pagina anterior"
        >
          Anterior
        </button>

        <div class="pagination-pages">
          <!-- Primeira pagina + ellipsis -->
          <template v-if="pageNumbers.length > 0 && pageNumbers[0] > 1">
            <button class="pagination-page" @click="goToPage(1)">1</button>
            <span v-if="pageNumbers[0] > 2" class="pagination-ellipsis">...</span>
          </template>

          <!-- Paginas visíveis -->
          <button
            v-for="page in pageNumbers"
            :key="page"
            class="pagination-page"
            :class="{ 'pagination-page--active': page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <!-- Ultima pagina + ellipsis -->
          <template v-if="pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1] < totalPages">
            <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1" class="pagination-ellipsis">...</span>
            <button class="pagination-page" @click="goToPage(totalPages)">{{ totalPages }}</button>
          </template>
        </div>

        <button
          class="pagination-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
          aria-label="Proxima pagina"
        >
          Proxima
        </button>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  width: 100%;
}

/* Loading */
.data-table-loading {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Container da tabela */
.table-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  overflow-x: auto;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Tabela */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

/* Headers */
.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 2px solid var(--color-border);
  background-color: var(--table-header-bg);
  white-space: nowrap;
  user-select: none;
  transition: color 0.2s ease, background-color 0.3s ease;
}

.th-sortable {
  cursor: pointer;
}

.th-sortable:hover {
  color: var(--color-text-secondary);
}

.th-sorted {
  color: var(--color-primary);
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.th-sort-indicator {
  font-size: 0.688rem;
  opacity: 0.5;
}

.th-sorted .th-sort-indicator {
  opacity: 1;
}

/* Alinhamento */
.th-align-left,
.td-align-left {
  text-align: left;
}

.th-align-center,
.td-align-center {
  text-align: center;
}

.th-align-right,
.td-align-right {
  text-align: right;
}

/* Celulas */
.data-table td {
  padding: 0.75rem 1rem;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  border-bottom: var(--border-width) solid var(--table-row-border-color);
  transition: background-color 0.15s ease, color 0.3s ease;
}

.data-table tbody tr:hover {
  background-color: var(--table-row-hover-bg);
}

.data-table tbody tr:nth-child(even) {
  background-color: var(--color-bg-subtle);
}

.data-table tbody tr:nth-child(even):hover {
  background-color: var(--table-row-hover-bg);
}

/* Paginacao */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  padding: var(--pagination-btn-padding-y) var(--pagination-btn-padding-x);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-page:hover:not(.pagination-page--active) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.pagination-page--active {
  background: var(--color-primary-gradient);
  color: white;
  border-color: transparent;
  cursor: default;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
}

/* Responsivo */
@media (max-width: 768px) {
  .data-table th,
  .data-table td {
    padding: 0.5rem 0.625rem;
    font-size: 0.75rem;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .pagination-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.813rem;
  }

  .pagination-page {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}
</style>

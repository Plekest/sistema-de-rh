<script setup lang="ts">
import type { Department } from '@/modules/employees/types'

interface Props {
  type: 'requisitions' | 'candidates'
  // Filtros de vagas
  filterReqStatus?: string
  filterReqDepartment?: number | null
  filterReqType?: string
  // Filtros de candidatos
  filterCandRequisition?: number | null
  filterCandStatus?: string
  filterCandStage?: number | null
  filterCandSearch?: string
  // Dados auxiliares
  departments: Department[]
  requisitions?: any[]
  stages?: any[]
  // Labels
  requisitionStatusLabels?: Record<string, string>
  employmentTypeLabels?: Record<string, string>
  candidateStatusLabels?: Record<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  'update:filterReqStatus': [value: string]
  'update:filterReqDepartment': [value: number | null]
  'update:filterReqType': [value: string]
  'update:filterCandRequisition': [value: number | null]
  'update:filterCandStatus': [value: string]
  'update:filterCandStage': [value: number | null]
  'update:filterCandSearch': [value: string]
  reload: []
}>()
</script>

<template>
  <div class="filters-bar">
    <!-- Filtros de Vagas -->
    <template v-if="type === 'requisitions'">
      <div class="filter-group">
        <label for="filter-req-status">Status</label>
        <select
          id="filter-req-status"
          :value="filterReqStatus"
          @change="emit('update:filterReqStatus', ($event.target as HTMLSelectElement).value); emit('reload')"
        >
          <option value="">Todos os status</option>
          <option v-for="(label, key) in requisitionStatusLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-req-dept">Departamento</label>
        <select
          id="filter-req-dept"
          :value="filterReqDepartment || ''"
          @change="emit('update:filterReqDepartment', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null); emit('reload')"
        >
          <option value="">Todos</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-req-type">Tipo</label>
        <select
          id="filter-req-type"
          :value="filterReqType"
          @change="emit('update:filterReqType', ($event.target as HTMLSelectElement).value); emit('reload')"
        >
          <option value="">Todos</option>
          <option v-for="(label, key) in employmentTypeLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
    </template>

    <!-- Filtros de Candidatos -->
    <template v-if="type === 'candidates'">
      <div class="filter-group">
        <label for="filter-cand-req">Vaga</label>
        <select
          id="filter-cand-req"
          :value="filterCandRequisition || ''"
          @change="emit('update:filterCandRequisition', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null); emit('reload')"
        >
          <option value="">Todas</option>
          <option v-for="req in requisitions" :key="req.id" :value="req.id">
            {{ req.title }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-cand-status">Status</label>
        <select
          id="filter-cand-status"
          :value="filterCandStatus"
          @change="emit('update:filterCandStatus', ($event.target as HTMLSelectElement).value); emit('reload')"
        >
          <option value="">Todos</option>
          <option v-for="(label, key) in candidateStatusLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-cand-stage">Etapa</label>
        <select
          id="filter-cand-stage"
          :value="filterCandStage || ''"
          @change="emit('update:filterCandStage', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null); emit('reload')"
        >
          <option value="">Todas</option>
          <option v-for="stage in stages" :key="stage.id" :value="stage.id">
            {{ stage.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-cand-search">Buscar</label>
        <input
          id="filter-cand-search"
          type="text"
          :value="filterCandSearch"
          @input="emit('update:filterCandSearch', ($event.target as HTMLInputElement).value); emit('reload')"
          placeholder="Nome ou email"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #667eea;
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }
}
</style>

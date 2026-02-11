<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import employeeService from '../services/employee.service'
import type { Employee } from '../types'
import { formatDate, formatCurrency, formatCpf, formatCnpj, formatPhone } from '@/utils/formatters'

const router = useRouter()
const route = useRoute()

const employeeId = Number(route.params.id)

// Estado
const employee = ref<Employee | null>(null)
const isLoading = ref(false)
const error = ref('')
const activeTab = ref<'data' | 'documents' | 'attendance' | 'hours' | 'history'>('data')

/**
 * Carrega dados do colaborador
 */
async function loadEmployee() {
  try {
    isLoading.value = true
    error.value = ''
    employee.value = await employeeService.getById(employeeId)
  } catch (err: unknown) {
    error.value = 'Erro ao carregar dados do colaborador.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push('/employees')
}

function goToEdit() {
  router.push(`/employees/${employeeId}/edit`)
}

function typeLabel(type: string): string {
  return type === 'clt' ? 'CLT' : 'PJ'
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    terminated: 'Desligado',
  }
  return map[status] || status
}

const tabs = [
  { key: 'data' as const, label: 'Dados' },
  { key: 'documents' as const, label: 'Documentos' },
  { key: 'attendance' as const, label: 'Ponto' },
  { key: 'hours' as const, label: 'Banco de Horas' },
  { key: 'history' as const, label: 'Historico' },
]

onMounted(() => {
  loadEmployee()
})
</script>

<template>
  <div class="employee-detail">
    <div class="page-header">
      <div>
        <button class="btn-back" @click="goBack">Voltar</button>
        <h1 class="page-title" v-if="employee">{{ employee.fullName }}</h1>
        <h1 class="page-title" v-else>Colaborador</h1>
      </div>
      <button v-if="employee" class="btn btn-primary" @click="goToEdit">
        Editar
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="isLoading" class="loading-state">Carregando...</div>

    <template v-else-if="employee">
      <!-- Info resumo -->
      <div class="summary-bar">
        <div class="summary-item">
          <span class="summary-label">Tipo</span>
          <span class="badge" :class="'badge-' + employee.type">{{ typeLabel(employee.type) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Departamento</span>
          <span class="summary-value">{{ employee.department?.name || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Cargo</span>
          <span class="summary-value">{{ employee.position?.title || '-' }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Status</span>
          <span class="badge" :class="'badge-' + employee.status">{{ statusLabel(employee.status) }}</span>
        </div>
      </div>

      <!-- Abas -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Dados -->
        <div v-show="activeTab === 'data'" class="tab-content">
          <div class="detail-grid">
            <section class="detail-section">
              <h3 class="section-title">Dados Pessoais</h3>
              <div class="detail-fields">
                <div class="detail-field">
                  <span class="field-label">Nome Completo</span>
                  <span class="field-value">{{ employee.fullName }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Email</span>
                  <span class="field-value">{{ employee.email }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Telefone</span>
                  <span class="field-value">{{ formatPhone(employee.phone) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">CPF</span>
                  <span class="field-value">{{ formatCpf(employee.cpf) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">CNPJ</span>
                  <span class="field-value">{{ formatCnpj(employee.cnpj) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">RG</span>
                  <span class="field-value">{{ employee.rg || '-' }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Data de Nascimento</span>
                  <span class="field-value">{{ formatDate(employee.birthDate) }}</span>
                </div>
              </div>
            </section>

            <section class="detail-section">
              <h3 class="section-title">Dados Profissionais</h3>
              <div class="detail-fields">
                <div class="detail-field">
                  <span class="field-label">Matricula</span>
                  <span class="field-value">{{ employee.registrationNumber || '-' }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Data de Admissao</span>
                  <span class="field-value">{{ formatDate(employee.hireDate) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Data de Desligamento</span>
                  <span class="field-value">{{ formatDate(employee.terminationDate) }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Salario</span>
                  <span class="field-value">{{ employee.salary ? formatCurrency(employee.salary) : '-' }}</span>
                </div>
              </div>
            </section>

            <section class="detail-section">
              <h3 class="section-title">Endereco</h3>
              <div class="detail-fields">
                <div class="detail-field detail-field-full">
                  <span class="field-label">Logradouro</span>
                  <span class="field-value">
                    {{ employee.addressStreet || '-' }}
                    {{ employee.addressNumber ? ', ' + employee.addressNumber : '' }}
                    {{ employee.addressComplement ? ' - ' + employee.addressComplement : '' }}
                  </span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Bairro</span>
                  <span class="field-value">{{ employee.addressNeighborhood || '-' }}</span>
                </div>
                <div class="detail-field">
                  <span class="field-label">Cidade / Estado</span>
                  <span class="field-value">
                    {{ employee.addressCity || '-' }}{{ employee.addressState ? ' / ' + employee.addressState : '' }}
                  </span>
                </div>
                <div class="detail-field">
                  <span class="field-label">CEP</span>
                  <span class="field-value">{{ employee.addressZip || '-' }}</span>
                </div>
              </div>
            </section>

            <section v-if="employee.notes" class="detail-section">
              <h3 class="section-title">Observacoes</h3>
              <p class="notes-text">{{ employee.notes }}</p>
            </section>
          </div>
        </div>

        <!-- Documentos -->
        <div v-show="activeTab === 'documents'" class="tab-content">
          <div class="tab-placeholder">
            <p>Para gerenciar documentos deste colaborador, acesse a secao</p>
            <RouterLink to="/documents" class="tab-link">Documentos</RouterLink>
          </div>
        </div>

        <!-- Ponto -->
        <div v-show="activeTab === 'attendance'" class="tab-content">
          <div class="tab-placeholder">
            <p>Para visualizar registros de ponto, acesse a secao</p>
            <RouterLink to="/attendance" class="tab-link">Registro de Ponto</RouterLink>
          </div>
        </div>

        <!-- Banco de Horas -->
        <div v-show="activeTab === 'hours'" class="tab-content">
          <div class="tab-placeholder">
            <p>Para visualizar banco de horas, acesse a secao</p>
            <RouterLink to="/hours-bank" class="tab-link">Banco de Horas</RouterLink>
          </div>
        </div>

        <!-- Historico -->
        <div v-show="activeTab === 'history'" class="tab-content">
          <div class="tab-placeholder">
            <p>Para visualizar o historico deste colaborador, acesse a secao</p>
            <RouterLink to="/history" class="tab-link">Historico</RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.employee-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0.5rem 0 0;
}

.btn-back {
  background: none;
  border: none;
  color: #2b6cb0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background-color: #2b6cb0;
  color: #fff;
}

.btn-primary:hover {
  background-color: #2c5282;
}

/* Summary bar */
.summary-bar {
  display: flex;
  gap: 2rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 500;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.badge-clt { background-color: #ebf4ff; color: #2b6cb0; }
.badge-pj { background-color: #faf5ff; color: #6b46c1; }
.badge-active { background-color: #f0fff4; color: #276749; }
.badge-inactive { background-color: #fffff0; color: #975a16; }
.badge-terminated { background-color: #fff5f5; color: #c53030; }

/* Tabs */
.tabs-container {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  padding: 0 1.25rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.875rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.tab-btn:hover { color: #2d3748; }
.tab-btn.active { color: #2b6cb0; border-bottom-color: #2b6cb0; }

.tab-content {
  padding: 1.5rem 1.25rem;
}

/* Detail grid */
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1.5rem;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-field-full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
}

.field-value {
  font-size: 0.875rem;
  color: #2d3748;
}

.notes-text {
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

/* Placeholder */
.tab-placeholder {
  text-align: center;
  padding: 2rem 1rem;
  color: #718096;
  font-size: 0.875rem;
}

.tab-placeholder p {
  margin: 0 0 0.5rem;
}

.tab-link {
  color: #2b6cb0;
  font-weight: 500;
  text-decoration: none;
}

.tab-link:hover {
  text-decoration: underline;
}

/* Alertas e estados */
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.loading-state { text-align: center; padding: 3rem 1rem; color: #718096; font-size: 0.875rem; }

/* Responsivo */
@media (max-width: 768px) {
  .summary-bar { flex-direction: column; gap: 0.75rem; }
  .detail-fields { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 1rem; }
}
</style>

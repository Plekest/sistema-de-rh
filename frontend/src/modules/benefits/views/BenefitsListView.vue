<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import benefitsService from '../services/benefits.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { Benefit, EmployeeBenefit, CreateBenefitData, CreatePlanData, EnrollEmployeeData, AddDependentData } from '../types'
import { BENEFIT_TYPE_LABELS, ENROLLMENT_STATUS_LABELS, RELATIONSHIP_LABELS } from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()

// Estado
const benefits = ref<Benefit[]>([])
const employeeBenefits = ref<EmployeeBenefit[]>([])
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Tabs
const activeTab = ref<'catalog' | 'myBenefits'>('catalog')

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

// Filtro de tipo
const filterType = ref<string>('')
const typeOptions = Object.keys(BENEFIT_TYPE_LABELS)

// Formulário novo benefício
const showBenefitForm = ref(false)
const benefitFormLoading = ref(false)
const benefitFormError = ref('')
const benefitFormData = ref<CreateBenefitData>({
  name: '',
  type: '',
  description: '',
  provider: '',
})

// Formulário novo plano
const showPlanForm = ref(false)
const planFormLoading = ref(false)
const planFormError = ref('')
const selectedBenefitId = ref<number | null>(null)
const planFormData = ref<CreatePlanData>({
  benefitId: 0,
  name: '',
  monthlyValue: 0,
  employeeDiscountValue: null,
  employeeDiscountPercentage: null,
})

// Formulário de adesão
const showEnrollForm = ref(false)
const enrollFormLoading = ref(false)
const enrollFormError = ref('')
const enrollFormData = ref<EnrollEmployeeData>({
  employeeId: 0,
  benefitPlanId: 0,
  enrollmentDate: new Date().toISOString().split('T')[0] as string,
  notes: '',
})

// Formulário de dependente
const showDependentForm = ref(false)
const dependentFormLoading = ref(false)
const dependentFormError = ref('')
const selectedEnrollmentId = ref<number | null>(null)
const dependentFormData = ref<AddDependentData>({
  name: '',
  cpf: '',
  birthDate: '',
  relationship: 'spouse',
})

// Benefício expandido para ver planos
const expandedBenefitId = ref<number | null>(null)

/**
 * Carrega catálogo de benefícios
 */
async function loadBenefits() {
  try {
    isLoading.value = true
    error.value = ''

    const filters: any = { limit: 100 }
    if (filterType.value) filters.type = filterType.value

    const response = await benefitsService.list(filters)
    benefits.value = response.data
  } catch (err: unknown) {
    error.value = 'Erro ao carregar beneficios.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Carrega benefícios do colaborador logado
 */
async function loadEmployeeBenefits() {
  if (!authStore.employeeId) return

  try {
    isLoading.value = true
    error.value = ''
    employeeBenefits.value = await benefitsService.getEmployeeBenefits(authStore.employeeId)
  } catch (err: unknown) {
    error.value = 'Erro ao carregar seus beneficios.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Carrega lista de colaboradores (admin/manager)
 */
async function loadEmployees() {
  try {
    const response = await employeeService.getAll({ limit: 200, status: 'active' })
    employees.value = response.data
  } catch (err: unknown) {
    console.error('Erro ao carregar colaboradores:', err)
  }
}

/**
 * Expande/colapsa planos de um benefício
 */
function toggleExpand(benefitId: number) {
  expandedBenefitId.value = expandedBenefitId.value === benefitId ? null : benefitId
}

// --- Benefício CRUD ---

function openBenefitForm() {
  showBenefitForm.value = true
  benefitFormError.value = ''
  benefitFormData.value = { name: '', type: '', description: '', provider: '' }
}

function closeBenefitForm() {
  showBenefitForm.value = false
  benefitFormError.value = ''
}

async function submitBenefitForm() {
  try {
    benefitFormLoading.value = true
    benefitFormError.value = ''

    if (!benefitFormData.value.name) {
      benefitFormError.value = 'Informe o nome do beneficio'
      return
    }
    if (!benefitFormData.value.type) {
      benefitFormError.value = 'Selecione o tipo do beneficio'
      return
    }

    await benefitsService.create(benefitFormData.value)
    successMessage.value = 'Beneficio criado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    closeBenefitForm()
    loadBenefits()
  } catch (err: any) {
    benefitFormError.value = err.response?.data?.message || 'Erro ao criar beneficio'
    console.error(err)
  } finally {
    benefitFormLoading.value = false
  }
}

async function deleteBenefit(id: number) {
  const result = await confirmDialog({
    title: 'Desativar Beneficio',
    message: 'Confirma a desativacao deste beneficio?',
    variant: 'danger',
    confirmLabel: 'Desativar',
  })

  if (!result) return

  try {
    await benefitsService.delete(id)
    successMessage.value = 'Beneficio desativado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    loadBenefits()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao desativar beneficio'
    console.error(err)
  }
}

// --- Plano CRUD ---

function openPlanForm(benefitId: number) {
  selectedBenefitId.value = benefitId
  showPlanForm.value = true
  planFormError.value = ''
  planFormData.value = {
    benefitId,
    name: '',
    monthlyValue: 0,
    employeeDiscountValue: null,
    employeeDiscountPercentage: null,
  }
}

function closePlanForm() {
  showPlanForm.value = false
  planFormError.value = ''
}

async function submitPlanForm() {
  try {
    planFormLoading.value = true
    planFormError.value = ''

    if (!planFormData.value.name) {
      planFormError.value = 'Informe o nome do plano'
      return
    }
    if (planFormData.value.monthlyValue <= 0) {
      planFormError.value = 'Informe o valor mensal'
      return
    }

    await benefitsService.createPlan(planFormData.value.benefitId, planFormData.value)
    successMessage.value = 'Plano criado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    closePlanForm()
    loadBenefits()
  } catch (err: any) {
    planFormError.value = err.response?.data?.message || 'Erro ao criar plano'
    console.error(err)
  } finally {
    planFormLoading.value = false
  }
}

// --- Adesão ---

function openEnrollForm(benefitPlanId: number) {
  showEnrollForm.value = true
  enrollFormError.value = ''
  enrollFormData.value = {
    employeeId: isAdmin.value ? 0 : (authStore.employeeId || 0),
    benefitPlanId,
    enrollmentDate: new Date().toISOString().split('T')[0] as string,
    notes: '',
  }
}

function closeEnrollForm() {
  showEnrollForm.value = false
  enrollFormError.value = ''
}

async function submitEnrollForm() {
  try {
    enrollFormLoading.value = true
    enrollFormError.value = ''

    if (!enrollFormData.value.employeeId) {
      enrollFormError.value = 'Selecione um colaborador'
      return
    }

    await benefitsService.enroll(enrollFormData.value.employeeId, enrollFormData.value)
    successMessage.value = 'Adesao realizada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    closeEnrollForm()
    if (!isAdmin.value) loadEmployeeBenefits()
  } catch (err: any) {
    enrollFormError.value = err.response?.data?.message || 'Erro ao realizar adesao'
    console.error(err)
  } finally {
    enrollFormLoading.value = false
  }
}

async function cancelEnrollment(enrollment: EmployeeBenefit) {
  const result = await confirmDialog({
    title: 'Cancelar Adesao',
    message: 'Confirma o cancelamento desta adesao?',
    variant: 'warning',
    confirmLabel: 'Cancelar Adesao',
  })

  if (!result) return

  try {
    await benefitsService.cancelEnrollment(enrollment.employeeId, enrollment.id)
    successMessage.value = 'Adesao cancelada com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    loadEmployeeBenefits()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao cancelar adesao'
    console.error(err)
  }
}

// --- Dependentes ---

function openDependentForm(enrollmentId: number) {
  selectedEnrollmentId.value = enrollmentId
  showDependentForm.value = true
  dependentFormError.value = ''
  dependentFormData.value = { name: '', cpf: '', birthDate: '', relationship: 'spouse' }
}

function closeDependentForm() {
  showDependentForm.value = false
  dependentFormError.value = ''
}

async function submitDependentForm() {
  try {
    dependentFormLoading.value = true
    dependentFormError.value = ''

    if (!dependentFormData.value.name) {
      dependentFormError.value = 'Informe o nome do dependente'
      return
    }

    await benefitsService.addDependent(selectedEnrollmentId.value!, dependentFormData.value)
    successMessage.value = 'Dependente adicionado com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    closeDependentForm()
    loadEmployeeBenefits()
  } catch (err: any) {
    dependentFormError.value = err.response?.data?.message || 'Erro ao adicionar dependente'
    console.error(err)
  } finally {
    dependentFormLoading.value = false
  }
}

async function removeDependent(dependentId: number) {
  const result = await confirmDialog({
    title: 'Remover Dependente',
    message: 'Confirma a remocao deste dependente?',
    variant: 'danger',
    confirmLabel: 'Remover',
  })

  if (!result) return

  try {
    await benefitsService.removeDependent(dependentId)
    successMessage.value = 'Dependente removido com sucesso!'
    setTimeout(() => { successMessage.value = '' }, 3000)
    loadEmployeeBenefits()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao remover dependente'
    console.error(err)
  }
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/**
 * Formata data para exibição
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Retorna classe CSS para badge de status
 */
function statusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'badge-active',
    cancelled: 'badge-cancelled',
    suspended: 'badge-suspended',
  }
  return classes[status] || ''
}

onMounted(() => {
  loadBenefits()
  if (isAdmin.value) {
    loadEmployees()
  }
  if (authStore.employeeId) {
    loadEmployeeBenefits()
  }
})
</script>

<template>
  <div class="benefits-view">
    <div class="page-header">
      <h1 class="page-title">Beneficios</h1>
      <button v-if="isAdmin" class="btn-primary" @click="openBenefitForm">Novo Beneficio</button>
    </div>

    <!-- Mensagens -->
    <div v-if="successMessage" class="alert alert-success" role="alert">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'catalog' }"
        @click="activeTab = 'catalog'; loadBenefits()"
      >
        Catalogo de Beneficios
      </button>
      <button
        v-if="authStore.employeeId"
        class="tab"
        :class="{ 'tab-active': activeTab === 'myBenefits' }"
        @click="activeTab = 'myBenefits'; loadEmployeeBenefits()"
      >
        Meus Beneficios
      </button>
    </div>

    <!-- === TAB: CATÁLOGO === -->
    <template v-if="activeTab === 'catalog'">
      <!-- Filtro -->
      <div class="filters-bar">
        <div class="filter-group">
          <label for="filter-type">Tipo</label>
          <select id="filter-type" v-model="filterType" @change="loadBenefits">
            <option value="">Todos os tipos</option>
            <option v-for="type in typeOptions" :key="type" :value="type">
              {{ BENEFIT_TYPE_LABELS[type] }}
            </option>
          </select>
        </div>
      </div>

      <!-- Formulário novo benefício -->
      <div v-if="showBenefitForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Beneficio</h2>
          <button class="btn-close" @click="closeBenefitForm">Fechar</button>
        </div>

        <div v-if="benefitFormError" class="alert alert-error" role="alert">{{ benefitFormError }}</div>

        <form @submit.prevent="submitBenefitForm" class="form-grid">
          <div class="form-group">
            <label for="ben-name">Nome *</label>
            <input id="ben-name" type="text" v-model="benefitFormData.name" required />
          </div>

          <div class="form-group">
            <label for="ben-type">Tipo *</label>
            <select id="ben-type" v-model="benefitFormData.type" required>
              <option value="">Selecione...</option>
              <option v-for="type in typeOptions" :key="type" :value="type">
                {{ BENEFIT_TYPE_LABELS[type] }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="ben-provider">Fornecedor</label>
            <input id="ben-provider" type="text" v-model="benefitFormData.provider" />
          </div>

          <div class="form-group">
            <label for="ben-desc">Descricao</label>
            <input id="ben-desc" type="text" v-model="benefitFormData.description" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeBenefitForm" :disabled="benefitFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="benefitFormLoading">
              {{ benefitFormLoading ? 'Criando...' : 'Criar Beneficio' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Formulário novo plano -->
      <div v-if="showPlanForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Novo Plano</h2>
          <button class="btn-close" @click="closePlanForm">Fechar</button>
        </div>

        <div v-if="planFormError" class="alert alert-error" role="alert">{{ planFormError }}</div>

        <form @submit.prevent="submitPlanForm" class="form-grid">
          <div class="form-group">
            <label for="plan-name">Nome do Plano *</label>
            <input id="plan-name" type="text" v-model="planFormData.name" required />
          </div>

          <div class="form-group">
            <label for="plan-value">Valor Mensal (R$) *</label>
            <input id="plan-value" type="number" step="0.01" min="0" v-model="planFormData.monthlyValue" required />
          </div>

          <div class="form-group">
            <label for="plan-disc-val">Desconto Colaborador (R$)</label>
            <input id="plan-disc-val" type="number" step="0.01" min="0" v-model="planFormData.employeeDiscountValue" />
          </div>

          <div class="form-group">
            <label for="plan-disc-pct">Desconto Colaborador (%)</label>
            <input id="plan-disc-pct" type="number" step="0.01" min="0" max="100" v-model="planFormData.employeeDiscountPercentage" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closePlanForm" :disabled="planFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="planFormLoading">
              {{ planFormLoading ? 'Criando...' : 'Criar Plano' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Formulário adesão -->
      <div v-if="showEnrollForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Adesao a Beneficio</h2>
          <button class="btn-close" @click="closeEnrollForm">Fechar</button>
        </div>

        <div v-if="enrollFormError" class="alert alert-error" role="alert">{{ enrollFormError }}</div>

        <form @submit.prevent="submitEnrollForm" class="form-grid">
          <div v-if="isAdmin" class="form-group form-col-full">
            <label for="enroll-emp">Colaborador *</label>
            <select id="enroll-emp" v-model="enrollFormData.employeeId" required>
              <option :value="0">Selecione...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="enroll-date">Data de Adesao *</label>
            <input id="enroll-date" type="date" v-model="enrollFormData.enrollmentDate" required />
          </div>

          <div class="form-group form-col-full">
            <label for="enroll-notes">Observacoes</label>
            <textarea id="enroll-notes" v-model="enrollFormData.notes" rows="2"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeEnrollForm" :disabled="enrollFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="enrollFormLoading">
              {{ enrollFormLoading ? 'Realizando...' : 'Realizar Adesao' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de benefícios -->
      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="benefits.length > 0" class="benefits-list">
        <div v-for="benefit in benefits" :key="benefit.id" class="benefit-card">
          <div class="benefit-header" @click="toggleExpand(benefit.id)">
            <div class="benefit-info">
              <span class="benefit-type-tag">{{ BENEFIT_TYPE_LABELS[benefit.type] || benefit.type }}</span>
              <h3 class="benefit-name">{{ benefit.name }}</h3>
              <span v-if="benefit.provider" class="benefit-provider">{{ benefit.provider }}</span>
            </div>
            <div class="benefit-actions-header">
              <span class="benefit-plans-count">
                {{ benefit.plans?.length || 0 }} plano(s)
              </span>
              <span class="expand-indicator">{{ expandedBenefitId === benefit.id ? '−' : '+' }}</span>
            </div>
          </div>

          <div v-if="benefit.description" class="benefit-description">
            {{ benefit.description }}
          </div>

          <!-- Planos expandidos -->
          <div v-if="expandedBenefitId === benefit.id" class="plans-section">
            <div class="plans-header">
              <span class="plans-title">Planos Disponiveis</span>
              <button v-if="isAdmin" class="btn-small" @click.stop="openPlanForm(benefit.id)">Adicionar Plano</button>
            </div>

            <div v-if="benefit.plans && benefit.plans.length > 0" class="plans-list">
              <div v-for="plan in benefit.plans" :key="plan.id" class="plan-row">
                <div class="plan-info">
                  <span class="plan-name">{{ plan.name }}</span>
                  <span class="plan-value">{{ formatCurrency(plan.monthlyValue) }}/mes</span>
                  <span v-if="plan.employeeDiscountValue" class="plan-discount">
                    Desconto: {{ formatCurrency(plan.employeeDiscountValue) }}
                  </span>
                  <span v-else-if="plan.employeeDiscountPercentage" class="plan-discount">
                    Desconto: {{ plan.employeeDiscountPercentage }}%
                  </span>
                </div>
                <div class="plan-actions">
                  <button class="btn-action btn-approve" @click.stop="openEnrollForm(plan.id)">
                    Aderir
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="plans-empty">
              Nenhum plano cadastrado.
            </div>

            <div v-if="isAdmin" class="benefit-admin-actions">
              <button class="btn-action btn-cancel" @click.stop="deleteBenefit(benefit.id)">
                Desativar Beneficio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum beneficio encontrado</p>
        <p class="empty-description">Nao ha beneficios cadastrados no sistema.</p>
      </div>
    </template>

    <!-- === TAB: MEUS BENEFÍCIOS === -->
    <template v-if="activeTab === 'myBenefits'">
      <!-- Formulário de dependente -->
      <div v-if="showDependentForm" class="form-card">
        <div class="form-header">
          <h2 class="form-title">Adicionar Dependente</h2>
          <button class="btn-close" @click="closeDependentForm">Fechar</button>
        </div>

        <div v-if="dependentFormError" class="alert alert-error" role="alert">{{ dependentFormError }}</div>

        <form @submit.prevent="submitDependentForm" class="form-grid">
          <div class="form-group">
            <label for="dep-name">Nome *</label>
            <input id="dep-name" type="text" v-model="dependentFormData.name" required />
          </div>

          <div class="form-group">
            <label for="dep-rel">Parentesco *</label>
            <select id="dep-rel" v-model="dependentFormData.relationship" required>
              <option v-for="(label, key) in RELATIONSHIP_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="dep-cpf">CPF</label>
            <input id="dep-cpf" type="text" v-model="dependentFormData.cpf" maxlength="11" placeholder="Somente numeros" />
          </div>

          <div class="form-group">
            <label for="dep-birth">Data de Nascimento</label>
            <input id="dep-birth" type="date" v-model="dependentFormData.birthDate" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeDependentForm" :disabled="dependentFormLoading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="dependentFormLoading">
              {{ dependentFormLoading ? 'Adicionando...' : 'Adicionar Dependente' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="isLoading" class="loading-state">Carregando...</div>

      <div v-else-if="employeeBenefits.length > 0" class="my-benefits-list">
        <div v-for="enrollment in employeeBenefits" :key="enrollment.id" class="enrollment-card">
          <div class="enrollment-header">
            <div class="enrollment-info">
              <span class="benefit-type-tag">
                {{ BENEFIT_TYPE_LABELS[enrollment.benefitPlan?.benefit?.type || ''] || '' }}
              </span>
              <h3 class="enrollment-benefit-name">
                {{ enrollment.benefitPlan?.benefit?.name || '' }} - {{ enrollment.benefitPlan?.name || '' }}
              </h3>
            </div>
            <span class="badge" :class="statusBadgeClass(enrollment.status)">
              {{ ENROLLMENT_STATUS_LABELS[enrollment.status] || enrollment.status }}
            </span>
          </div>

          <div class="enrollment-details">
            <div class="detail-item">
              <span class="detail-label">Valor Mensal</span>
              <span class="detail-value">{{ formatCurrency(enrollment.benefitPlan?.monthlyValue || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Data de Adesao</span>
              <span class="detail-value">{{ formatDate(enrollment.enrollmentDate) }}</span>
            </div>
            <div v-if="enrollment.benefitPlan?.employeeDiscountValue" class="detail-item">
              <span class="detail-label">Desconto</span>
              <span class="detail-value">{{ formatCurrency(enrollment.benefitPlan.employeeDiscountValue) }}</span>
            </div>
            <div v-else-if="enrollment.benefitPlan?.employeeDiscountPercentage" class="detail-item">
              <span class="detail-label">Desconto</span>
              <span class="detail-value">{{ enrollment.benefitPlan.employeeDiscountPercentage }}%</span>
            </div>
          </div>

          <!-- Dependentes -->
          <div v-if="enrollment.dependents && enrollment.dependents.length > 0" class="dependents-section">
            <span class="dependents-title">Dependentes</span>
            <div v-for="dep in enrollment.dependents" :key="dep.id" class="dependent-row">
              <span class="dependent-name">{{ dep.name }}</span>
              <span class="dependent-rel">{{ RELATIONSHIP_LABELS[dep.relationship] || dep.relationship }}</span>
              <span v-if="dep.birthDate" class="dependent-birth">{{ formatDate(dep.birthDate) }}</span>
              <button
                v-if="isAdmin || enrollment.status === 'active'"
                class="btn-action btn-cancel btn-tiny"
                @click="removeDependent(dep.id)"
              >
                Remover
              </button>
            </div>
          </div>

          <div class="enrollment-actions">
            <button
              v-if="enrollment.status === 'active'"
              class="btn-action btn-approve"
              @click="openDependentForm(enrollment.id)"
            >
              Adicionar Dependente
            </button>
            <button
              v-if="enrollment.status === 'active' && isAdmin"
              class="btn-action btn-cancel"
              @click="cancelEnrollment(enrollment)"
            >
              Cancelar Adesao
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum beneficio vinculado</p>
        <p class="empty-description">Voce nao possui beneficios ativos. Acesse o catalogo para realizar adesao.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.benefits-view {
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

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 0.625rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #4a5568;
}

.tab-active {
  color: #667eea;
  border-bottom-color: #667eea;
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

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #fff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-close {
  padding: 0.375rem 0.875rem;
  background: transparent;
  color: #718096;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transform: translateY(-1px);
}

.btn-action {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0.125rem;
}

.btn-approve {
  background: #c6f6d5;
  color: #276749;
}

.btn-approve:hover {
  background: #9ae6b4;
}

.btn-cancel {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
  background: #cbd5e0;
}

.btn-tiny {
  padding: 0.125rem 0.5rem;
  font-size: 0.688rem;
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

/* Filtros */
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
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  border-color: #667eea;
}

/* Formulário */
.form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-col-full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Cards de benefícios */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.benefit-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.benefit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.benefit-header:hover {
  background: #f7fafc;
}

.benefit-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.benefit-type-tag {
  display: inline-block;
  padding: 0.188rem 0.5rem;
  background: #ebf4ff;
  color: #667eea;
  border-radius: 4px;
  font-size: 0.688rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.benefit-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.benefit-provider {
  font-size: 0.813rem;
  color: #718096;
}

.benefit-actions-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.benefit-plans-count {
  font-size: 0.75rem;
  color: #718096;
}

.expand-indicator {
  font-size: 1.25rem;
  color: #a0aec0;
  font-weight: 300;
  width: 24px;
  text-align: center;
}

.benefit-description {
  padding: 0 1.25rem 0.75rem;
  font-size: 0.813rem;
  color: #718096;
}

/* Planos */
.plans-section {
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.25rem;
}

.plans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.plans-title {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.plan-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
}

.plan-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.plan-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
}

.plan-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
}

.plan-discount {
  font-size: 0.75rem;
  color: #718096;
}

.plan-actions {
  display: flex;
  gap: 0.25rem;
}

.plans-empty {
  font-size: 0.813rem;
  color: #a0aec0;
  text-align: center;
  padding: 0.75rem;
}

.benefit-admin-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #edf2f7;
  display: flex;
  justify-content: flex-end;
}

/* Meus Benefícios */
.my-benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.enrollment-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
}

.enrollment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.enrollment-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.enrollment-benefit-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.enrollment-details {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-label {
  font-size: 0.688rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 500;
}

/* Dependentes */
.dependents-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #edf2f7;
}

.dependents-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.5rem;
}

.dependent-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0;
  font-size: 0.813rem;
}

.dependent-name {
  font-weight: 500;
  color: #2d3748;
}

.dependent-rel {
  color: #718096;
}

.dependent-birth {
  color: #a0aec0;
}

.enrollment-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-active {
  background: #d1fae5;
  color: #065f46;
}

.badge-cancelled {
  background: #e2e8f0;
  color: #4a5568;
}

.badge-suspended {
  background: #fef3c7;
  color: #92400e;
}

/* Estados */
.loading-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #a0aec0;
  font-size: 0.875rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.empty-state p {
  margin: 0;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem !important;
}

.empty-description {
  font-size: 0.875rem;
  color: #a0aec0;
  margin: 0 !important;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .filters-bar {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .benefit-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .enrollment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .enrollment-details {
    flex-direction: column;
    gap: 0.75rem;
  }

  .plan-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .dependent-row {
    flex-wrap: wrap;
  }

  .enrollment-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }

  .enrollment-card {
    padding: 0.75rem;
  }

  .plans-section {
    padding: 0.75rem;
  }
}
</style>

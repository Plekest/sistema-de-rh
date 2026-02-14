<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import employeeService from '../services/employee.service'
import type { EmployeeFormData, Department, Position } from '../types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AppModal from '@/components/common/AppModal.vue'

const router = useRouter()
const route = useRoute()

const isEditing = computed(() => !!route.params.id)
const employeeId = computed(() => Number(route.params.id))
const pageTitle = computed(() => (isEditing.value ? 'Editar Colaborador' : 'Novo Colaborador'))

// Estado
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')
const activeTab = ref<'personal' | 'professional' | 'address' | 'notes'>('personal')

const departments = ref<Department[]>([])
const positions = ref<Position[]>([])

// Dados do formulario
const form = ref<EmployeeFormData>({
  fullName: '',
  cpf: '',
  cnpj: '',
  rg: '',
  email: '',
  phone: '',
  type: 'clt',
  departmentId: null,
  positionId: null,
  registrationNumber: '',
  hireDate: '',
  terminationDate: '',
  salary: null,
  status: 'active',
  birthDate: '',
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZip: '',
  notes: '',
})

// Erros de validacao
const errors = ref<Record<string, string>>({})

// F1.4: Modal de senha temporaria
const showPasswordModal = ref(false)
const temporaryPassword = ref('')
const passwordCopied = ref(false)

/**
 * Valida o formulario
 */
function validate(): boolean {
  errors.value = {}

  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Nome completo e obrigatorio'
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Email e obrigatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email invalido'
  }

  if (!form.value.hireDate) {
    errors.value.hireDate = 'Data de admissao e obrigatoria'
  }

  if (form.value.type === 'clt' && !form.value.cpf?.trim()) {
    errors.value.cpf = 'CPF e obrigatorio para CLT'
  }

  if (form.value.type === 'pj' && !form.value.cnpj?.trim()) {
    errors.value.cnpj = 'CNPJ e obrigatorio para PJ'
  }

  return Object.keys(errors.value).length === 0
}

/**
 * Copia a senha temporaria para a area de transferencia
 */
async function copyPassword() {
  try {
    await navigator.clipboard.writeText(temporaryPassword.value)
    passwordCopied.value = true
    setTimeout(() => { passwordCopied.value = false }, 3000)
  } catch {
    // Fallback para navegadores que nao suportam clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = temporaryPassword.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    passwordCopied.value = true
    setTimeout(() => { passwordCopied.value = false }, 3000)
  }
}

/**
 * Fecha modal de senha e redireciona para lista
 */
function closePasswordModal() {
  showPasswordModal.value = false
  temporaryPassword.value = ''
  router.push('/employees')
}

/**
 * Salva o colaborador (cria ou atualiza)
 */
async function handleSubmit() {
  if (!validate()) return

  try {
    isSaving.value = true
    error.value = ''
    successMessage.value = ''

    if (isEditing.value) {
      await employeeService.update(employeeId.value, form.value)
      successMessage.value = 'Colaborador atualizado com sucesso.'
      setTimeout(() => { successMessage.value = '' }, 5000)
      setTimeout(() => {
        router.push('/employees')
      }, 1000)
    } else {
      const result = await employeeService.create(form.value)

      // F1.4: Se a API retornou senha temporaria, exibe modal
      if (result.temporaryPassword) {
        temporaryPassword.value = result.temporaryPassword
        showPasswordModal.value = true
        passwordCopied.value = false
      } else {
        successMessage.value = 'Colaborador cadastrado com sucesso.'
        setTimeout(() => { successMessage.value = '' }, 5000)
        setTimeout(() => {
          router.push('/employees')
        }, 1000)
      }
    }
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
    if (axiosErr.response?.data?.errors) {
      const serverErrors = axiosErr.response.data.errors
      if (serverErrors) {
        for (const key in serverErrors) {
          errors.value[key] = serverErrors[key]?.[0] ?? ''
        }
      }
    } else if (axiosErr.response?.data?.message) {
      error.value = axiosErr.response.data.message
    } else {
      error.value = 'Erro ao salvar colaborador. Tente novamente.'
    }
  } finally {
    isSaving.value = false
  }
}

/**
 * Carrega dados do colaborador para edicao
 */
async function loadEmployee() {
  if (!isEditing.value) return

  try {
    isLoading.value = true
    const emp = await employeeService.getById(employeeId.value)
    form.value = {
      fullName: emp.fullName,
      cpf: emp.cpf || '',
      cnpj: emp.cnpj || '',
      rg: emp.rg || '',
      email: emp.email,
      phone: emp.phone || '',
      type: emp.type,
      departmentId: emp.departmentId || null,
      positionId: emp.positionId || null,
      registrationNumber: emp.registrationNumber || '',
      hireDate: emp.hireDate ? emp.hireDate.substring(0, 10) : '',
      terminationDate: emp.terminationDate ? emp.terminationDate.substring(0, 10) : '',
      salary: emp.salary || null,
      status: emp.status,
      birthDate: emp.birthDate ? emp.birthDate.substring(0, 10) : '',
      addressStreet: emp.addressStreet || '',
      addressNumber: emp.addressNumber || '',
      addressComplement: emp.addressComplement || '',
      addressNeighborhood: emp.addressNeighborhood || '',
      addressCity: emp.addressCity || '',
      addressState: emp.addressState || '',
      addressZip: emp.addressZip || '',
      notes: emp.notes || '',
    }
  } catch (err: unknown) {
    error.value = 'Erro ao carregar dados do colaborador.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Carrega departamentos e cargos
 */
async function loadOptions() {
  try {
    const [depts, pos] = await Promise.all([
      employeeService.getDepartments(),
      employeeService.getPositions(),
    ])
    departments.value = depts
    positions.value = pos
  } catch (err: unknown) {
    console.error('Erro ao carregar opcoes:', err)
  }
}

function goBack() {
  router.push('/employees')
}

const tabs = [
  { key: 'personal' as const, label: 'Dados Pessoais' },
  { key: 'professional' as const, label: 'Dados Profissionais' },
  { key: 'address' as const, label: 'Endereco' },
  { key: 'notes' as const, label: 'Observacoes' },
]

const brStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

onMounted(() => {
  loadOptions()
  loadEmployee()
})
</script>

<template>
  <div class="employee-form">
    <div class="page-header">
      <div>
        <button class="btn-back" @click="goBack">Voltar</button>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
    </div>

    <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>
    <Transition name="fade">
      <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">{{ successMessage }}</div>
    </Transition>

    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="Carregando dados do colaborador..." />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="form-card">
      <!-- Abas -->
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

      <!-- Dados Pessoais -->
      <div v-show="activeTab === 'personal'" class="tab-content">
        <div class="form-grid">
          <div class="form-group col-full">
            <label for="fullName">Nome Completo *</label>
            <input id="fullName" v-model="form.fullName" type="text" :class="{ 'input-error': errors.fullName }" />
            <span v-if="errors.fullName" class="field-error">{{ errors.fullName }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input id="email" v-model="form.email" type="email" :class="{ 'input-error': errors.email }" />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="phone">Telefone</label>
            <input id="phone" v-model="form.phone" type="text" placeholder="(11) 99999-9999" />
          </div>

          <div class="form-group">
            <label for="cpf">CPF</label>
            <input id="cpf" v-model="form.cpf" type="text" placeholder="000.000.000-00" :class="{ 'input-error': errors.cpf }" />
            <span v-if="errors.cpf" class="field-error">{{ errors.cpf }}</span>
          </div>

          <div class="form-group">
            <label for="cnpj">CNPJ</label>
            <input id="cnpj" v-model="form.cnpj" type="text" placeholder="00.000.000/0000-00" :class="{ 'input-error': errors.cnpj }" />
            <span v-if="errors.cnpj" class="field-error">{{ errors.cnpj }}</span>
          </div>

          <div class="form-group">
            <label for="rg">RG</label>
            <input id="rg" v-model="form.rg" type="text" />
          </div>

          <div class="form-group">
            <label for="birthDate">Data de Nascimento</label>
            <input id="birthDate" v-model="form.birthDate" type="date" />
          </div>
        </div>
      </div>

      <!-- Dados Profissionais -->
      <div v-show="activeTab === 'professional'" class="tab-content">
        <div class="form-grid">
          <div class="form-group">
            <label for="type">Tipo *</label>
            <select id="type" v-model="form.type">
              <option value="clt">CLT</option>
              <option value="pj">PJ</option>
            </select>
          </div>

          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" v-model="form.status">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="terminated">Desligado</option>
            </select>
          </div>

          <div class="form-group">
            <label for="registrationNumber">Matricula</label>
            <input id="registrationNumber" v-model="form.registrationNumber" type="text" />
          </div>

          <div class="form-group">
            <label for="departmentId">Departamento</label>
            <select id="departmentId" v-model="form.departmentId">
              <option :value="null">Selecione...</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="positionId">Cargo</label>
            <select id="positionId" v-model="form.positionId">
              <option :value="null">Selecione...</option>
              <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                {{ pos.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="hireDate">Data de Admissao *</label>
            <input id="hireDate" v-model="form.hireDate" type="date" :class="{ 'input-error': errors.hireDate }" />
            <span v-if="errors.hireDate" class="field-error">{{ errors.hireDate }}</span>
          </div>

          <div class="form-group">
            <label for="terminationDate">Data de Desligamento</label>
            <input id="terminationDate" v-model="form.terminationDate" type="date" />
          </div>

          <div class="form-group">
            <label for="salary">Salario (R$)</label>
            <input id="salary" v-model.number="form.salary" type="number" step="0.01" min="0" />
          </div>
        </div>
      </div>

      <!-- Endereco -->
      <div v-show="activeTab === 'address'" class="tab-content">
        <div class="form-grid">
          <div class="form-group col-full">
            <label for="addressStreet">Rua / Logradouro</label>
            <input id="addressStreet" v-model="form.addressStreet" type="text" />
          </div>

          <div class="form-group">
            <label for="addressNumber">Numero</label>
            <input id="addressNumber" v-model="form.addressNumber" type="text" />
          </div>

          <div class="form-group">
            <label for="addressComplement">Complemento</label>
            <input id="addressComplement" v-model="form.addressComplement" type="text" />
          </div>

          <div class="form-group">
            <label for="addressNeighborhood">Bairro</label>
            <input id="addressNeighborhood" v-model="form.addressNeighborhood" type="text" />
          </div>

          <div class="form-group">
            <label for="addressCity">Cidade</label>
            <input id="addressCity" v-model="form.addressCity" type="text" />
          </div>

          <div class="form-group">
            <label for="addressState">Estado</label>
            <select id="addressState" v-model="form.addressState">
              <option value="">Selecione...</option>
              <option v-for="state in brStates" :key="state" :value="state">{{ state }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="addressZip">CEP</label>
            <input id="addressZip" v-model="form.addressZip" type="text" placeholder="00000-000" />
          </div>
        </div>
      </div>

      <!-- Observacoes -->
      <div v-show="activeTab === 'notes'" class="tab-content">
        <div class="form-group col-full">
          <label for="notes">Observacoes</label>
          <textarea id="notes" v-model="form.notes" rows="6" placeholder="Observacoes sobre o colaborador..."></textarea>
        </div>
      </div>

      <!-- Botoes de acao -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alteracoes' : 'Cadastrar') }}
        </button>
      </div>
    </form>

    <!-- F1.4: Modal de senha temporaria -->
    <AppModal
      :show="showPasswordModal"
      title="Colaborador Cadastrado com Sucesso"
      size="sm"
      @close="closePasswordModal"
    >
      <div class="password-modal-content">
        <p class="password-info">
          Um usuario foi criado automaticamente para este colaborador.
          A senha temporaria gerada e:
        </p>

        <div class="password-display">
          <code class="password-value">{{ temporaryPassword }}</code>
          <button
            type="button"
            class="btn-copy"
            :class="{ 'btn-copied': passwordCopied }"
            @click="copyPassword"
          >
            {{ passwordCopied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>

        <div class="password-warning">
          <strong>Atencao:</strong> Anote esta senha. Ela nao sera exibida novamente.
          O colaborador devera alterar a senha no primeiro acesso.
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn btn-primary" @click="closePasswordModal">
          Entendi, fechar
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.employee-form {
  max-width: var(--max-width-lg, 900px);
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-12, 1.5rem);
}

.page-title {
  font-size: var(--font-size-3xl, 1.5rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #1a202c);
  margin: 0.5rem 0 0;
}

.btn-back {
  background: none;
  border: none;
  color: var(--color-primary, #667eea);
  font-size: var(--font-size-base, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

/* Form Card */
.form-card {
  background: var(--color-bg-card, #fff);
  border-radius: var(--card-border-radius, 8px);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: var(--border-width-thick, 2px) solid var(--color-border, #e2e8f0);
  padding: 0 1.25rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.875rem 1.25rem;
  background: none;
  border: none;
  border-bottom: var(--border-width-thick, 2px) solid transparent;
  margin-bottom: -2px;
  font-size: var(--font-size-base, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-muted, #718096);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast, 0.15s ease);
}

.tab-btn:hover {
  color: var(--color-text-secondary, #2d3748);
}

.tab-btn.active {
  color: var(--color-primary, #667eea);
  border-bottom-color: var(--color-primary, #667eea);
}

/* Tab content */
.tab-content {
  padding: 1.5rem 1.25rem;
}

/* Form grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8, 1rem);
}

.col-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.25rem);
}

.form-group label {
  font-size: var(--font-size-sm, 0.813rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-tertiary, #4a5568);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--input-padding-y, 0.5rem) var(--input-padding-x, 0.75rem);
  border: var(--border-width, 1px) solid var(--input-border-color, #e2e8f0);
  border-radius: var(--input-border-radius, 5px);
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-secondary, #2d3748);
  background: var(--color-bg-input, #fff);
  outline: none;
  transition: border-color var(--transition-fast, 0.15s ease);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-border-focus, #667eea);
}

.form-group textarea {
  resize: vertical;
}

.input-error {
  border-color: var(--color-danger, #e53e3e) !important;
}

.field-error {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-danger, #e53e3e);
}

/* Botoes */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-6, 0.75rem);
  padding: 1.25rem;
  border-top: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
}

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
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary, 0 4px 12px rgba(102, 126, 234, 0.35));
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-bg-muted, #edf2f7);
  color: var(--color-text-tertiary, #4a5568);
}

.btn-secondary:hover {
  background-color: var(--color-border, #e2e8f0);
}

/* Alertas */
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

/* F1.4: Modal de senha temporaria */
.password-modal-content {
  text-align: center;
}

.password-info {
  font-size: var(--font-size-base, 0.875rem);
  color: var(--color-text-secondary, #2d3748);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.password-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-6, 0.75rem);
  padding: var(--space-8, 1rem);
  background: var(--color-bg-muted, #edf2f7);
  border-radius: var(--card-border-radius, 8px);
  margin-bottom: 1.25rem;
}

.password-value {
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #1a202c);
  letter-spacing: 0.05em;
  font-family: 'Courier New', Courier, monospace;
  user-select: all;
}

.btn-copy {
  padding: 0.375rem 0.875rem;
  background: var(--color-primary, #667eea);
  color: #fff;
  border: none;
  border-radius: var(--btn-border-radius, 6px);
  font-size: var(--font-size-sm, 0.813rem);
  font-weight: var(--font-weight-semibold, 600);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  white-space: nowrap;
}

.btn-copy:hover {
  background: var(--color-primary-dark, #5a67d8);
}

.btn-copied {
  background: var(--color-success, #38a169);
}

.btn-copied:hover {
  background: var(--color-success-dark, #276749);
}

.password-warning {
  padding: var(--space-6, 0.75rem) var(--space-8, 1rem);
  background: #fffbeb;
  border: var(--border-width, 1px) solid #fef3c7;
  border-radius: var(--alert-border-radius, 6px);
  font-size: var(--font-size-sm, 0.813rem);
  color: #92400e;
  line-height: 1.5;
  text-align: left;
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

/* Responsivo */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    padding: 0 0.75rem;
  }

  .tab-btn {
    padding: 0.75rem 0.875rem;
    font-size: 0.813rem;
  }

  .tab-content {
    padding: 1.25rem 0.75rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

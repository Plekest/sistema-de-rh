<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import userService from '../services/user.service'
import type { UserFormData } from '../types'

const route = useRoute()
const router = useRouter()

// Estado
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const formError = ref('')

// Dados do formulario
const formData = ref<UserFormData>({
  fullName: '',
  email: '',
  password: '',
  role: 'employee',
  isActive: true,
})

// Modo edicao
const userId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

const isEditing = computed(() => !!userId.value)

const pageTitle = computed(() => isEditing.value ? 'Editar Usuario' : 'Novo Usuario')

/**
 * Carrega dados do usuario para edicao
 */
async function loadUser() {
  if (!userId.value) return

  try {
    isLoading.value = true
    error.value = ''
    const user = await userService.getById(userId.value)
    formData.value = {
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    }
  } catch (err: unknown) {
    error.value = 'Erro ao carregar dados do usuario.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Valida formulario
 */
function validate(): boolean {
  formError.value = ''

  if (!formData.value.fullName.trim()) {
    formError.value = 'Nome completo e obrigatorio.'
    return false
  }

  if (!formData.value.email.trim()) {
    formError.value = 'Email e obrigatorio.'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    formError.value = 'Informe um email valido.'
    return false
  }

  if (!isEditing.value && (!formData.value.password || formData.value.password.length < 6)) {
    formError.value = 'A senha deve ter pelo menos 6 caracteres.'
    return false
  }

  if (isEditing.value && formData.value.password && formData.value.password.length < 6) {
    formError.value = 'A senha deve ter pelo menos 6 caracteres.'
    return false
  }

  return true
}

/**
 * Salva formulario
 */
async function handleSubmit() {
  if (!validate()) return

  try {
    isSaving.value = true
    formError.value = ''

    const data: Partial<UserFormData> = {
      fullName: formData.value.fullName,
      email: formData.value.email,
      role: formData.value.role,
      isActive: formData.value.isActive,
    }

    if (formData.value.password) {
      data.password = formData.value.password
    }

    if (isEditing.value && userId.value) {
      await userService.update(userId.value, data)
    } else {
      data.password = formData.value.password
      await userService.create(data as UserFormData)
    }

    router.push('/users')
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    formError.value = axiosErr.response?.data?.message || 'Erro ao salvar usuario.'
  } finally {
    isSaving.value = false
  }
}

/**
 * Volta para listagem
 */
function goBack() {
  router.push('/users')
}

onMounted(() => {
  if (isEditing.value) {
    loadUser()
  }
})
</script>

<template>
  <div class="user-form">
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <button class="btn btn-secondary" @click="goBack">
        Voltar
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="isLoading" class="loading-state">Carregando...</div>

    <form v-else @submit.prevent="handleSubmit" class="form-card">
      <div v-if="formError" class="alert alert-error">{{ formError }}</div>

      <div class="form-grid">
        <div class="form-group col-full">
          <label for="fullName">Nome Completo *</label>
          <input
            id="fullName"
            v-model="formData.fullName"
            type="text"
            placeholder="Nome completo do usuario"
          />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="email@exemplo.com"
          />
        </div>

        <div class="form-group">
          <label for="password">
            Senha {{ isEditing ? '' : '*' }}
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            :placeholder="isEditing ? 'Deixe em branco para manter a senha atual' : 'Minimo 6 caracteres'"
          />
          <span v-if="isEditing" class="form-hint">
            Deixe em branco para manter a senha atual.
          </span>
        </div>

        <div class="form-group">
          <label for="role">Perfil *</label>
          <select id="role" v-model="formData.role">
            <option value="employee">Colaborador</option>
            <option value="manager">Gestor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div class="form-group">
          <label for="isActive">Status</label>
          <div class="toggle-wrapper">
            <label class="toggle">
              <input
                id="isActive"
                v-model="formData.isActive"
                type="checkbox"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">
              {{ formData.isActive ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSaving">
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.user-form {
  max-width: 700px;
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
  margin: 0;
}

/* Botoes */
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
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
  background-color: #edf2f7;
  color: #4a5568;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

/* Formulario */
.form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.col-full {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #667eea;
}

.form-hint {
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 0.125rem;
}

/* Toggle */
.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  border-radius: 11px;
  transition: background-color 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-input:checked + .toggle-slider {
  background-color: #38a169;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle-label {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

/* Acoes */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

/* Estados */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
  font-size: 0.875rem;
}

/* Responsivo */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

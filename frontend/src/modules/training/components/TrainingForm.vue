<script setup lang="ts">
import type { CreateTrainingData } from '../types'
import BaseModal from '@/components/common/BaseModal.vue'

/**
 * Formulario de criar/editar treinamento.
 *
 * Exibe campos completos para criacao/edicao de treinamento.
 * Usa BaseModal para exibicao em modal.
 */

interface Props {
  show: boolean
  formData: CreateTrainingData
  formLoading: boolean
  formError: string
  isEditing: boolean
  typeLabels: Record<string, string>
  statusLabels: Record<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'update:formData', value: CreateTrainingData): void
}>()

function updateField(field: keyof CreateTrainingData, value: any) {
  emit('update:formData', { ...arguments[0], [field]: value } as CreateTrainingData)
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Editar Treinamento' : 'Novo Treinamento'"
    size="large"
    @close="emit('close')"
  >
    <form @submit.prevent="emit('submit')">
      <div v-if="formError" class="alert alert-error">{{ formError }}</div>

      <div class="form-grid">
        <div class="form-group form-full">
          <label for="title">Titulo *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="Ex: Treinamento de Seguranca do Trabalho"
            required
          />
        </div>

        <div class="form-group form-full">
          <label for="description">Descricao</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Descricao detalhada do treinamento..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="type">Tipo *</label>
          <select id="type" v-model="formData.type" required>
            <option v-for="(label, key) in typeLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="formData.status">
            <option v-for="(label, key) in statusLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="category">Categoria</label>
          <input
            id="category"
            v-model="formData.category"
            type="text"
            placeholder="Ex: Tecnico, Seguranca, Soft Skills..."
          />
        </div>

        <div class="form-group">
          <label for="instructor">Instrutor</label>
          <input
            id="instructor"
            v-model="formData.instructor"
            type="text"
            placeholder="Nome do instrutor"
          />
        </div>

        <div class="form-group">
          <label for="provider">Fornecedor</label>
          <input
            id="provider"
            v-model="formData.provider"
            type="text"
            placeholder="Empresa/instituicao fornecedora"
          />
        </div>

        <div class="form-group">
          <label for="durationHours">Duracao (horas) *</label>
          <input
            id="durationHours"
            v-model.number="formData.durationHours"
            type="number"
            min="0"
            step="0.5"
            required
          />
        </div>

        <div class="form-group">
          <label for="startDate">Data de Inicio *</label>
          <input id="startDate" v-model="formData.startDate" type="date" required />
        </div>

        <div class="form-group">
          <label for="endDate">Data de Termino *</label>
          <input id="endDate" v-model="formData.endDate" type="date" required />
        </div>

        <div class="form-group">
          <label for="maxParticipants">Maximo de Participantes</label>
          <input
            id="maxParticipants"
            v-model.number="formData.maxParticipants"
            type="number"
            min="1"
            placeholder="Deixe vazio para ilimitado"
          />
        </div>

        <div class="form-group">
          <label for="location">Local</label>
          <input
            id="location"
            v-model="formData.location"
            type="text"
            placeholder="Endereco ou plataforma online"
          />
        </div>

        <div class="form-group form-full">
          <label class="checkbox-label">
            <input v-model="formData.isMandatory" type="checkbox" />
            <span>Treinamento Obrigatorio</span>
          </label>
        </div>

        <div class="form-group form-full">
          <label for="notes">Observacoes</label>
          <textarea
            id="notes"
            v-model="formData.notes"
            rows="2"
            placeholder="Observacoes adicionais..."
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="emit('close')">
          Cancelar
        </button>
        <button type="submit" class="btn-primary" :disabled="formLoading">
          {{ formLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
  margin-bottom: var(--space-10);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  outline: none;
  transition: border-color var(--transition-fast);
  font-family: var(--font-family);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  padding-top: var(--space-8);
  border-top: var(--border-width) solid var(--color-border);
}

.btn-primary,
.btn-secondary {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
  margin-bottom: var(--space-8);
}

.alert-error {
  background: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>

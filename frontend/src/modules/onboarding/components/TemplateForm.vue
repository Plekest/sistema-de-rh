<script setup lang="ts">
import type { CreateTemplateData } from '../types'

interface Props {
  modelValue: CreateTemplateData
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: CreateTemplateData): void
  (e: 'submit'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

const emit = defineEmits<Emits>()

function updateField(field: keyof CreateTemplateData, value: any) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

function handleSubmit(e: Event) {
  e.preventDefault()
  emit('submit')
}
</script>

<template>
  <form @submit="handleSubmit" class="template-form">
    <div v-if="error" class="form-error">{{ error }}</div>

    <div class="form-group">
      <label for="name" class="form-label">Nome do Template *</label>
      <input
        id="name"
        type="text"
        class="form-input"
        :value="modelValue.name"
        @input="updateField('name', ($event.target as HTMLInputElement).value)"
        placeholder="Ex: Integração Padrão"
        required
      />
    </div>

    <div class="form-group">
      <label for="type" class="form-label">Tipo *</label>
      <select
        id="type"
        class="form-select"
        :value="modelValue.type"
        @change="updateField('type', ($event.target as HTMLSelectElement).value)"
        required
      >
        <option value="onboarding">Integração</option>
        <option value="offboarding">Desligamento</option>
      </select>
    </div>

    <div class="form-group">
      <label for="description" class="form-label">Descrição</label>
      <textarea
        id="description"
        class="form-textarea"
        :value="modelValue.description"
        @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Descreva este template..."
        rows="3"
      ></textarea>
    </div>

    <div class="form-group">
      <label class="form-checkbox">
        <input
          type="checkbox"
          :checked="modelValue.isActive"
          @change="updateField('isActive', ($event.target as HTMLInputElement).checked)"
        />
        <span>Template ativo</span>
      </label>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="emit('cancel')" :disabled="loading">
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Salvando...' : 'Salvar Template' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.template-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.form-error {
  padding: var(--space-6) var(--space-8);
  background-color: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger-dark);
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-slow),
              border-color var(--transition-slow),
              color var(--transition-slow);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  transition: color var(--transition-slow);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-input);
  transition: border-color var(--transition-fast),
              box-shadow var(--transition-fast),
              background-color var(--transition-slow),
              color var(--transition-slow);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.form-textarea {
  resize: vertical;
  font-family: var(--font-family);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
}

.form-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

.btn {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}
</style>

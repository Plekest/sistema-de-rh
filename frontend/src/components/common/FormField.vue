<script setup lang="ts">
/**
 * Componente wrapper para campos de formulario
 *
 * Encapsula label, slot para input, mensagem de erro e texto de ajuda.
 * Garante consistencia visual e acessibilidade em todos os formularios.
 *
 * @example
 * <FormField label="Email" :required="true" :error="emailError">
 *   <input v-model="email" type="email" id="email" />
 * </FormField>
 *
 * <FormField label="Observacoes" helpText="Maximo de 500 caracteres">
 *   <textarea v-model="notes" id="notes" />
 * </FormField>
 */

interface Props {
  /** Texto do label */
  label: string
  /** Mensagem de erro (se presente, exibe abaixo do input em vermelho) */
  error?: string
  /** Indica se o campo e obrigatorio (exibe asterisco) */
  required?: boolean
  /** Texto de ajuda exibido abaixo do input */
  helpText?: string
  /** ID do elemento input (para associar o label via for/htmlFor) */
  htmlFor?: string
}

withDefaults(defineProps<Props>(), {
  error: '',
  required: false,
  helpText: '',
  htmlFor: '',
})
</script>

<template>
  <div class="form-field" :class="{ 'form-field--error': !!error }">
    <label
      v-if="label"
      class="form-field-label"
      :for="htmlFor || undefined"
    >
      {{ label }}
      <span v-if="required" class="form-field-required" aria-label="obrigatorio">*</span>
    </label>

    <div class="form-field-input">
      <slot />
    </div>

    <p
      v-if="error"
      class="form-field-error"
      role="alert"
      aria-live="polite"
    >
      {{ error }}
    </p>

    <p v-else-if="helpText" class="form-field-help">
      {{ helpText }}
    </p>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-field-required {
  color: #e53e3e;
  margin-left: 0.125rem;
}

/* Estiliza inputs dentro do slot */
.form-field-input :deep(input),
.form-field-input :deep(select),
.form-field-input :deep(textarea) {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.875rem;
  color: #2d3748;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}

.form-field-input :deep(input:focus),
.form-field-input :deep(select:focus),
.form-field-input :deep(textarea:focus) {
  border-color: #667eea;
}

.form-field-input :deep(textarea) {
  resize: vertical;
  min-height: 80px;
}

/* Estado de erro nos inputs */
.form-field--error .form-field-input :deep(input),
.form-field--error .form-field-input :deep(select),
.form-field--error .form-field-input :deep(textarea) {
  border-color: #e53e3e;
}

.form-field--error .form-field-input :deep(input:focus),
.form-field--error .form-field-input :deep(select:focus),
.form-field--error .form-field-input :deep(textarea:focus) {
  border-color: #e53e3e;
  box-shadow: 0 0 0 1px #e53e3e;
}

/* Mensagem de erro */
.form-field-error {
  font-size: 0.75rem;
  color: #e53e3e;
  margin: 0.125rem 0 0;
  line-height: 1.4;
}

/* Texto de ajuda */
.form-field-help {
  font-size: 0.75rem;
  color: #a0aec0;
  margin: 0.125rem 0 0;
  line-height: 1.4;
}
</style>

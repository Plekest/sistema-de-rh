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
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: color 0.3s ease;
}

.form-field-required {
  color: var(--color-danger);
  margin-left: var(--space-1);
}

/* Estiliza inputs dentro do slot */
.form-field-input :deep(input),
.form-field-input :deep(select),
.form-field-input :deep(textarea) {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  outline: none;
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease;
  font-family: inherit;
  min-height: 44px;
}

.form-field-input :deep(input:focus),
.form-field-input :deep(select:focus),
.form-field-input :deep(textarea:focus) {
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.form-field-input :deep(textarea) {
  resize: vertical;
  min-height: 80px;
}

/* Estado de erro nos inputs */
.form-field--error .form-field-input :deep(input),
.form-field--error .form-field-input :deep(select),
.form-field--error .form-field-input :deep(textarea) {
  border-color: var(--color-danger);
}

.form-field--error .form-field-input :deep(input:focus),
.form-field--error .form-field-input :deep(select:focus),
.form-field--error .form-field-input :deep(textarea:focus) {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger);
}

/* Mensagem de erro */
.form-field-error {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  margin: var(--space-1) 0 0;
  line-height: var(--line-height-normal);
  transition: color 0.3s ease;
}

/* Texto de ajuda */
.form-field-help {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin: var(--space-1) 0 0;
  line-height: var(--line-height-normal);
  transition: color 0.3s ease;
}
</style>

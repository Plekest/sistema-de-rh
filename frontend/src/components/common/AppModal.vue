<script setup lang="ts">
import { watch, onUnmounted, ref } from 'vue'

/**
 * Componente de modal/dialog generico
 *
 * Exibe overlay com backdrop, titulo, conteudo e footer via slots.
 * Fecha com ESC, click fora ou botao de fechar.
 *
 * @example
 * <AppModal :show="isOpen" title="Confirmar Exclusao" size="sm" @close="isOpen = false">
 *   <p>Deseja realmente excluir este item?</p>
 *   <template #footer>
 *     <button @click="isOpen = false">Cancelar</button>
 *     <button @click="handleDelete">Excluir</button>
 *   </template>
 * </AppModal>
 */

interface Props {
  /** Controla visibilidade do modal */
  show: boolean
  /** Titulo exibido no header do modal */
  title?: string
  /** Tamanho do modal: sm (400px), md (560px), lg (720px) */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
})

const emit = defineEmits<{
  /** Emitido quando o usuario solicita fechar o modal */
  (e: 'close'): void
}>()

const backdropRef = ref<HTMLElement | null>(null)

/**
 * Fecha o modal via click no backdrop (fora do conteudo)
 */
function handleBackdropClick(event: MouseEvent) {
  if (event.target === backdropRef.value) {
    emit('close')
  }
}

/**
 * Fecha o modal via tecla ESC
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

/**
 * Gerencia event listener global de teclado e scroll do body
 */
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      document.addEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        ref="backdropRef"
        class="modal-backdrop"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Dialog'"
      >
        <div class="modal-container" :class="`modal-container--${size}`">
          <!-- Header -->
          <div v-if="title || $slots.header" class="modal-header">
            <slot name="header">
              <h3 class="modal-title">{{ title }}</h3>
            </slot>
            <button
              class="modal-close"
              @click="emit('close')"
              aria-label="Fechar"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* Container do modal */
.modal-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
  width: 100%;
  transition: background-color 0.3s ease;
}

.modal-container--sm {
  max-width: 400px;
}

.modal-container--md {
  max-width: 560px;
}

.modal-container--lg {
  max-width: 720px;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-8) var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border: none;
  border-radius: var(--radius-xs);
  background: none;
  color: var(--color-text-placeholder);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.modal-close:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-tertiary);
}

.modal-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Body */
.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-10);
  border-top: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}

/* Animacao de entrada/saida */
.modal-enter-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-leave-active .modal-container {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

/* Responsivo */
@media (max-width: 768px) {
  .modal-backdrop {
    padding: 0.5rem;
    align-items: flex-end;
  }

  .modal-container {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 12px 12px 0 0;
  }
}
</style>

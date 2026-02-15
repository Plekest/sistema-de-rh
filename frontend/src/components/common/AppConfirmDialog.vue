<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) {
    emit('cancel')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

function handleOverlayClick() {
  emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="dialog-overlay"
        @click="handleOverlayClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'dialog-title' : undefined"
      >
        <Transition name="scale">
          <div
            v-if="show"
            class="dialog-content"
            :class="`dialog-${variant || 'info'}`"
            @click.stop
          >
            <div class="dialog-icon" aria-hidden="true">
              <!-- Danger icon -->
              <svg
                v-if="variant === 'danger'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>

              <!-- Warning icon -->
              <svg
                v-else-if="variant === 'warning'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>

              <!-- Info icon -->
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>

            <h3 id="dialog-title" class="dialog-title">
              {{ title || 'Confirmar ação' }}
            </h3>

            <p class="dialog-message">
              {{ message || 'Você tem certeza que deseja realizar esta ação?' }}
            </p>

            <div class="dialog-actions">
              <button
                class="btn-cancel"
                @click="emit('cancel')"
                type="button"
              >
                {{ cancelLabel || 'Cancelar' }}
              </button>
              <button
                class="btn-confirm"
                :class="`btn-${variant || 'info'}`"
                @click="emit('confirm')"
                type="button"
              >
                {{ confirmLabel || 'Confirmar' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  z-index: var(--z-dialog);
}

.dialog-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--space-16);
  max-width: 440px;
  width: 100%;
  text-align: center;
}

.dialog-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-icon svg {
  width: 28px;
  height: 28px;
}

.dialog-danger .dialog-icon {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

.dialog-warning .dialog-icon {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.dialog-info .dialog-icon {
  background-color: var(--color-info-light);
  color: var(--color-info);
}

.dialog-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  letter-spacing: -0.01em;
}

.dialog-message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-16);
}

.dialog-actions {
  display: flex;
  gap: var(--space-6);
  justify-content: center;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: var(--space-5) var(--space-10);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 44px;
}

.btn-cancel {
  background-color: var(--color-bg-muted);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}

.btn-cancel:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.btn-confirm {
  border: none;
  color: white;
}

.btn-danger {
  background-color: var(--color-danger);
}

.btn-danger:hover {
  background-color: var(--color-danger-dark);
}

.btn-warning {
  background-color: var(--color-warning);
}

.btn-warning:hover {
  background-color: var(--color-warning-dark);
}

.btn-info {
  background-color: var(--color-info);
}

.btn-info:hover {
  background-color: var(--color-info-dark);
}

.btn-cancel:focus-visible,
.btn-confirm:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all var(--transition-spring);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsividade */
@media (max-width: 480px) {
  .dialog-content {
    padding: var(--space-12);
  }

  .dialog-icon {
    width: 48px;
    height: 48px;
  }

  .dialog-icon svg {
    width: 24px;
    height: 24px;
  }

  .dialog-title {
    font-size: var(--font-size-lg);
  }

  .dialog-message {
    font-size: var(--font-size-sm);
  }

  .dialog-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
</style>

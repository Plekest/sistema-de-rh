<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { state, handleConfirm, handleCancel } = useConfirmDialog()

const cancelButtonRef = ref<HTMLButtonElement | null>(null)
const confirmButtonRef = ref<HTMLButtonElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

// Focus trap
watch(() => state.value.visible, async (visible) => {
  if (visible) {
    await nextTick()
    if (state.value.showInput && inputRef.value) {
      inputRef.value.focus()
    } else if (cancelButtonRef.value) {
      cancelButtonRef.value.focus()
    }
  }
})

// Fechar com Escape
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleCancel()
  }
}

// Previne confirmacao vazia quando inputRequired
function onConfirm() {
  if (state.value.showInput && state.value.inputRequired && !state.value.inputValue.trim()) {
    return
  }
  handleConfirm()
}

// Focus trap com Tab
function handleTab(event: KeyboardEvent) {
  if (!state.value.visible) return

  const focusableElements = [
    cancelButtonRef.value,
    state.value.showInput ? inputRef.value : null,
    confirmButtonRef.value,
  ].filter(Boolean) as HTMLElement[]

  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  const activeElement = document.activeElement

  if (event.shiftKey) {
    // Shift+Tab
    if (activeElement === firstElement && lastElement) {
      event.preventDefault()
      lastElement.focus()
    }
  } else {
    // Tab
    if (activeElement === lastElement && firstElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }
}

// Icon SVG baseado no variant
function getIcon() {
  if (state.value.variant === 'danger') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
      </svg>
    `
  } else if (state.value.variant === 'warning') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
      </svg>
    `
  } else {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
      </svg>
    `
  }
}

// Cores baseadas no variant
function getIconColor() {
  if (state.value.variant === 'danger') return '#e53e3e'
  if (state.value.variant === 'warning') return '#ed8936'
  return '#667eea'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="state.visible"
        class="dialog-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'dialog-title'"
        @click.self="handleCancel"
        @keydown.esc="handleKeydown"
        @keydown.tab="handleTab"
      >
        <Transition name="dialog-scale">
          <div v-if="state.visible" class="dialog-card">
            <div class="dialog-icon" :style="{ color: getIconColor() }" v-html="getIcon()"></div>

            <h2 id="dialog-title" class="dialog-title">{{ state.title }}</h2>
            <p class="dialog-message">{{ state.message }}</p>

            <textarea
              v-if="state.showInput"
              ref="inputRef"
              v-model="state.inputValue"
              class="dialog-input"
              :placeholder="state.inputPlaceholder"
              :required="state.inputRequired"
              rows="3"
              @keydown.enter.ctrl="onConfirm"
            ></textarea>

            <div class="dialog-actions">
              <button
                ref="cancelButtonRef"
                type="button"
                class="dialog-btn dialog-btn-cancel"
                @click="handleCancel"
              >
                {{ state.cancelLabel }}
              </button>
              <button
                ref="confirmButtonRef"
                type="button"
                class="dialog-btn dialog-btn-confirm"
                :class="'dialog-btn-' + state.variant"
                :disabled="state.showInput && state.inputRequired && !state.inputValue.trim()"
                @click="onConfirm"
              >
                {{ state.confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

/* Card */
.dialog-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Icon */
.dialog-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-icon svg {
  width: 100%;
  height: 100%;
}

/* Title */
.dialog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem;
}

/* Message */
.dialog-message {
  font-size: 0.938rem;
  color: #4a5568;
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

/* Input */
.dialog-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #2d3748;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  margin-bottom: 1.5rem;
}

.dialog-input:focus {
  border-color: #667eea;
}

/* Actions */
.dialog-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.dialog-btn {
  flex: 1;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.dialog-btn:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.dialog-btn-cancel {
  background: #fff;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.dialog-btn-cancel:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.dialog-btn-confirm {
  color: #fff;
}

.dialog-btn-danger {
  background: #e53e3e;
}

.dialog-btn-danger:hover:not(:disabled) {
  background: #c53030;
}

.dialog-btn-warning {
  background: #ed8936;
}

.dialog-btn-warning:hover:not(:disabled) {
  background: #dd6b20;
}

.dialog-btn-info {
  background: #667eea;
}

.dialog-btn-info:hover:not(:disabled) {
  background: #5a67d8;
}

.dialog-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active,
.dialog-scale-leave-active {
  transition: all 0.2s ease;
}

.dialog-scale-enter-from,
.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsivo */
@media (max-width: 480px) {
  .dialog-card {
    padding: 1.25rem;
    max-width: 100%;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .dialog-btn {
    width: 100%;
  }
}
</style>

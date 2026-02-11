import { ref } from 'vue'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  showInput?: boolean
  inputPlaceholder?: string
  inputRequired?: boolean
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  visible: boolean
  inputValue: string
  resolve: ((value: string | boolean) => void) | null
}

const state = ref<ConfirmDialogState>({
  visible: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  variant: 'info',
  showInput: false,
  inputPlaceholder: '',
  inputRequired: false,
  inputValue: '',
  resolve: null,
})

export function useConfirmDialog() {
  function confirm(options: ConfirmDialogOptions): Promise<string | boolean> {
    return new Promise((resolve) => {
      state.value = {
        ...options,
        visible: true,
        confirmLabel: options.confirmLabel || 'Confirmar',
        cancelLabel: options.cancelLabel || 'Cancelar',
        variant: options.variant || 'info',
        showInput: options.showInput || false,
        inputPlaceholder: options.inputPlaceholder || '',
        inputRequired: options.inputRequired || false,
        inputValue: '',
        resolve,
      }
    })
  }

  function handleConfirm() {
    if (state.value.resolve) {
      state.value.resolve(state.value.showInput ? state.value.inputValue : true)
    }
    state.value.visible = false
  }

  function handleCancel() {
    if (state.value.resolve) {
      state.value.resolve(false)
    }
    state.value.visible = false
  }

  return { state, confirm, handleConfirm, handleCancel }
}

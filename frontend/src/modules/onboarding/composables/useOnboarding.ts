import { ref, computed } from 'vue'
import onboardingService from '../services/onboardingService'
import type {
  OnboardingTemplate,
  OnboardingTemplateItem,
  OnboardingChecklist,
  CreateTemplateData,
  CreateTemplateItemData,
} from '../types'
import { ONBOARDING_TYPE_LABELS, RESPONSIBLE_LABELS } from '../types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useApiError } from '@/composables/useApiError'

/**
 * Composable para gerenciar logica de onboarding
 */
export function useOnboarding() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()
  const { error, handleError, clearError } = useApiError()

  // Estado
  const templates = ref<OnboardingTemplate[]>([])
  const selectedTemplate = ref<OnboardingTemplate | null>(null)
  const templateItems = ref<OnboardingTemplateItem[]>([])
  const isLoading = ref(false)
  const successMessage = ref('')

  // Filtros
  const filterType = ref<string>('')
  const filterStatus = ref<string>('')

  // Formulario de template
  const showTemplateForm = ref(false)
  const templateFormData = ref<CreateTemplateData>({
    name: '',
    type: 'onboarding',
    description: '',
    isActive: true,
  })

  // Formulario de item
  const showItemForm = ref(false)
  const itemFormData = ref<CreateTemplateItemData>({
    title: '',
    description: '',
    responsible: 'hr',
    dueInDays: 1,
    isRequired: true,
    sortOrder: 0,
  })

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)
  const typeLabels = ONBOARDING_TYPE_LABELS
  const responsibleLabels = RESPONSIBLE_LABELS

  /**
   * Exibe mensagem de sucesso
   */
  function showSuccess(message: string) {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }

  /**
   * Carrega templates
   */
  async function loadTemplates() {
    try {
      isLoading.value = true
      clearError()
      templates.value = await onboardingService.listTemplates()

      // Aplica filtros localmente
      if (filterType.value) {
        templates.value = templates.value.filter((t) => t.type === filterType.value)
      }
      if (filterStatus.value === 'active') {
        templates.value = templates.value.filter((t) => t.isActive)
      } else if (filterStatus.value === 'inactive') {
        templates.value = templates.value.filter((t) => !t.isActive)
      }
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar templates.')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Seleciona template e carrega seus items
   */
  async function selectTemplate(template: OnboardingTemplate) {
    try {
      selectedTemplate.value = template
      isLoading.value = true
      templateItems.value = await onboardingService.listTemplateItems(template.id)
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar items do template.')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Abre formulario de novo template
   */
  function openTemplateForm(template?: OnboardingTemplate) {
    if (template) {
      templateFormData.value = {
        name: template.name,
        type: template.type,
        description: template.description || '',
        isActive: template.isActive,
      }
      selectedTemplate.value = template
    } else {
      templateFormData.value = {
        name: '',
        type: 'onboarding',
        description: '',
        isActive: true,
      }
    }
    showTemplateForm.value = true
  }

  /**
   * Fecha formulario de template
   */
  function closeTemplateForm() {
    showTemplateForm.value = false
  }

  /**
   * Salva template
   */
  async function saveTemplate(): Promise<boolean> {
    try {
      if (!templateFormData.value.name.trim()) {
        error.value = 'Nome do template é obrigatório'
        return false
      }

      isLoading.value = true

      if (selectedTemplate.value?.id) {
        await onboardingService.updateTemplate(selectedTemplate.value.id, templateFormData.value)
        showSuccess('Template atualizado com sucesso!')
      } else {
        await onboardingService.createTemplate(templateFormData.value)
        showSuccess('Template criado com sucesso!')
      }

      closeTemplateForm()
      loadTemplates()
      return true
    } catch (err: unknown) {
      handleError(err, 'Erro ao salvar template.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Remove template
   */
  async function deleteTemplate(id: number) {
    const result = await confirmDialog({
      title: 'Remover Template',
      message: 'Tem certeza que deseja remover este template?',
      variant: 'danger',
      confirmLabel: 'Remover',
    })

    if (!result) return

    try {
      await onboardingService.deleteTemplate(id)
      showSuccess('Template removido com sucesso!')
      loadTemplates()
      if (selectedTemplate.value?.id === id) {
        selectedTemplate.value = null
        templateItems.value = []
      }
    } catch (err: unknown) {
      handleError(err, 'Erro ao remover template.')
    }
  }

  /**
   * Abre formulario de item
   */
  function openItemForm(item?: OnboardingTemplateItem) {
    if (item) {
      itemFormData.value = {
        title: item.title,
        description: item.description || '',
        responsible: item.responsible,
        dueInDays: item.dueInDays,
        isRequired: item.isRequired,
        sortOrder: item.sortOrder,
      }
    } else {
      itemFormData.value = {
        title: '',
        description: '',
        responsible: 'hr',
        dueInDays: 1,
        isRequired: true,
        sortOrder: templateItems.value.length,
      }
    }
    showItemForm.value = true
  }

  /**
   * Fecha formulario de item
   */
  function closeItemForm() {
    showItemForm.value = false
  }

  /**
   * Salva item
   */
  async function saveItem(item?: OnboardingTemplateItem): Promise<boolean> {
    if (!selectedTemplate.value) return false

    try {
      if (!itemFormData.value.title.trim()) {
        error.value = 'Título do item é obrigatório'
        return false
      }

      isLoading.value = true

      if (item?.id) {
        await onboardingService.updateTemplateItem(
          selectedTemplate.value.id,
          item.id,
          itemFormData.value
        )
        showSuccess('Item atualizado com sucesso!')
      } else {
        await onboardingService.createTemplateItem(selectedTemplate.value.id, itemFormData.value)
        showSuccess('Item adicionado com sucesso!')
      }

      closeItemForm()
      selectTemplate(selectedTemplate.value)
      return true
    } catch (err: unknown) {
      handleError(err, 'Erro ao salvar item.')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Remove item
   */
  async function deleteItem(itemId: number) {
    if (!selectedTemplate.value) return

    const result = await confirmDialog({
      title: 'Remover Item',
      message: 'Tem certeza que deseja remover este item?',
      variant: 'danger',
      confirmLabel: 'Remover',
    })

    if (!result) return

    try {
      await onboardingService.deleteTemplateItem(selectedTemplate.value.id, itemId)
      showSuccess('Item removido com sucesso!')
      selectTemplate(selectedTemplate.value)
    } catch (err: unknown) {
      handleError(err, 'Erro ao remover item.')
    }
  }

  /**
   * Inicializa dados
   */
  function init() {
    loadTemplates()
  }

  return {
    // Estado
    templates,
    selectedTemplate,
    templateItems,
    isLoading,
    error,
    successMessage,

    // Filtros
    filterType,
    filterStatus,

    // Formularios
    showTemplateForm,
    templateFormData,
    showItemForm,
    itemFormData,

    // Computed
    isAdmin,
    typeLabels,
    responsibleLabels,

    // Metodos
    loadTemplates,
    selectTemplate,
    openTemplateForm,
    closeTemplateForm,
    saveTemplate,
    deleteTemplate,
    openItemForm,
    closeItemForm,
    saveItem,
    deleteItem,
    init,
  }
}

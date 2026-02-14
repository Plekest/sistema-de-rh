import { ref, computed } from 'vue'
import benefitsService from '../services/benefits.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { Benefit, EmployeeBenefit, CreateBenefitData, CreatePlanData, EnrollEmployeeData, AddDependentData } from '../types'
import { BENEFIT_TYPE_LABELS, ENROLLMENT_STATUS_LABELS, RELATIONSHIP_LABELS } from '../types'
import type { Employee } from '@/modules/employees/types'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

/**
 * Composable para gerenciar logica de beneficios
 *
 * Centraliza estado, filtros, CRUD de beneficios/planos/adesoes/dependentes.
 * Usado pela BenefitsListView e seus sub-componentes.
 */
export function useBenefits() {
  const authStore = useAuthStore()
  const { confirm: confirmDialog } = useConfirmDialog()

  // Estado principal
  const benefits = ref<Benefit[]>([])
  const employeeBenefits = ref<EmployeeBenefit[]>([])
  const employees = ref<Employee[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  // Tabs
  const activeTab = ref<'catalog' | 'myBenefits'>('catalog')

  // Filtro de tipo
  const filterType = ref<string>('')

  // Beneficio expandido para ver planos
  const expandedBenefitId = ref<number | null>(null)

  // Formularios
  const showBenefitForm = ref(false)
  const benefitFormLoading = ref(false)
  const benefitFormError = ref('')
  const benefitFormData = ref<CreateBenefitData>({
    name: '',
    type: '',
    description: '',
    provider: '',
  })

  const showPlanForm = ref(false)
  const planFormLoading = ref(false)
  const planFormError = ref('')
  const selectedBenefitId = ref<number | null>(null)
  const planFormData = ref<CreatePlanData>({
    benefitId: 0,
    name: '',
    monthlyValue: 0,
    employeeDiscountValue: null,
    employeeDiscountPercentage: null,
  })

  const showEnrollForm = ref(false)
  const enrollFormLoading = ref(false)
  const enrollFormError = ref('')
  const enrollFormData = ref<EnrollEmployeeData>({
    employeeId: 0,
    benefitPlanId: 0,
    enrollmentDate: new Date().toISOString().split('T')[0] as string,
    notes: '',
  })

  const showDependentForm = ref(false)
  const dependentFormLoading = ref(false)
  const dependentFormError = ref('')
  const selectedEnrollmentId = ref<number | null>(null)
  const dependentFormData = ref<AddDependentData>({
    name: '',
    cpf: '',
    birthDate: '',
    relationship: 'spouse',
  })

  const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

  // Labels
  const typeLabels = BENEFIT_TYPE_LABELS
  const typeOptions = Object.keys(typeLabels)
  const enrollmentStatusLabels = ENROLLMENT_STATUS_LABELS
  const relationshipLabels = RELATIONSHIP_LABELS

  /**
   * Exibe mensagem de sucesso com auto-dismiss
   */
  function showSuccess(message: string) {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }

  /**
   * Carrega catalogo de beneficios
   */
  async function loadBenefits() {
    try {
      isLoading.value = true
      error.value = ''

      const filters: any = { limit: 100 }
      if (filterType.value) filters.type = filterType.value

      const response = await benefitsService.list(filters)
      benefits.value = response.data
    } catch (err: unknown) {
      error.value = 'Erro ao carregar beneficios.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega beneficios do colaborador logado
   */
  async function loadEmployeeBenefits() {
    if (!authStore.employeeId) return

    try {
      isLoading.value = true
      error.value = ''
      employeeBenefits.value = await benefitsService.getEmployeeBenefits(authStore.employeeId)
    } catch (err: unknown) {
      error.value = 'Erro ao carregar seus beneficios.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega lista de colaboradores (admin/manager)
   */
  async function loadEmployees() {
    try {
      const response = await employeeService.getAll({ limit: 200, status: 'active' })
      employees.value = response.data
    } catch (err: unknown) {
      console.error('Erro ao carregar colaboradores:', err)
    }
  }

  /**
   * Expande/colapsa planos de um beneficio
   */
  function toggleExpand(benefitId: number) {
    expandedBenefitId.value = expandedBenefitId.value === benefitId ? null : benefitId
  }

  // --- Beneficio CRUD ---

  function openBenefitForm() {
    showBenefitForm.value = true
    benefitFormError.value = ''
    benefitFormData.value = { name: '', type: '', description: '', provider: '' }
  }

  function closeBenefitForm() {
    showBenefitForm.value = false
    benefitFormError.value = ''
  }

  async function submitBenefitForm() {
    try {
      benefitFormLoading.value = true
      benefitFormError.value = ''

      if (!benefitFormData.value.name) {
        benefitFormError.value = 'Informe o nome do beneficio'
        return
      }
      if (!benefitFormData.value.type) {
        benefitFormError.value = 'Selecione o tipo do beneficio'
        return
      }

      await benefitsService.create(benefitFormData.value)
      showSuccess('Beneficio criado com sucesso!')
      closeBenefitForm()
      loadBenefits()
    } catch (err: any) {
      benefitFormError.value = err.response?.data?.message || 'Erro ao criar beneficio'
      console.error(err)
    } finally {
      benefitFormLoading.value = false
    }
  }

  async function deleteBenefit(id: number) {
    const result = await confirmDialog({
      title: 'Desativar Beneficio',
      message: 'Confirma a desativacao deste beneficio?',
      variant: 'danger',
      confirmLabel: 'Desativar',
    })

    if (!result) return

    try {
      await benefitsService.delete(id)
      showSuccess('Beneficio desativado com sucesso!')
      loadBenefits()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao desativar beneficio'
      console.error(err)
    }
  }

  // --- Plano CRUD ---

  function openPlanForm(benefitId: number) {
    selectedBenefitId.value = benefitId
    showPlanForm.value = true
    planFormError.value = ''
    planFormData.value = {
      benefitId,
      name: '',
      monthlyValue: 0,
      employeeDiscountValue: null,
      employeeDiscountPercentage: null,
    }
  }

  function closePlanForm() {
    showPlanForm.value = false
    planFormError.value = ''
  }

  async function submitPlanForm() {
    try {
      planFormLoading.value = true
      planFormError.value = ''

      if (!planFormData.value.name) {
        planFormError.value = 'Informe o nome do plano'
        return
      }
      if (planFormData.value.monthlyValue <= 0) {
        planFormError.value = 'Informe o valor mensal'
        return
      }

      await benefitsService.createPlan(planFormData.value.benefitId, planFormData.value)
      showSuccess('Plano criado com sucesso!')
      closePlanForm()
      loadBenefits()
    } catch (err: any) {
      planFormError.value = err.response?.data?.message || 'Erro ao criar plano'
      console.error(err)
    } finally {
      planFormLoading.value = false
    }
  }

  // --- Adesao ---

  function openEnrollForm(benefitPlanId: number) {
    showEnrollForm.value = true
    enrollFormError.value = ''
    enrollFormData.value = {
      employeeId: isAdmin.value ? 0 : (authStore.employeeId || 0),
      benefitPlanId,
      enrollmentDate: new Date().toISOString().split('T')[0] as string,
      notes: '',
    }
  }

  function closeEnrollForm() {
    showEnrollForm.value = false
    enrollFormError.value = ''
  }

  async function submitEnrollForm() {
    try {
      enrollFormLoading.value = true
      enrollFormError.value = ''

      if (!enrollFormData.value.employeeId) {
        enrollFormError.value = 'Selecione um colaborador'
        return
      }

      await benefitsService.enroll(enrollFormData.value.employeeId, enrollFormData.value)
      showSuccess('Adesao realizada com sucesso!')
      closeEnrollForm()
      if (!isAdmin.value) loadEmployeeBenefits()
    } catch (err: any) {
      enrollFormError.value = err.response?.data?.message || 'Erro ao realizar adesao'
      console.error(err)
    } finally {
      enrollFormLoading.value = false
    }
  }

  async function cancelEnrollment(enrollment: EmployeeBenefit) {
    const result = await confirmDialog({
      title: 'Cancelar Adesao',
      message: 'Confirma o cancelamento desta adesao?',
      variant: 'warning',
      confirmLabel: 'Cancelar Adesao',
    })

    if (!result) return

    try {
      await benefitsService.cancelEnrollment(enrollment.employeeId, enrollment.id)
      showSuccess('Adesao cancelada com sucesso!')
      loadEmployeeBenefits()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao cancelar adesao'
      console.error(err)
    }
  }

  // --- Dependentes ---

  function openDependentForm(enrollmentId: number) {
    selectedEnrollmentId.value = enrollmentId
    showDependentForm.value = true
    dependentFormError.value = ''
    dependentFormData.value = { name: '', cpf: '', birthDate: '', relationship: 'spouse' }
  }

  function closeDependentForm() {
    showDependentForm.value = false
    dependentFormError.value = ''
  }

  async function submitDependentForm() {
    try {
      dependentFormLoading.value = true
      dependentFormError.value = ''

      if (!dependentFormData.value.name) {
        dependentFormError.value = 'Informe o nome do dependente'
        return
      }

      await benefitsService.addDependent(selectedEnrollmentId.value!, dependentFormData.value)
      showSuccess('Dependente adicionado com sucesso!')
      closeDependentForm()
      loadEmployeeBenefits()
    } catch (err: any) {
      dependentFormError.value = err.response?.data?.message || 'Erro ao adicionar dependente'
      console.error(err)
    } finally {
      dependentFormLoading.value = false
    }
  }

  async function removeDependent(dependentId: number) {
    const result = await confirmDialog({
      title: 'Remover Dependente',
      message: 'Confirma a remocao deste dependente?',
      variant: 'danger',
      confirmLabel: 'Remover',
    })

    if (!result) return

    try {
      await benefitsService.removeDependent(dependentId)
      showSuccess('Dependente removido com sucesso!')
      loadEmployeeBenefits()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover dependente'
      console.error(err)
    }
  }

  /**
   * Formata valor monetario
   */
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  /**
   * Formata data para exibicao
   */
  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR')
  }

  /**
   * Retorna classe CSS para badge de status
   */
  function statusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'badge-active',
      cancelled: 'badge-cancelled',
      suspended: 'badge-suspended',
    }
    return classes[status] || ''
  }

  /**
   * Inicializa dados
   */
  function init() {
    loadBenefits()
    if (isAdmin.value) {
      loadEmployees()
    }
    if (authStore.employeeId) {
      loadEmployeeBenefits()
    }
  }

  return {
    // Estado
    benefits,
    employeeBenefits,
    employees,
    isLoading,
    error,
    successMessage,

    // Tabs
    activeTab,

    // Filtros
    filterType,

    // Beneficio expandido
    expandedBenefitId,

    // Formularios
    showBenefitForm,
    benefitFormLoading,
    benefitFormError,
    benefitFormData,
    showPlanForm,
    planFormLoading,
    planFormError,
    selectedBenefitId,
    planFormData,
    showEnrollForm,
    enrollFormLoading,
    enrollFormError,
    enrollFormData,
    showDependentForm,
    dependentFormLoading,
    dependentFormError,
    selectedEnrollmentId,
    dependentFormData,

    // Computed
    isAdmin,

    // Labels
    typeLabels,
    typeOptions,
    enrollmentStatusLabels,
    relationshipLabels,

    // Metodos
    loadBenefits,
    loadEmployeeBenefits,
    loadEmployees,
    toggleExpand,
    openBenefitForm,
    closeBenefitForm,
    submitBenefitForm,
    deleteBenefit,
    openPlanForm,
    closePlanForm,
    submitPlanForm,
    openEnrollForm,
    closeEnrollForm,
    submitEnrollForm,
    cancelEnrollment,
    openDependentForm,
    closeDependentForm,
    submitDependentForm,
    removeDependent,
    formatCurrency,
    formatDate,
    statusBadgeClass,
    init,
  }
}

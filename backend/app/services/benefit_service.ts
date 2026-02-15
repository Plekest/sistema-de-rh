import Benefit from '#models/benefit'
import BenefitPlan from '#models/benefit_plan'
import EmployeeBenefit from '#models/employee_benefit'
import BenefitDependent from '#models/benefit_dependent'
import Employee from '#models/employee'
import EmployeeHistoryService from '#services/employee_history_service'
import { DateTime } from 'luxon'

interface ListFilters {
  page?: number
  limit?: number
  type?: string
  isActive?: boolean
}

interface CreateBenefitData {
  name: string
  type: 'vt' | 'vr' | 'va' | 'health' | 'dental' | 'life_insurance' | 'daycare' | 'gym' | 'other'
  description?: string | null
  provider?: string | null
  isActive?: boolean
}

interface UpdateBenefitData {
  name?: string
  type?: 'vt' | 'vr' | 'va' | 'health' | 'dental' | 'life_insurance' | 'daycare' | 'gym' | 'other'
  description?: string | null
  provider?: string | null
  isActive?: boolean
}

interface CreatePlanData {
  benefitId: number
  name: string
  monthlyValue: number
  employeeDiscountValue?: number | null
  employeeDiscountPercentage?: number | null
  eligibilityRules?: Record<string, any> | null
  isActive?: boolean
}

interface UpdatePlanData {
  name?: string
  monthlyValue?: number
  employeeDiscountValue?: number | null
  employeeDiscountPercentage?: number | null
  eligibilityRules?: Record<string, any> | null
  isActive?: boolean
}

interface EnrollEmployeeData {
  employeeId: number
  benefitPlanId: number
  enrollmentDate: string
  notes?: string | null
}

interface AddDependentData {
  name: string
  cpf?: string | null
  birthDate?: string | null
  relationship: 'spouse' | 'child' | 'parent' | 'other'
}

export default class BenefitService {
  private historyService = new EmployeeHistoryService()

  /**
   * Lista beneficios com filtros e paginacao
   */
  async listBenefits(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Benefit.query()
      .preload('plans', (planQuery) => {
        planQuery.where('isActive', true)
      })
      .orderBy('name', 'asc')

    if (filters.type) {
      query.where('type', filters.type)
    }
    if (filters.isActive !== undefined) {
      query.where('isActive', filters.isActive)
    }

    return await query.paginate(page, limit)
  }

  /**
   * Busca beneficio por ID com planos
   */
  async findBenefitById(id: number) {
    return await Benefit.query()
      .where('id', id)
      .preload('plans', (planQuery) => {
        planQuery.orderBy('name', 'asc')
      })
      .firstOrFail()
  }

  /**
   * Cria novo beneficio
   */
  async createBenefit(data: CreateBenefitData) {
    const benefit = await Benefit.create({
      name: data.name,
      type: data.type,
      description: data.description || null,
      provider: data.provider || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    })

    await benefit.load('plans')
    return benefit
  }

  /**
   * Atualiza beneficio
   */
  async updateBenefit(id: number, data: UpdateBenefitData) {
    const benefit = await Benefit.findOrFail(id)
    benefit.merge(data)
    await benefit.save()
    await benefit.load('plans')
    return benefit
  }

  /**
   * Desativa beneficio (soft delete)
   */
  async deleteBenefit(id: number) {
    const benefit = await Benefit.findOrFail(id)
    benefit.isActive = false
    await benefit.save()
    return benefit
  }

  /**
   * Cria plano para um beneficio
   */
  async createPlan(data: CreatePlanData) {
    const benefit = await Benefit.findOrFail(data.benefitId)

    const plan = await BenefitPlan.create({
      benefitId: benefit.id,
      name: data.name,
      monthlyValue: data.monthlyValue,
      employeeDiscountValue: data.employeeDiscountValue || null,
      employeeDiscountPercentage: data.employeeDiscountPercentage || null,
      eligibilityRules: data.eligibilityRules || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    })

    await plan.load('benefit')
    return plan
  }

  /**
   * Atualiza plano de beneficio
   */
  async updatePlan(id: number, data: UpdatePlanData) {
    const plan = await BenefitPlan.findOrFail(id)
    plan.merge(data)
    await plan.save()
    await plan.load('benefit')
    return plan
  }

  /**
   * Adesao de colaborador a um plano
   */
  async enrollEmployee(data: EnrollEmployeeData) {
    const employee = await Employee.findOrFail(data.employeeId)
    if (employee.status !== 'active') {
      throw new Error('Colaborador nao esta ativo')
    }

    const plan = await BenefitPlan.findOrFail(data.benefitPlanId)
    if (!plan.isActive) {
      throw new Error('Plano de beneficio nao esta ativo')
    }

    const existingEnrollment = await EmployeeBenefit.query()
      .where('employeeId', data.employeeId)
      .where('benefitPlanId', data.benefitPlanId)
      .where('status', 'active')
      .first()

    if (existingEnrollment) {
      throw new Error('Colaborador ja possui adesao ativa neste plano')
    }

    const employeeBenefit = await EmployeeBenefit.create({
      employeeId: data.employeeId,
      benefitPlanId: data.benefitPlanId,
      enrollmentDate: DateTime.fromISO(data.enrollmentDate),
      status: 'active',
      notes: data.notes || null,
    })

    await employeeBenefit.load('employee')
    await employeeBenefit.load('benefitPlan', (planQuery) => {
      planQuery.preload('benefit')
    })

    // Registra no historico do colaborador
    const benefitName = employeeBenefit.benefitPlan?.benefit?.name || 'Beneficio'
    const planName = employeeBenefit.benefitPlan?.name || 'Plano'
    await this.historyService.recordBenefitEnrollment(
      data.employeeId,
      benefitName,
      planName
    ).catch(() => {})

    return employeeBenefit
  }

  /**
   * Cancela adesao de colaborador
   */
  async cancelEnrollment(id: number) {
    const employeeBenefit = await EmployeeBenefit.findOrFail(id)

    if (employeeBenefit.status === 'cancelled') {
      throw new Error('Adesao ja foi cancelada')
    }

    employeeBenefit.status = 'cancelled'
    employeeBenefit.cancellationDate = DateTime.now()
    await employeeBenefit.save()

    await employeeBenefit.load('employee')
    await employeeBenefit.load('benefitPlan', (planQuery) => {
      planQuery.preload('benefit')
    })

    // Registra no historico do colaborador
    const benefitName = employeeBenefit.benefitPlan?.benefit?.name || 'Beneficio'
    const planName = employeeBenefit.benefitPlan?.name || 'Plano'
    await this.historyService.recordBenefitCancellation(
      employeeBenefit.employeeId,
      benefitName,
      planName
    ).catch(() => {})

    return employeeBenefit
  }

  /**
   * Lista beneficios de um colaborador
   */
  async getEmployeeBenefits(employeeId: number) {
    await Employee.findOrFail(employeeId)

    return await EmployeeBenefit.query()
      .where('employeeId', employeeId)
      .preload('benefitPlan', (planQuery) => {
        planQuery.preload('benefit')
      })
      .preload('dependents')
      .orderBy('enrollment_date', 'desc')
  }

  /**
   * Adiciona dependente a uma adesao de beneficio
   */
  async addDependent(employeeBenefitId: number, data: AddDependentData) {
    const employeeBenefit = await EmployeeBenefit.findOrFail(employeeBenefitId)

    if (employeeBenefit.status !== 'active') {
      throw new Error('Apenas beneficios ativos podem ter dependentes')
    }

    const dependent = await BenefitDependent.create({
      employeeBenefitId: employeeBenefit.id,
      name: data.name,
      cpf: data.cpf || null,
      birthDate: data.birthDate ? DateTime.fromISO(data.birthDate) : null,
      relationship: data.relationship,
    })

    await dependent.load('employeeBenefit')
    return dependent
  }

  /**
   * Remove dependente
   */
  async removeDependent(id: number) {
    const dependent = await BenefitDependent.findOrFail(id)
    await dependent.delete()
    return dependent
  }
}

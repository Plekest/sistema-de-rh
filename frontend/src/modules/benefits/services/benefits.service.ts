import api from '@/services/api'
import type {
  Benefit,
  BenefitPlan,
  EmployeeBenefit,
  BenefitDependent,
  CreateBenefitData,
  CreatePlanData,
  EnrollEmployeeData,
  AddDependentData,
  BenefitFilters,
} from '../types'

/**
 * Servico de beneficios - gerencia chamadas a API de benefits
 */
class BenefitsService {
  /**
   * Lista beneficios com paginacao e filtros
   */
  async list(filters: BenefitFilters = {}): Promise<{ data: Benefit[]; meta: any }> {
    const response = await api.get('/benefits', { params: filters })
    return response.data
  }

  /**
   * Busca um beneficio por ID com seus planos
   */
  async getById(id: number): Promise<Benefit> {
    const response = await api.get<{ data: Benefit }>(`/benefits/${id}`)
    return response.data.data
  }

  /**
   * Cria novo beneficio
   */
  async create(data: CreateBenefitData): Promise<Benefit> {
    const response = await api.post<{ data: Benefit }>('/benefits', data)
    return response.data.data
  }

  /**
   * Atualiza um beneficio
   */
  async update(id: number, data: Partial<CreateBenefitData>): Promise<Benefit> {
    const response = await api.put<{ data: Benefit }>(`/benefits/${id}`, data)
    return response.data.data
  }

  /**
   * Desativa um beneficio
   */
  async delete(id: number): Promise<Benefit> {
    const response = await api.delete<{ data: Benefit }>(`/benefits/${id}`)
    return response.data.data
  }

  /**
   * Cria plano para um beneficio
   */
  async createPlan(benefitId: number, data: CreatePlanData): Promise<BenefitPlan> {
    const response = await api.post<{ data: BenefitPlan }>(`/benefits/${benefitId}/plans`, data)
    return response.data.data
  }

  /**
   * Atualiza plano de beneficio
   */
  async updatePlan(planId: number, data: Partial<CreatePlanData>): Promise<BenefitPlan> {
    const response = await api.put<{ data: BenefitPlan }>(`/benefit-plans/${planId}`, data)
    return response.data.data
  }

  /**
   * Lista beneficios de um colaborador
   */
  async getEmployeeBenefits(employeeId: number): Promise<EmployeeBenefit[]> {
    const response = await api.get<{ data: EmployeeBenefit[] }>(`/employees/${employeeId}/benefits`)
    return response.data.data
  }

  /**
   * Realiza adesao de colaborador a um plano
   */
  async enroll(employeeId: number, data: EnrollEmployeeData): Promise<EmployeeBenefit> {
    const response = await api.post<{ data: EmployeeBenefit }>(`/employees/${employeeId}/benefits`, data)
    return response.data.data
  }

  /**
   * Cancela adesao de colaborador
   */
  async cancelEnrollment(employeeId: number, enrollmentId: number): Promise<EmployeeBenefit> {
    const response = await api.delete<{ data: EmployeeBenefit }>(`/employees/${employeeId}/benefits/${enrollmentId}`)
    return response.data.data
  }

  /**
   * Adiciona dependente a beneficio
   */
  async addDependent(employeeBenefitId: number, data: AddDependentData): Promise<BenefitDependent> {
    const response = await api.post<{ data: BenefitDependent }>(`/employee-benefits/${employeeBenefitId}/dependents`, data)
    return response.data.data
  }

  /**
   * Remove dependente
   */
  async removeDependent(dependentId: number): Promise<BenefitDependent> {
    const response = await api.delete<{ data: BenefitDependent }>(`/benefit-dependents/${dependentId}`)
    return response.data.data
  }
}

export default new BenefitsService()

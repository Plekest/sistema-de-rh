import api from '@/services/api'
import type {
  PerformanceCycle,
  Competency,
  IndividualGoal,
  Evaluation,
  DevelopmentPlan,
  CreateCycleData,
  UpdateCycleData,
  CreateCompetencyData,
  UpdateCompetencyData,
  CreateGoalData,
  UpdateGoalData,
  CreateEvaluationData,
  SubmitEvaluationData,
  CreateDevelopmentPlanData,
  UpdateDevelopmentPlanData,
  CycleFilters,
} from '../types'

class PerformanceService {
  // ===== CICLOS =====

  /**
   * Lista ciclos de avaliacao
   */
  async listCycles(filters?: CycleFilters): Promise<{ data: PerformanceCycle[]; meta?: any }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.year) params.append('year', filters.year.toString())

    const response = await api.get(`/performance/cycles?${params.toString()}`)
    return response.data
  }

  /**
   * Busca detalhe de um ciclo
   */
  async getCycle(id: number): Promise<PerformanceCycle> {
    const response = await api.get(`/performance/cycles/${id}`)
    return response.data.data
  }

  /**
   * Cria novo ciclo
   */
  async createCycle(data: CreateCycleData): Promise<PerformanceCycle> {
    const response = await api.post('/performance/cycles', data)
    return response.data.data
  }

  /**
   * Atualiza ciclo
   */
  async updateCycle(id: number, data: UpdateCycleData): Promise<PerformanceCycle> {
    const response = await api.put(`/performance/cycles/${id}`, data)
    return response.data.data
  }

  /**
   * Avanca status do ciclo
   */
  async advanceCycleStatus(id: number): Promise<PerformanceCycle> {
    const response = await api.patch(`/performance/cycles/${id}/advance`)
    return response.data.data
  }

  /**
   * Adiciona competencia ao ciclo
   */
  async addCompetencyToCycle(cycleId: number, competencyId: number, weight: number): Promise<void> {
    await api.post(`/performance/cycles/${cycleId}/competencies`, { competencyId, weight })
  }

  /**
   * Remove competencia do ciclo
   */
  async removeCompetencyFromCycle(cycleId: number, competencyId: number): Promise<void> {
    await api.delete(`/performance/cycles/${cycleId}/competencies/${competencyId}`)
  }

  // ===== COMPETENCIAS =====

  /**
   * Lista competencias
   */
  async listCompetencies(): Promise<Competency[]> {
    const response = await api.get('/performance/competencies')
    return response.data.data
  }

  /**
   * Cria nova competencia
   */
  async createCompetency(data: CreateCompetencyData): Promise<Competency> {
    const response = await api.post('/performance/competencies', data)
    return response.data.data
  }

  /**
   * Atualiza competencia
   */
  async updateCompetency(id: number, data: UpdateCompetencyData): Promise<Competency> {
    const response = await api.put(`/performance/competencies/${id}`, data)
    return response.data.data
  }

  // ===== METAS =====

  /**
   * Lista metas de um ciclo
   */
  async listGoals(cycleId: number, employeeId?: number): Promise<IndividualGoal[]> {
    const params = new URLSearchParams()
    if (employeeId) params.append('employeeId', employeeId.toString())

    const response = await api.get(`/performance/cycles/${cycleId}/goals?${params.toString()}`)
    return response.data.data
  }

  /**
   * Cria nova meta
   */
  async createGoal(data: CreateGoalData): Promise<IndividualGoal> {
    const response = await api.post('/performance/goals', data)
    return response.data.data
  }

  /**
   * Atualiza meta
   */
  async updateGoal(id: number, data: UpdateGoalData): Promise<IndividualGoal> {
    const response = await api.put(`/performance/goals/${id}`, data)
    return response.data.data
  }

  // ===== AVALIACOES =====

  /**
   * Lista avaliacoes de um ciclo
   */
  async listEvaluations(cycleId: number): Promise<Evaluation[]> {
    const response = await api.get(`/performance/cycles/${cycleId}/evaluations`)
    return response.data.data
  }

  /**
   * Busca detalhe de uma avaliacao
   */
  async getEvaluation(id: number): Promise<Evaluation> {
    const response = await api.get(`/performance/evaluations/${id}`)
    return response.data.data
  }

  /**
   * Cria nova avaliacao
   */
  async createEvaluation(data: CreateEvaluationData): Promise<Evaluation> {
    const response = await api.post('/performance/evaluations', data)
    return response.data.data
  }

  /**
   * Submete avaliacao com notas
   */
  async submitEvaluation(id: number, data: SubmitEvaluationData): Promise<Evaluation> {
    const response = await api.post(`/performance/evaluations/${id}/submit`, data)
    return response.data.data
  }

  // ===== PDI =====

  /**
   * Lista planos de desenvolvimento
   */
  async listDevelopmentPlans(employeeId?: number): Promise<DevelopmentPlan[]> {
    const params = new URLSearchParams()
    if (employeeId) params.append('employeeId', employeeId.toString())

    const response = await api.get(`/performance/development-plans?${params.toString()}`)
    return response.data.data
  }

  /**
   * Cria novo PDI
   */
  async createDevelopmentPlan(data: CreateDevelopmentPlanData): Promise<DevelopmentPlan> {
    const response = await api.post('/performance/development-plans', data)
    return response.data.data
  }

  /**
   * Atualiza PDI
   */
  async updateDevelopmentPlan(id: number, data: UpdateDevelopmentPlanData): Promise<DevelopmentPlan> {
    const response = await api.put(`/performance/development-plans/${id}`, data)
    return response.data.data
  }
}

export default new PerformanceService()

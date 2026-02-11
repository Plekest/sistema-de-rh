import api from '@/services/api'
import type {
  JobRequisition,
  RecruitmentStage,
  Candidate,
  Interview,
  CreateJobRequisitionData,
  UpdateJobRequisitionData,
  CreateCandidateData,
  UpdateCandidateData,
  MoveCandidateData,
  RejectCandidateData,
  CreateInterviewData,
  UpdateInterviewData,
  CompleteInterviewData,
  JobRequisitionFilters,
  CandidateFilters,
} from '../types'

/**
 * Servico de recrutamento - gerencia chamadas a API de recruitment
 */
class RecruitmentService {
  // ==================== Job Requisitions ====================

  /**
   * Lista vagas com paginacao e filtros
   */
  async listRequisitions(filters: JobRequisitionFilters = {}): Promise<{ data: JobRequisition[]; meta: any }> {
    const response = await api.get('/recruitment/requisitions', { params: filters })
    return response.data
  }

  /**
   * Busca uma vaga por ID
   */
  async getRequisitionById(id: number): Promise<JobRequisition> {
    const response = await api.get<{ data: JobRequisition }>(`/recruitment/requisitions/${id}`)
    return response.data.data
  }

  /**
   * Cria nova vaga
   */
  async createRequisition(data: CreateJobRequisitionData): Promise<JobRequisition> {
    const response = await api.post<{ data: JobRequisition }>('/recruitment/requisitions', data)
    return response.data.data
  }

  /**
   * Atualiza uma vaga
   */
  async updateRequisition(id: number, data: UpdateJobRequisitionData): Promise<JobRequisition> {
    const response = await api.put<{ data: JobRequisition }>(`/recruitment/requisitions/${id}`, data)
    return response.data.data
  }

  /**
   * Aprova uma vaga
   */
  async approveRequisition(id: number): Promise<JobRequisition> {
    const response = await api.patch<{ data: JobRequisition }>(`/recruitment/requisitions/${id}/approve`)
    return response.data.data
  }

  /**
   * Cancela uma vaga
   */
  async cancelRequisition(id: number): Promise<JobRequisition> {
    const response = await api.patch<{ data: JobRequisition }>(`/recruitment/requisitions/${id}/cancel`)
    return response.data.data
  }

  /**
   * Busca estatisticas de uma vaga
   */
  async getRequisitionStats(id: number): Promise<any> {
    const response = await api.get<{ data: any }>(`/recruitment/requisitions/${id}/stats`)
    return response.data.data
  }

  // ==================== Stages ====================

  /**
   * Lista etapas do pipeline
   */
  async listStages(): Promise<RecruitmentStage[]> {
    const response = await api.get<{ data: RecruitmentStage[] }>('/recruitment/stages')
    return response.data.data
  }

  // ==================== Candidates ====================

  /**
   * Lista candidatos com paginacao e filtros
   */
  async listCandidates(filters: CandidateFilters = {}): Promise<{ data: Candidate[]; meta: any }> {
    const response = await api.get('/recruitment/candidates', { params: filters })
    return response.data
  }

  /**
   * Busca um candidato por ID
   */
  async getCandidateById(id: number): Promise<Candidate> {
    const response = await api.get<{ data: Candidate }>(`/recruitment/candidates/${id}`)
    return response.data.data
  }

  /**
   * Cria novo candidato
   */
  async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    const response = await api.post<{ data: Candidate }>('/recruitment/candidates', data)
    return response.data.data
  }

  /**
   * Atualiza um candidato
   */
  async updateCandidate(id: number, data: UpdateCandidateData): Promise<Candidate> {
    const response = await api.put<{ data: Candidate }>(`/recruitment/candidates/${id}`, data)
    return response.data.data
  }

  /**
   * Move candidato para nova etapa
   */
  async moveCandidate(id: number, data: MoveCandidateData): Promise<Candidate> {
    const response = await api.patch<{ data: Candidate }>(`/recruitment/candidates/${id}/move`, data)
    return response.data.data
  }

  /**
   * Contrata candidato
   */
  async hireCandidate(id: number): Promise<Candidate> {
    const response = await api.patch<{ data: Candidate }>(`/recruitment/candidates/${id}/hire`)
    return response.data.data
  }

  /**
   * Rejeita candidato
   */
  async rejectCandidate(id: number, data?: RejectCandidateData): Promise<Candidate> {
    const response = await api.patch<{ data: Candidate }>(`/recruitment/candidates/${id}/reject`, data)
    return response.data.data
  }

  // ==================== Interviews ====================

  /**
   * Lista entrevistas de um candidato
   */
  async listInterviews(candidateId: number): Promise<Interview[]> {
    const response = await api.get<{ data: Interview[] }>(`/recruitment/candidates/${candidateId}/interviews`)
    return response.data.data
  }

  /**
   * Lista todas as entrevistas (com filtros opcionais)
   */
  async listAllInterviews(filters: { limit?: number; status?: string } = {}): Promise<Interview[]> {
    const response = await api.get<{ data: Interview[] }>('/recruitment/interviews', { params: filters })
    return response.data.data
  }

  /**
   * Cria nova entrevista
   */
  async createInterview(data: CreateInterviewData): Promise<Interview> {
    const response = await api.post<{ data: Interview }>('/recruitment/interviews', data)
    return response.data.data
  }

  /**
   * Atualiza uma entrevista
   */
  async updateInterview(id: number, data: UpdateInterviewData): Promise<Interview> {
    const response = await api.put<{ data: Interview }>(`/recruitment/interviews/${id}`, data)
    return response.data.data
  }

  /**
   * Completa uma entrevista com feedback
   */
  async completeInterview(id: number, data: CompleteInterviewData): Promise<Interview> {
    const response = await api.patch<{ data: Interview }>(`/recruitment/interviews/${id}/complete`, data)
    return response.data.data
  }

  /**
   * Cancela uma entrevista
   */
  async cancelInterview(id: number): Promise<Interview> {
    const response = await api.patch<{ data: Interview }>(`/recruitment/interviews/${id}/cancel`)
    return response.data.data
  }

  /**
   * Busca dashboard de recrutamento
   */
  async getDashboard(): Promise<any> {
    const response = await api.get<{ data: any }>('/recruitment/dashboard')
    return response.data.data
  }
}

export default new RecruitmentService()

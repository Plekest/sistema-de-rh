import api from '@/services/api'
import type {
  Training,
  TrainingFilters,
  TrainingStats,
  CreateTrainingData,
  UpdateTrainingData,
  TrainingEnrollment,
  EnrollEmployeeData,
  BulkEnrollData,
  UpdateEnrollmentData,
} from '../types'

/**
 * Servico de treinamentos - gerencia chamadas a API de trainings
 */
class TrainingService {
  /**
   * Lista treinamentos com paginacao e filtros
   */
  async list(filters: TrainingFilters = {}): Promise<{ data: Training[]; meta: any }> {
    const response = await api.get('/trainings', { params: filters })
    return response.data
  }

  /**
   * Busca um treinamento por ID
   */
  async getById(id: number): Promise<Training> {
    const response = await api.get<{ data: Training }>(`/trainings/${id}`)
    return response.data.data
  }

  /**
   * Cria novo treinamento
   */
  async create(data: CreateTrainingData): Promise<Training> {
    const response = await api.post<{ data: Training }>('/trainings', data)
    return response.data.data
  }

  /**
   * Atualiza treinamento existente
   */
  async update(id: number, data: UpdateTrainingData): Promise<Training> {
    const response = await api.put<{ data: Training }>(`/trainings/${id}`, data)
    return response.data.data
  }

  /**
   * Deleta treinamento
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/trainings/${id}`)
  }

  /**
   * Busca estatisticas de treinamentos
   */
  async getStats(): Promise<TrainingStats> {
    const response = await api.get<{ data: TrainingStats }>('/trainings/stats')
    return response.data.data
  }

  /**
   * Inscreve um colaborador em um treinamento
   */
  async enrollEmployee(trainingId: number, data: EnrollEmployeeData): Promise<TrainingEnrollment> {
    const response = await api.post<{ data: TrainingEnrollment }>(`/trainings/${trainingId}/enroll`, data)
    return response.data.data
  }

  /**
   * Inscreve multiplos colaboradores em um treinamento
   */
  async bulkEnroll(trainingId: number, data: BulkEnrollData): Promise<TrainingEnrollment[]> {
    const response = await api.post<{ data: TrainingEnrollment[] }>(`/trainings/${trainingId}/bulk-enroll`, data)
    return response.data.data
  }

  /**
   * Atualiza inscricao de um colaborador
   */
  async updateEnrollment(enrollmentId: number, data: UpdateEnrollmentData): Promise<TrainingEnrollment> {
    const response = await api.put<{ data: TrainingEnrollment }>(`/trainings/enrollments/${enrollmentId}`, data)
    return response.data.data
  }

  /**
   * Busca treinamentos de um colaborador especifico
   */
  async getEmployeeTrainings(employeeId: number): Promise<Training[]> {
    const response = await api.get<{ data: Training[] }>(`/trainings/employee/${employeeId}`)
    return response.data.data
  }
}

export default new TrainingService()

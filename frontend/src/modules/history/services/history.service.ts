import api from '@/services/api'
import type { HistoryEntry, HistoryFormData } from '../types'
import type { PaginatedResponse } from '@/modules/employees/types'

/**
 * Servico de historico - gerencia chamadas a API de history
 */
class HistoryService {
  /**
   * Lista registros de historico de um colaborador
   */
  async getAll(employeeId: number, params?: { type?: string; page?: number; limit?: number }): Promise<PaginatedResponse<HistoryEntry>> {
    const response = await api.get<PaginatedResponse<HistoryEntry>>(`/employees/${employeeId}/history`, { params })
    return response.data
  }

  /**
   * Cria novo registro de historico para um colaborador
   */
  async create(employeeId: number, data: Omit<HistoryFormData, 'employeeId'>): Promise<HistoryEntry> {
    const response = await api.post<{ data: HistoryEntry }>(`/employees/${employeeId}/history`, data)
    return response.data.data
  }
}

export default new HistoryService()

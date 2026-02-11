import api from '@/services/api'
import type { HoursBankEntry, HoursBankSummary } from '../types'
import type { PaginatedResponse } from '@/modules/employees/types'

/**
 * Servico de banco de horas - gerencia chamadas a API de hours-bank
 */
class HoursBankService {
  /**
   * Lista registros de banco de horas de um colaborador
   */
  async getAll(employeeId: number, params?: { year?: number; page?: number; limit?: number }): Promise<PaginatedResponse<HoursBankEntry>> {
    const response = await api.get<PaginatedResponse<HoursBankEntry>>(`/employees/${employeeId}/hours-bank`, { params })
    return response.data
  }

  /**
   * Busca saldo do banco de horas de um colaborador
   */
  async getBalance(employeeId: number): Promise<HoursBankSummary> {
    const response = await api.get<{ data: HoursBankSummary }>(`/employees/${employeeId}/hours-bank/balance`)
    return response.data.data
  }

  /**
   * Calcula banco de horas de um colaborador para um mes/ano
   */
  async calculate(employeeId: number, month: number, year: number): Promise<HoursBankEntry> {
    const response = await api.post<{ data: HoursBankEntry }>(`/employees/${employeeId}/hours-bank/calculate`, { month, year })
    return response.data.data
  }
}

export default new HoursBankService()

import api from '@/services/api'
import type { Leave, LeaveBalance, LeaveConfig, CreateLeaveData, LeaveFilters } from '../types'

/**
 * Servico de ferias e licencas - gerencia chamadas a API de leaves
 */
class LeaveService {
  /**
   * Lista solicitacoes de ferias/licencas com paginacao e filtros
   */
  async list(filters: LeaveFilters = {}): Promise<{ data: Leave[]; meta: any }> {
    const response = await api.get('/leaves', { params: filters })
    return response.data
  }

  /**
   * Busca uma solicitacao por ID
   */
  async getById(id: number): Promise<Leave> {
    const response = await api.get<{ data: Leave }>(`/leaves/${id}`)
    return response.data.data
  }

  /**
   * Cria nova solicitacao de ferias/licenca
   */
  async create(data: CreateLeaveData): Promise<Leave> {
    const response = await api.post<{ data: Leave }>('/leaves', data)
    return response.data.data
  }

  /**
   * Aprova uma solicitacao de ferias/licenca
   */
  async approve(id: number): Promise<Leave> {
    const response = await api.patch<{ data: Leave }>(`/leaves/${id}/approve`)
    return response.data.data
  }

  /**
   * Rejeita uma solicitacao de ferias/licenca
   */
  async reject(id: number, rejectionReason?: string): Promise<Leave> {
    const response = await api.patch<{ data: Leave }>(`/leaves/${id}/reject`, { rejectionReason })
    return response.data.data
  }

  /**
   * Cancela uma solicitacao de ferias/licenca
   */
  async cancel(id: number): Promise<Leave> {
    const response = await api.patch<{ data: Leave }>(`/leaves/${id}/cancel`)
    return response.data.data
  }

  /**
   * Busca saldo de ferias de um colaborador
   */
  async getBalances(employeeId: number): Promise<LeaveBalance[]> {
    const response = await api.get<{ data: LeaveBalance[] }>(`/employees/${employeeId}/leave-balance`)
    return response.data.data
  }

  /**
   * Calcula periodos aquisitivos de ferias para um colaborador
   */
  async calculateBalances(employeeId: number): Promise<LeaveBalance[]> {
    const response = await api.post<{ data: LeaveBalance[] }>(`/employees/${employeeId}/leave-balance/calculate`)
    return response.data.data
  }

  /**
   * Busca calendario de ausencias (ferias/licencas) em um periodo
   */
  async getCalendar(startDate: string, endDate: string, departmentId?: number): Promise<Leave[]> {
    const params: Record<string, string | number> = { startDate, endDate }
    if (departmentId) params.departmentId = departmentId
    const response = await api.get<{ data: Leave[] }>('/leaves/calendar', { params })
    return response.data.data
  }

  /**
   * Busca configuracoes de tipos de licenca
   */
  async getConfigs(): Promise<LeaveConfig[]> {
    const response = await api.get<{ data: LeaveConfig[] }>('/leave-configs')
    return response.data.data
  }

  /**
   * Atualiza configuracao de tipo de licenca
   */
  async updateConfig(id: number, data: Partial<LeaveConfig>): Promise<LeaveConfig> {
    const response = await api.put<{ data: LeaveConfig }>(`/leave-configs/${id}`, data)
    return response.data.data
  }
}

export default new LeaveService()

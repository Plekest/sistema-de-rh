import api from '@/services/api'
import type {
  TimeEntry,
  TimeEntryFormData,
  AttendanceListParams,
} from '../types'
import type { PaginatedResponse } from '@/modules/employees/types'

/**
 * Servico de registro de ponto - gerencia chamadas a API de attendance
 */
class AttendanceService {
  /**
   * Lista registros de ponto de um colaborador especifico (admin/manager)
   */
  async getAll(employeeId: number, params?: AttendanceListParams): Promise<PaginatedResponse<TimeEntry>> {
    const response = await api.get<PaginatedResponse<TimeEntry>>(`/employees/${employeeId}/attendance`, { params })
    return response.data
  }

  /**
   * Busca registros do dia atual do usuario logado
   */
  async getToday(): Promise<TimeEntry | null> {
    const response = await api.get<{ data: TimeEntry | null }>('/attendance/today')
    return response.data.data
  }

  /**
   * Busca registros recentes do usuario logado (ultimos 7 dias)
   */
  async getRecent(): Promise<TimeEntry[]> {
    const response = await api.get<{ data: TimeEntry[] }>('/attendance/recent')
    return response.data.data
  }

  /**
   * Registra entrada
   */
  async clockIn(): Promise<TimeEntry> {
    const response = await api.post<{ data: TimeEntry }>('/attendance/clock-in')
    return response.data.data
  }

  /**
   * Registra saida
   */
  async clockOut(): Promise<TimeEntry> {
    const response = await api.post<{ data: TimeEntry }>('/attendance/clock-out')
    return response.data.data
  }

  /**
   * Registra saida para almoco
   */
  async lunchStart(): Promise<TimeEntry> {
    const response = await api.post<{ data: TimeEntry }>('/attendance/lunch-start')
    return response.data.data
  }

  /**
   * Registra volta do almoco
   */
  async lunchEnd(): Promise<TimeEntry> {
    const response = await api.post<{ data: TimeEntry }>('/attendance/lunch-end')
    return response.data.data
  }

  /**
   * Cria registro de ponto manual (admin/manager)
   */
  async create(employeeId: number, data: Omit<TimeEntryFormData, 'employeeId'>): Promise<TimeEntry> {
    const response = await api.post<{ data: TimeEntry }>(`/employees/${employeeId}/attendance`, data)
    return response.data.data
  }
}

export default new AttendanceService()

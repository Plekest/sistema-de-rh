import api from '@/services/api'
import type { AuditLog, AuditLogFilters } from '../types/auditLog'
import type { PaginatedResponse } from '@/modules/employees/types'

/**
 * Servico de audit log - gerencia chamadas a API de logs de auditoria
 */
class AuditLogService {
  /**
   * Lista logs de auditoria com paginacao e filtros
   */
  async getAll(params?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const response = await api.get<PaginatedResponse<AuditLog>>('/audit-logs', { params })
    return response.data
  }

  /**
   * Busca log de auditoria por ID
   */
  async getById(id: number): Promise<AuditLog> {
    const response = await api.get<{ data: AuditLog }>(`/audit-logs/${id}`)
    return response.data.data
  }
}

export default new AuditLogService()

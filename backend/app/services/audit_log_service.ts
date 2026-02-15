import AuditLog from '#models/audit_log'
import { DateTime } from 'luxon'

interface CreateAuditLogData {
  userId?: number | null
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'approve'
    | 'reject'
    | 'process'
    | 'export'
    | 'download'
  resourceType: string
  resourceId?: number | null
  description: string
  oldValues?: Record<string, any> | null
  newValues?: Record<string, any> | null
  ipAddress?: string | null
  userAgent?: string | null
}

interface ListFilters {
  page?: number
  limit?: number
  action?: string
  resource_type?: string
  user_id?: number
  from?: string
  to?: string
}

export default class AuditLogService {
  /**
   * Registra uma acao no audit log
   */
  static async log(data: CreateAuditLogData) {
    try {
      await AuditLog.create({
        userId: data.userId || null,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId || null,
        description: data.description,
        oldValues: data.oldValues || null,
        newValues: data.newValues || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      })
    } catch (error) {
      // Nao quebra a execucao se falhar ao logar
      console.error('[AuditLog] Erro ao registrar log:', error.message)
    }
  }

  /**
   * Lista logs com filtros e paginacao
   */
  async list(filters: ListFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = AuditLog.query().preload('user').orderBy('created_at', 'desc')

    if (filters.action) {
      query.where('action', filters.action)
    }

    if (filters.resource_type) {
      query.where('resource_type', filters.resource_type)
    }

    if (filters.user_id) {
      query.where('user_id', filters.user_id)
    }

    if (filters.from) {
      const fromDate = DateTime.fromISO(filters.from).startOf('day')
      const fromSql = fromDate.toSQL()
      if (fromSql) {
        query.where('created_at', '>=', fromSql)
      }
    }

    if (filters.to) {
      const toDate = DateTime.fromISO(filters.to).endOf('day')
      const toSql = toDate.toSQL()
      if (toSql) {
        query.where('created_at', '<=', toSql)
      }
    }

    const result = await query.paginate(page, limit)
    return result
  }
}

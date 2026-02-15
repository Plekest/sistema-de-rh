export interface AuditLog {
  id: number
  userId: number
  userName: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'other'
  resource: string
  resourceId?: number
  description: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  action?: string
  resource?: string
  userId?: number
  from?: string
  to?: string
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class AuditLog extends BaseModel {
  static table = 'audit_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare action:
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

  @column()
  declare resourceType: string

  @column()
  declare resourceId: number | null

  @column()
  declare description: string

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: any) => {
      if (typeof value === 'string') return JSON.parse(value)
      return value
    },
  })
  declare oldValues: Record<string, any> | null

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: any) => {
      if (typeof value === 'string') return JSON.parse(value)
      return value
    },
  })
  declare newValues: Record<string, any> | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

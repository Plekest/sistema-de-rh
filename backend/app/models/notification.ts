import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type NotificationType =
  | 'leave_approved'
  | 'leave_rejected'
  | 'document_uploaded'
  | 'salary_changed'
  | 'training_enrollment'
  | 'training_completed'
  | 'general'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: NotificationType

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare isRead: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column({
    prepare: (value: Record<string, unknown> | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | Record<string, unknown> | null) => {
      if (!value) return null
      if (typeof value === 'string') return JSON.parse(value)
      return value
    },
  })
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

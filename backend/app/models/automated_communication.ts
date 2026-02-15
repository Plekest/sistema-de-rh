import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import CommunicationLog from '#models/communication_log'

export default class AutomatedCommunication extends BaseModel {
  static table = 'automated_communications'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare triggerType:
    | 'birthday'
    | 'work_anniversary'
    | 'document_expiring'
    | 'probation_ending'
    | 'leave_returning'
    | 'onboarding_incomplete'
    | 'custom'

  @column()
  declare triggerDaysBefore: number

  @column()
  declare messageTemplate: string

  @column()
  declare isActive: boolean

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => (value ? JSON.parse(value) : null),
  })
  declare targetRoles: string[] | null

  @column.dateTime()
  declare lastExecutedAt: DateTime | null

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => CommunicationLog, { foreignKey: 'communicationId' })
  declare logs: HasMany<typeof CommunicationLog>
}

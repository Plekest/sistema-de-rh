import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AutomatedCommunication from '#models/automated_communication'
import Employee from '#models/employee'
import User from '#models/user'

export default class CommunicationLog extends BaseModel {
  static table = 'communication_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare communicationId: number | null

  @column()
  declare employeeId: number | null

  @column()
  declare userId: number | null

  @column()
  declare message: string

  @column.dateTime()
  declare sentAt: DateTime

  @column()
  declare status: 'sent' | 'read' | 'failed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => AutomatedCommunication, { foreignKey: 'communicationId' })
  declare communication: BelongsTo<typeof AutomatedCommunication>

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import User from '#models/user'

export default class DataChangeRequest extends BaseModel {
  static table = 'data_change_requests'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare requestedBy: number

  @column()
  declare reviewedBy: number | null

  @column()
  declare fieldName: string

  @column()
  declare oldValue: string | null

  @column()
  declare newValue: string

  @column()
  declare reason: string | null

  @column()
  declare status: 'pending' | 'approved' | 'rejected'

  @column()
  declare reviewNotes: string | null

  @column.dateTime()
  declare reviewedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => User, {
    foreignKey: 'requestedBy',
  })
  declare requestor: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'reviewedBy',
  })
  declare reviewer: BelongsTo<typeof User>
}

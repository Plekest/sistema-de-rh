import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LeaveConfig extends BaseModel {
  static table = 'leave_configs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare leaveType: string

  @column()
  declare label: string

  @column()
  declare defaultDays: number

  @column()
  declare requiresApproval: boolean

  @column()
  declare requiresDocument: boolean

  @column()
  declare isPaid: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

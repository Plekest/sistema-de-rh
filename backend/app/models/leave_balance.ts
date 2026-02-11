import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'

export default class LeaveBalance extends BaseModel {
  static table = 'leave_balances'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column.date()
  declare accrualStartDate: DateTime

  @column.date()
  declare accrualEndDate: DateTime

  @column()
  declare totalDays: number

  @column()
  declare usedDays: number

  @column()
  declare soldDays: number

  @column()
  declare remainingDays: number

  @column()
  declare status: 'accruing' | 'available' | 'partially_used' | 'used' | 'expired'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

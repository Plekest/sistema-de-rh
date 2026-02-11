import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'

export default class HoursBank extends BaseModel {
  static table = 'hours_bank'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare referenceMonth: number

  @column()
  declare referenceYear: number

  @column()
  declare expectedMinutes: number

  @column()
  declare workedMinutes: number

  @column()
  declare balanceMinutes: number

  @column()
  declare accumulatedBalanceMinutes: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

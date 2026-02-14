import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'

export default class TimeEntry extends BaseModel {
  static table = 'time_entries'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column.date()
  declare date: DateTime

  @column.dateTime()
  declare clockIn: DateTime | null

  @column.dateTime()
  declare clockOut: DateTime | null

  @column.dateTime()
  declare lunchStart: DateTime | null

  @column.dateTime()
  declare lunchEnd: DateTime | null

  @column()
  declare totalWorkedMinutes: number

  @column()
  declare isLate: boolean

  @column()
  declare lateMinutes: number

  @column()
  declare type: 'regular' | 'overtime' | 'absence' | 'holiday'

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

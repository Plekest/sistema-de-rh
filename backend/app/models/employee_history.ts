import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import User from '#models/user'

export default class EmployeeHistory extends BaseModel {
  static table = 'employee_histories'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare type:
    | 'hire'
    | 'promotion'
    | 'transfer'
    | 'salary_change'
    | 'warning'
    | 'note'
    | 'termination'
    | 'document'
    | 'other'

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare oldValue: string | null

  @column()
  declare newValue: string | null

  @column()
  declare createdBy: number | null

  @column.date()
  declare eventDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>
}

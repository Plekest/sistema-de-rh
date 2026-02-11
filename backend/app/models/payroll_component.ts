import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'

export default class PayrollComponent extends BaseModel {
  static table = 'payroll_components'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare type: 'base_salary' | 'fixed_bonus' | 'hazard_pay' | 'unhealthy_pay' | 'other'

  @column()
  declare description: string

  @column()
  declare amount: number

  @column()
  declare isActive: boolean

  @column.date()
  declare effectiveFrom: DateTime

  @column.date()
  declare effectiveUntil: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

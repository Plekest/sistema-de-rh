import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PayrollPeriod from '#models/payroll_period'
import Employee from '#models/employee'

export default class PayrollEntry extends BaseModel {
  static table = 'payroll_entries'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare payrollPeriodId: number

  @column()
  declare employeeId: number

  @column()
  declare componentType: 'earning' | 'deduction'

  @column()
  declare code:
    | 'base_salary'
    | 'overtime_50'
    | 'overtime_100'
    | 'night_shift'
    | 'bonus'
    | 'commission'
    | 'fixed_bonus'
    | 'hazard_pay'
    | 'unhealthy_pay'
    | 'inss'
    | 'irrf'
    | 'fgts'
    | 'vt_discount'
    | 'benefit_discount'
    | 'absence'
    | 'advance'
    | 'other'

  @column()
  declare description: string

  @column()
  declare referenceValue: number | null

  @column()
  declare quantity: number | null

  @column()
  declare amount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => PayrollPeriod)
  declare period: BelongsTo<typeof PayrollPeriod>

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

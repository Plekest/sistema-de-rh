import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PayrollPeriod from '#models/payroll_period'
import Employee from '#models/employee'

export default class PaySlip extends BaseModel {
  static table = 'pay_slips'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare payrollPeriodId: number

  @column()
  declare employeeId: number

  @column()
  declare grossSalary: number

  @column()
  declare totalEarnings: number

  @column()
  declare totalDeductions: number

  @column()
  declare netSalary: number

  @column()
  declare inssAmount: number

  @column()
  declare irrfAmount: number

  @column()
  declare fgtsAmount: number

  @column({
    prepare: (value: any) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value: any) => {
      if (!value) return null
      return typeof value === 'string' ? JSON.parse(value) : value
    },
  })
  declare details: Record<string, any> | null

  @column()
  declare status: 'draft' | 'final'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => PayrollPeriod)
  declare period: BelongsTo<typeof PayrollPeriod>

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

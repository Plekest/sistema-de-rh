import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Benefit from '#models/benefit'
import EmployeeBenefit from '#models/employee_benefit'

export default class BenefitPlan extends BaseModel {
  static table = 'benefit_plans'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare benefitId: number

  @column()
  declare name: string

  @column()
  declare monthlyValue: number

  @column()
  declare employeeDiscountValue: number | null

  @column()
  declare employeeDiscountPercentage: number | null

  @column({
    prepare: (value: any) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value: any) => {
      if (!value) return null
      return typeof value === 'string' ? JSON.parse(value) : value
    },
  })
  declare eligibilityRules: Record<string, any> | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Benefit)
  declare benefit: BelongsTo<typeof Benefit>

  @hasMany(() => EmployeeBenefit)
  declare employeeBenefits: HasMany<typeof EmployeeBenefit>
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import BenefitPlan from '#models/benefit_plan'
import BenefitDependent from '#models/benefit_dependent'

export default class EmployeeBenefit extends BaseModel {
  static table = 'employee_benefits'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare benefitPlanId: number

  @column.date()
  declare enrollmentDate: DateTime

  @column.date()
  declare cancellationDate: DateTime | null

  @column()
  declare status: 'active' | 'cancelled' | 'suspended'

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => BenefitPlan)
  declare benefitPlan: BelongsTo<typeof BenefitPlan>

  @hasMany(() => BenefitDependent)
  declare dependents: HasMany<typeof BenefitDependent>
}

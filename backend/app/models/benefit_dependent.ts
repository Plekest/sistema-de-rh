import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import EmployeeBenefit from '#models/employee_benefit'

export default class BenefitDependent extends BaseModel {
  static table = 'benefit_dependents'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeBenefitId: number

  @column()
  declare name: string

  @column()
  declare cpf: string | null

  @column.date()
  declare birthDate: DateTime | null

  @column()
  declare relationship: 'spouse' | 'child' | 'parent' | 'other'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => EmployeeBenefit)
  declare employeeBenefit: BelongsTo<typeof EmployeeBenefit>
}

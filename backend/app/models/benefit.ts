import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import BenefitPlan from '#models/benefit_plan'

export default class Benefit extends BaseModel {
  static table = 'benefits'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare type: 'vt' | 'vr' | 'va' | 'health' | 'dental' | 'life_insurance' | 'daycare' | 'gym' | 'other'

  @column()
  declare description: string | null

  @column()
  declare provider: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => BenefitPlan)
  declare plans: HasMany<typeof BenefitPlan>
}

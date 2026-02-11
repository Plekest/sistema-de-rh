import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import CycleCompetency from '#models/cycle_competency'
import EvaluationScore from '#models/evaluation_score'

export default class Competency extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare category: 'technical' | 'behavioral' | 'leadership'

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => CycleCompetency)
  declare cycleCompetencies: HasMany<typeof CycleCompetency>

  @hasMany(() => EvaluationScore)
  declare evaluationScores: HasMany<typeof EvaluationScore>
}

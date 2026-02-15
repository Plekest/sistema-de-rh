import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import PerformanceCycle from '#models/performance_cycle'
import Employee from '#models/employee'
import EvaluationScore from '#models/evaluation_score'

export default class Evaluation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cycleId: number

  @column()
  declare employeeId: number

  @column()
  declare evaluatorId: number | null

  @column()
  declare type: 'self' | 'manager'

  @column()
  declare status: 'pending' | 'in_progress' | 'completed'

  @column()
  declare overallScore: number | null

  @column()
  declare comments: string | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => PerformanceCycle, { foreignKey: 'cycleId' })
  declare cycle: BelongsTo<typeof PerformanceCycle>

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => Employee, { foreignKey: 'evaluatorId' })
  declare evaluator: BelongsTo<typeof Employee>

  @hasMany(() => EvaluationScore)
  declare scores: HasMany<typeof EvaluationScore>
}

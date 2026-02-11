import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import CycleCompetency from '#models/cycle_competency'
import IndividualGoal from '#models/individual_goal'
import Evaluation from '#models/evaluation'

export default class PerformanceCycle extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare type: 'semestral' | 'anual'

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column.date()
  declare selfEvalDeadline: DateTime

  @column.date()
  declare managerEvalDeadline: DateTime

  @column()
  declare status: 'draft' | 'self_eval' | 'manager_eval' | 'calibration' | 'closed'

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => CycleCompetency)
  declare cycleCompetencies: HasMany<typeof CycleCompetency>

  @hasMany(() => IndividualGoal)
  declare individualGoals: HasMany<typeof IndividualGoal>

  @hasMany(() => Evaluation)
  declare evaluations: HasMany<typeof Evaluation>
}

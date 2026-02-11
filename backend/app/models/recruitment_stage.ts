import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Candidate from '#models/candidate'
import CandidateStageHistory from '#models/candidate_stage_history'
import Interview from '#models/interview'

export default class RecruitmentStage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare displayOrder: number

  @column()
  declare isDefault: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Candidate, {
    foreignKey: 'currentStageId',
  })
  declare currentCandidates: HasMany<typeof Candidate>

  @hasMany(() => CandidateStageHistory, {
    foreignKey: 'stageId',
  })
  declare stageHistories: HasMany<typeof CandidateStageHistory>

  @hasMany(() => Interview, {
    foreignKey: 'stageId',
  })
  declare interviews: HasMany<typeof Interview>
}

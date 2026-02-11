import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Candidate from '#models/candidate'
import RecruitmentStage from '#models/recruitment_stage'
import User from '#models/user'

export default class CandidateStageHistory extends BaseModel {
  static table = 'candidate_stage_history'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare candidateId: number

  @column()
  declare stageId: number

  @column()
  declare movedBy: number

  @column()
  declare feedback: string | null

  @column()
  declare score: number | null

  @column.dateTime()
  declare enteredAt: DateTime

  @column.dateTime()
  declare leftAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Candidate)
  declare candidate: BelongsTo<typeof Candidate>

  @belongsTo(() => RecruitmentStage, {
    foreignKey: 'stageId',
  })
  declare stage: BelongsTo<typeof RecruitmentStage>

  @belongsTo(() => User, {
    foreignKey: 'movedBy',
  })
  declare mover: BelongsTo<typeof User>
}

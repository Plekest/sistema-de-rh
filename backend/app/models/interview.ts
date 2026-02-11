import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Candidate from '#models/candidate'
import Employee from '#models/employee'
import RecruitmentStage from '#models/recruitment_stage'

export default class Interview extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare candidateId: number

  @column()
  declare interviewerId: number

  @column()
  declare stageId: number

  @column.dateTime()
  declare scheduledAt: DateTime

  @column()
  declare durationMinutes: number | null

  @column()
  declare location: string | null

  @column()
  declare meetingLink: string | null

  @column()
  declare status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'

  @column()
  declare feedback: string | null

  @column()
  declare score: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Candidate)
  declare candidate: BelongsTo<typeof Candidate>

  @belongsTo(() => Employee, {
    foreignKey: 'interviewerId',
  })
  declare interviewer: BelongsTo<typeof Employee>

  @belongsTo(() => RecruitmentStage, {
    foreignKey: 'stageId',
  })
  declare stage: BelongsTo<typeof RecruitmentStage>
}

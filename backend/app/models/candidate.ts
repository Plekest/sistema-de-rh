import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import JobRequisition from '#models/job_requisition'
import RecruitmentStage from '#models/recruitment_stage'
import CandidateStageHistory from '#models/candidate_stage_history'
import Interview from '#models/interview'

export default class Candidate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jobRequisitionId: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare linkedinUrl: string | null

  @column({
    consume: (value: any) => value ? Number(value) : null,
  })
  declare salaryExpectation: number | null

  @column()
  declare resumePath: string | null

  @column()
  declare source: 'referral' | 'linkedin' | 'website' | 'agency' | 'other'

  @column()
  declare currentStageId: number

  @column()
  declare status: 'active' | 'hired' | 'rejected' | 'withdrawn'

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => JobRequisition)
  declare jobRequisition: BelongsTo<typeof JobRequisition>

  @belongsTo(() => RecruitmentStage, {
    foreignKey: 'currentStageId',
  })
  declare currentStage: BelongsTo<typeof RecruitmentStage>

  @hasMany(() => CandidateStageHistory)
  declare stageHistory: HasMany<typeof CandidateStageHistory>

  @hasMany(() => Interview)
  declare interviews: HasMany<typeof Interview>
}

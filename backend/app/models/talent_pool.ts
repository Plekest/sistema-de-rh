import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Candidate from '#models/candidate'
import User from '#models/user'
import TalentPoolTag from '#models/talent_pool_tag'

export default class TalentPool extends BaseModel {
  static table = 'talent_pools'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare candidateId: number | null

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare linkedinUrl: string | null

  @column()
  declare resumeUrl: string | null

  @column()
  declare source: 'recruitment' | 'referral' | 'spontaneous' | 'linkedin' | 'event' | 'other'

  @column()
  declare status: 'active' | 'contacted' | 'interviewing' | 'hired' | 'archived'

  @column()
  declare notes: string | null

  @column()
  declare experienceYears: number | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare salaryExpectation: number | null

  @column()
  declare availability: 'immediate' | '15_days' | '30_days' | '60_days' | 'unavailable' | null

  @column()
  declare addedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Candidate, { foreignKey: 'candidateId' })
  declare candidate: BelongsTo<typeof Candidate>

  @belongsTo(() => User, { foreignKey: 'addedBy' })
  declare addedByUser: BelongsTo<typeof User>

  @manyToMany(() => TalentPoolTag, {
    pivotTable: 'talent_pool_tag_pivot',
    localKey: 'id',
    pivotForeignKey: 'talent_pool_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof TalentPoolTag>
}

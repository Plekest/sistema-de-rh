import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Department from '#models/department'
import Position from '#models/position'
import User from '#models/user'
import Candidate from '#models/candidate'

export default class JobRequisition extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare departmentId: number | null

  @column()
  declare positionId: number | null

  @column()
  declare requestedBy: number

  @column()
  declare approvedBy: number | null

  @column({
    consume: (value: any) => value ? Number(value) : null,
  })
  declare salaryRangeMin: number | null

  @column({
    consume: (value: any) => value ? Number(value) : null,
  })
  declare salaryRangeMax: number | null

  @column()
  declare employmentType: 'clt' | 'pj'

  @column()
  declare workModel: 'onsite' | 'hybrid' | 'remote'

  @column()
  declare headcount: number

  @column()
  declare description: string | null

  @column()
  declare requirements: string | null

  @column()
  declare status: 'pending_approval' | 'approved' | 'open' | 'filled' | 'cancelled'

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare closedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Department)
  declare department: BelongsTo<typeof Department>

  @belongsTo(() => Position)
  declare position: BelongsTo<typeof Position>

  @belongsTo(() => User, {
    foreignKey: 'requestedBy',
  })
  declare requester: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'approvedBy',
  })
  declare approver: BelongsTo<typeof User>

  @hasMany(() => Candidate)
  declare candidates: HasMany<typeof Candidate>
}

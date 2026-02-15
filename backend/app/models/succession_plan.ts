import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Position from '#models/position'
import Employee from '#models/employee'
import User from '#models/user'

export default class SuccessionPlan extends BaseModel {
  static table = 'succession_plans'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare positionId: number

  @column()
  declare currentHolderId: number | null

  @column()
  declare successorId: number | null

  @column()
  declare readiness: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'development_needed'

  @column()
  declare priority: 'critical' | 'high' | 'medium' | 'low'

  @column()
  declare developmentActions: string | null

  @column()
  declare notes: string | null

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Position, { foreignKey: 'positionId' })
  declare position: BelongsTo<typeof Position>

  @belongsTo(() => Employee, { foreignKey: 'currentHolderId' })
  declare currentHolder: BelongsTo<typeof Employee>

  @belongsTo(() => Employee, { foreignKey: 'successorId' })
  declare successor: BelongsTo<typeof Employee>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'

export default class EngagementScore extends BaseModel {
  static table = 'engagement_scores'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare score: number

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare attendanceScore: number | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare performanceScore: number | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare trainingScore: number | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare tenureScore: number | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare leaveScore: number | null

  @column()
  declare referenceMonth: number

  @column()
  declare referenceYear: number

  @column.dateTime()
  declare calculatedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

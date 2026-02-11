import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PerformanceCycle from '#models/performance_cycle'
import Employee from '#models/employee'

export default class IndividualGoal extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cycleId: number

  @column()
  declare employeeId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare weight: number

  @column()
  declare targetValue: string | null

  @column()
  declare achievedValue: string | null

  @column()
  declare status: 'pending' | 'in_progress' | 'achieved' | 'not_achieved'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => PerformanceCycle)
  declare cycle: BelongsTo<typeof PerformanceCycle>

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

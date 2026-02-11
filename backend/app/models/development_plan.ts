import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import PerformanceCycle from '#models/performance_cycle'

export default class DevelopmentPlan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare cycleId: number | null

  @column()
  declare action: string

  @column()
  declare description: string | null

  @column()
  declare responsibleId: number | null

  @column.date()
  declare deadline: DateTime | null

  @column()
  declare status: 'pending' | 'in_progress' | 'completed' | 'cancelled'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => PerformanceCycle)
  declare cycle: BelongsTo<typeof PerformanceCycle>

  @belongsTo(() => Employee, { foreignKey: 'responsibleId' })
  declare responsible: BelongsTo<typeof Employee>
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PerformanceCycle from '#models/performance_cycle'
import Competency from '#models/competency'

export default class CycleCompetency extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare cycleId: number

  @column()
  declare competencyId: number

  @column()
  declare weight: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => PerformanceCycle)
  declare cycle: BelongsTo<typeof PerformanceCycle>

  @belongsTo(() => Competency)
  declare competency: BelongsTo<typeof Competency>
}

import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AnalyticsSnapshot extends BaseModel {
  static table = 'analytics_snapshots'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: 'monthly_summary' | 'department_health' | 'turnover_prediction' | 'engagement_trend'

  @column()
  declare referenceMonth: number

  @column()
  declare referenceYear: number

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare data: Record<string, any>

  @column.dateTime()
  declare generatedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}

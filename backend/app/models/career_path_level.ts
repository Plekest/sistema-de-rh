import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import CareerPath from '#models/career_path'
import Position from '#models/position'

export default class CareerPathLevel extends BaseModel {
  static table = 'career_path_levels'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare careerPathId: number

  @column()
  declare positionId: number | null

  @column()
  declare levelOrder: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare minExperienceMonths: number | null

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare requiredSkills: Record<string, any> | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare salaryRangeMin: number | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare salaryRangeMax: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => CareerPath, { foreignKey: 'careerPathId' })
  declare careerPath: BelongsTo<typeof CareerPath>

  @belongsTo(() => Position, { foreignKey: 'positionId' })
  declare position: BelongsTo<typeof Position>
}

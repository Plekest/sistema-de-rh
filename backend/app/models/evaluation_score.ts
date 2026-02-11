import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Evaluation from '#models/evaluation'
import Competency from '#models/competency'

export default class EvaluationScore extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare evaluationId: number

  @column()
  declare competencyId: number

  @column()
  declare score: number

  @column()
  declare comments: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Evaluation)
  declare evaluation: BelongsTo<typeof Evaluation>

  @belongsTo(() => Competency)
  declare competency: BelongsTo<typeof Competency>
}

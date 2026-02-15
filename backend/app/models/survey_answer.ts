import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SurveyResponse from '#models/survey_response'
import SurveyQuestion from '#models/survey_question'

export default class SurveyAnswer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare responseId: number

  @column()
  declare questionId: number

  @column()
  declare value: string | null

  @column()
  declare numericValue: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => SurveyResponse, { foreignKey: 'responseId' })
  declare response: BelongsTo<typeof SurveyResponse>

  @belongsTo(() => SurveyQuestion, { foreignKey: 'questionId' })
  declare question: BelongsTo<typeof SurveyQuestion>
}

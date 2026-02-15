import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Survey from '#models/survey'
import Employee from '#models/employee'
import SurveyAnswer from '#models/survey_answer'

export default class SurveyResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare surveyId: number

  @column()
  declare employeeId: number | null

  @column.dateTime()
  declare submittedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Survey, { foreignKey: 'surveyId' })
  declare survey: BelongsTo<typeof Survey>

  @belongsTo(() => Employee, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof Employee>

  @hasMany(() => SurveyAnswer, { foreignKey: 'responseId' })
  declare answers: HasMany<typeof SurveyAnswer>
}

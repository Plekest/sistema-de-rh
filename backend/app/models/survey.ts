import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import SurveyQuestion from '#models/survey_question'
import SurveyResponse from '#models/survey_response'

export default class Survey extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare type: 'pulse' | 'enps' | 'climate' | 'satisfaction' | 'custom'

  @column()
  declare status: 'draft' | 'active' | 'closed' | 'archived'

  @column()
  declare isAnonymous: boolean

  @column.date()
  declare startDate: DateTime | null

  @column.date()
  declare endDate: DateTime | null

  @column({
    prepare: (value: number[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return null
      if (typeof value === 'string') return JSON.parse(value)
      return value
    },
  })
  declare targetDepartments: number[] | null

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => SurveyQuestion, { foreignKey: 'surveyId' })
  declare questions: HasMany<typeof SurveyQuestion>

  @hasMany(() => SurveyResponse, { foreignKey: 'surveyId' })
  declare responses: HasMany<typeof SurveyResponse>
}

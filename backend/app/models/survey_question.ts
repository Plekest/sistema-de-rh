import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Survey from '#models/survey'

export default class SurveyQuestion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare surveyId: number

  @column()
  declare text: string

  @column()
  declare type: 'scale' | 'multiple_choice' | 'text' | 'yes_no' | 'enps'

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare options: string[] | null

  @column()
  declare order: number

  @column()
  declare isRequired: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Survey, { foreignKey: 'surveyId' })
  declare survey: BelongsTo<typeof Survey>
}

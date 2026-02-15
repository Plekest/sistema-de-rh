import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import OnboardingTemplate from '#models/onboarding_template'

export default class OnboardingTemplateItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare templateId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare category: string | null

  @column()
  declare dueDays: number

  @column()
  declare isRequired: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => OnboardingTemplate)
  declare template: BelongsTo<typeof OnboardingTemplate>
}

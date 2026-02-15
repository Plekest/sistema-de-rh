import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ChecklistTemplate from '#models/checklist_template'

export default class ChecklistTemplateItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare templateId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare responsibleRole: 'hr' | 'manager' | 'it' | 'employee' | 'other'

  @column()
  declare order: number

  @column()
  declare dueDays: number | null

  @column()
  declare isRequired: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => ChecklistTemplate, { foreignKey: 'templateId' })
  declare template: BelongsTo<typeof ChecklistTemplate>
}

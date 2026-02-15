import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import EmployeeChecklist from '#models/employee_checklist'
import ChecklistTemplateItem from '#models/checklist_template_item'
import User from '#models/user'

export default class EmployeeChecklistItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare checklistId: number

  @column()
  declare templateItemId: number | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare responsibleRole: 'hr' | 'manager' | 'it' | 'employee' | 'other'

  @column()
  declare completedBy: number | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.date()
  declare dueDate: DateTime | null

  @column()
  declare notes: string | null

  @column()
  declare status: 'pending' | 'completed' | 'skipped'

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => EmployeeChecklist, { foreignKey: 'checklistId' })
  declare checklist: BelongsTo<typeof EmployeeChecklist>

  @belongsTo(() => ChecklistTemplateItem, { foreignKey: 'templateItemId' })
  declare templateItem: BelongsTo<typeof ChecklistTemplateItem>

  @belongsTo(() => User, { foreignKey: 'completedBy' })
  declare completedByUser: BelongsTo<typeof User>
}

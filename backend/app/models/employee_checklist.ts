import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import ChecklistTemplate from '#models/checklist_template'
import User from '#models/user'
import EmployeeChecklistItem from '#models/employee_checklist_item'

export default class EmployeeChecklist extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare templateId: number | null

  @column()
  declare type: 'onboarding' | 'offboarding'

  @column()
  declare status: 'pending' | 'in_progress' | 'completed' | 'cancelled'

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => ChecklistTemplate, { foreignKey: 'templateId' })
  declare template: BelongsTo<typeof ChecklistTemplate>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => EmployeeChecklistItem, { foreignKey: 'checklistId' })
  declare items: HasMany<typeof EmployeeChecklistItem>
}

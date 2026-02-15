import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import Skill from '#models/skill'
import User from '#models/user'

export default class EmployeeSkill extends BaseModel {
  static table = 'employee_skills'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare skillId: number

  @column()
  declare currentLevel: number

  @column()
  declare targetLevel: number | null

  @column()
  declare assessedBy: number | null

  @column.dateTime()
  declare assessedAt: DateTime | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => Skill, { foreignKey: 'skillId' })
  declare skill: BelongsTo<typeof Skill>

  @belongsTo(() => User, { foreignKey: 'assessedBy' })
  declare assessor: BelongsTo<typeof User>
}

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import SkillCategory from '#models/skill_category'
import EmployeeSkill from '#models/employee_skill'

export default class Skill extends BaseModel {
  static table = 'skills'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: any) => {
      if (typeof value === 'string') return JSON.parse(value)
      return value
    },
  })
  declare levelDescriptors: Record<string, any> | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => SkillCategory, { foreignKey: 'categoryId' })
  declare category: BelongsTo<typeof SkillCategory>

  @hasMany(() => EmployeeSkill, { foreignKey: 'skillId' })
  declare employeeSkills: HasMany<typeof EmployeeSkill>
}

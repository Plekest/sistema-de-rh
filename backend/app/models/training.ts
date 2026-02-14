import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TrainingEnrollment from '#models/training_enrollment'

export default class Training extends BaseModel {
  static table = 'trainings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare type: 'online' | 'presential' | 'hybrid'

  @column()
  declare category: string | null

  @column()
  declare instructor: string | null

  @column()
  declare provider: string | null

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare durationHours: number

  @column()
  declare maxParticipants: number | null

  @column()
  declare location: string | null

  @column()
  declare status: 'planned' | 'in_progress' | 'completed' | 'cancelled'

  @column()
  declare isMandatory: boolean

  @column()
  declare createdBy: number | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => TrainingEnrollment)
  declare enrollments: HasMany<typeof TrainingEnrollment>
}

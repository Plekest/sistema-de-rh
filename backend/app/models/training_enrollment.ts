import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Training from '#models/training'
import Employee from '#models/employee'

export default class TrainingEnrollment extends BaseModel {
  static table = 'training_enrollments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare trainingId: number

  @column()
  declare employeeId: number

  @column()
  declare status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

  @column.dateTime()
  declare enrolledAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare score: number | null

  @column()
  declare certificateUrl: string | null

  @column()
  declare feedback: string | null

  @column()
  declare feedbackRating: number | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Training)
  declare training: BelongsTo<typeof Training>

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}

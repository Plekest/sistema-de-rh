import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import User from '#models/user'

export default class OccupationalExam extends BaseModel {
  static table = 'occupational_exams'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare type: 'admission' | 'periodic' | 'dismissal' | 'return_to_work' | 'role_change'

  @column.date()
  declare examDate: DateTime

  @column.date()
  declare expiryDate: DateTime | null

  @column()
  declare result: 'fit' | 'unfit' | 'fit_with_restrictions'

  @column()
  declare restrictions: string | null

  @column()
  declare doctorName: string | null

  @column()
  declare crm: string | null

  @column()
  declare clinicName: string | null

  @column()
  declare asoDocumentPath: string | null

  @column()
  declare status: 'scheduled' | 'completed' | 'expired' | 'cancelled'

  @column()
  declare notes: string | null

  @column()
  declare createdBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>
}

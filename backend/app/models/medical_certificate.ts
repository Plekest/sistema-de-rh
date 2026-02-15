import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import Leave from '#models/leave'
import User from '#models/user'

export default class MedicalCertificate extends BaseModel {
  static table = 'medical_certificates'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare daysCount: number

  @column()
  declare cidCode: string | null

  @column()
  declare cidDescription: string | null

  @column()
  declare doctorName: string | null

  @column()
  declare crm: string | null

  @column()
  declare documentPath: string | null

  @column()
  declare leaveId: number | null

  @column()
  declare status: 'pending' | 'approved' | 'rejected'

  @column()
  declare approvedBy: number | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => Leave, { foreignKey: 'leaveId' })
  declare leave: BelongsTo<typeof Leave>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>
}

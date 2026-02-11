import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import User from '#models/user'
import LeaveBalance from '#models/leave_balance'

export default class Leave extends BaseModel {
  static table = 'leaves'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare leaveBalanceId: number | null

  @column()
  declare type: 'vacation' | 'medical' | 'maternity' | 'paternity' | 'bereavement' | 'wedding' | 'blood_donation' | 'military' | 'other'

  @column()
  declare status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_progress' | 'completed'

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare daysCount: number

  @column()
  declare isPaid: boolean

  @column()
  declare sellDays: number

  @column()
  declare notes: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare requestedBy: number | null

  @column()
  declare approvedBy: number | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => LeaveBalance)
  declare leaveBalance: BelongsTo<typeof LeaveBalance>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  declare approver: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'requestedBy' })
  declare requester: BelongsTo<typeof User>
}

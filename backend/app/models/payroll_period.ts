import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import PayrollEntry from '#models/payroll_entry'
import PaySlip from '#models/pay_slip'

export default class PayrollPeriod extends BaseModel {
  static table = 'payroll_periods'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare referenceMonth: number

  @column()
  declare referenceYear: number

  @column()
  declare status: 'open' | 'calculating' | 'closed'

  @column()
  declare closedBy: number | null

  @column.dateTime()
  declare closedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'closedBy' })
  declare closer: BelongsTo<typeof User>

  @hasMany(() => PayrollEntry)
  declare entries: HasMany<typeof PayrollEntry>

  @hasMany(() => PaySlip)
  declare slips: HasMany<typeof PaySlip>
}

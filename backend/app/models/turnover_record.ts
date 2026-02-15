import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import Department from '#models/department'
import Position from '#models/position'

export default class TurnoverRecord extends BaseModel {
  static table = 'turnover_records'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare employeeId: number

  @column()
  declare type: 'voluntary' | 'involuntary' | 'retirement' | 'end_of_contract'

  @column()
  declare reason: string | null

  @column.date()
  declare exitDate: DateTime

  @column()
  declare departmentId: number | null

  @column()
  declare positionId: number | null

  @column()
  declare tenureMonths: number | null

  @column({
    consume: (value: any) => (value ? Number(value) : null),
  })
  declare salaryAtExit: number | null

  @column()
  declare exitInterviewDone: boolean

  @column()
  declare exitInterviewNotes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => Department)
  declare department: BelongsTo<typeof Department>

  @belongsTo(() => Position)
  declare position: BelongsTo<typeof Position>
}

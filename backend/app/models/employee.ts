import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import Document from '#models/document'
import TimeEntry from '#models/time_entry'
import EmployeeHistory from '#models/employee_history'

export default class Employee extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare registrationNumber: string | null

  @column()
  declare fullName: string

  @column()
  declare cpf: string | null

  @column()
  declare cnpj: string | null

  @column()
  declare rg: string | null

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare type: 'clt' | 'pj'

  @column()
  declare departmentId: number | null

  @column()
  declare positionId: number | null

  @column.date()
  declare hireDate: DateTime

  @column.date()
  declare terminationDate: DateTime | null

  @column()
  declare salary: number | null

  @column()
  declare status: 'active' | 'inactive' | 'terminated'

  @column.date()
  declare birthDate: DateTime | null

  @column()
  declare addressStreet: string | null

  @column()
  declare addressNumber: string | null

  @column()
  declare addressComplement: string | null

  @column()
  declare addressNeighborhood: string | null

  @column()
  declare addressCity: string | null

  @column()
  declare addressState: string | null

  @column()
  declare addressZip: string | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Department)
  declare department: BelongsTo<typeof Department>

  @belongsTo(() => Position)
  declare position: BelongsTo<typeof Position>

  @hasMany(() => Document)
  declare documents: HasMany<typeof Document>

  @hasMany(() => TimeEntry)
  declare timeEntries: HasMany<typeof TimeEntry>

  @hasMany(() => EmployeeHistory)
  declare histories: HasMany<typeof EmployeeHistory>
}

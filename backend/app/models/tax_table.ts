import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TaxTable extends BaseModel {
  static table = 'tax_tables'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: 'inss' | 'irrf'

  @column()
  declare bracketMin: number

  @column()
  declare bracketMax: number | null

  @column()
  declare rate: number

  @column()
  declare deductionValue: number

  @column.date()
  declare effectiveFrom: DateTime

  @column.date()
  declare effectiveUntil: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}

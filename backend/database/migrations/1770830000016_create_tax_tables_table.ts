import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tax_tables'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.enum('type', ['inss', 'irrf']).notNullable()
      table.decimal('bracket_min', 12, 2).notNullable()
      table.decimal('bracket_max', 12, 2).notNullable()
      table.decimal('rate', 6, 4).notNullable()
      table.decimal('deduction_value', 12, 2).notNullable().defaultTo(0)
      table.date('effective_from').notNullable()
      table.date('effective_until').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['type', 'effective_from'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'hours_bank'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('employee_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table.integer('reference_month').notNullable()
      table.integer('reference_year').notNullable()
      table.integer('expected_minutes').notNullable().defaultTo(0)
      table.integer('worked_minutes').notNullable().defaultTo(0)
      table.integer('balance_minutes').notNullable().defaultTo(0)
      table.integer('accumulated_balance_minutes').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['employee_id', 'reference_month', 'reference_year'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

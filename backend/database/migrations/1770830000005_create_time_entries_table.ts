import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'time_entries'

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
      table.date('date').notNullable()
      table.timestamp('clock_in').nullable()
      table.timestamp('clock_out').nullable()
      table.timestamp('lunch_start').nullable()
      table.timestamp('lunch_end').nullable()
      table.integer('total_worked_minutes').notNullable().defaultTo(0)
      table
        .enum('type', ['regular', 'overtime', 'absence', 'holiday'])
        .notNullable()
        .defaultTo('regular')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['employee_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

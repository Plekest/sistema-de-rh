import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'development_plans'

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
      table
        .integer('cycle_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('performance_cycles')
        .onDelete('SET NULL')
      table.string('action', 300).notNullable()
      table.text('description').nullable()
      table
        .integer('responsible_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL')
      table.date('deadline').nullable()
      table
        .enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])
        .notNullable()
        .defaultTo('pending')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.index(['cycle_id'])
      table.index(['responsible_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

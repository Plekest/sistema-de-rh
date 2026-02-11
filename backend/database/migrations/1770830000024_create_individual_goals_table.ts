import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'individual_goals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('cycle_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('performance_cycles')
        .onDelete('CASCADE')
      table
        .integer('employee_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table.string('title', 300).notNullable()
      table.text('description').nullable()
      table.decimal('weight', 5, 2).notNullable().defaultTo(1.0)
      table.string('target_value', 200).nullable()
      table.string('achieved_value', 200).nullable()
      table
        .enum('status', ['pending', 'in_progress', 'achieved', 'not_achieved'])
        .notNullable()
        .defaultTo('pending')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['cycle_id'])
      table.index(['employee_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

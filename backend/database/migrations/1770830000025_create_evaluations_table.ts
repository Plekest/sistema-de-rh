import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'evaluations'

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
      table
        .integer('evaluator_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL')
      table.enum('type', ['self', 'manager']).notNullable()
      table
        .enum('status', ['pending', 'in_progress', 'completed'])
        .notNullable()
        .defaultTo('pending')
      table.decimal('overall_score', 3, 2).nullable()
      table.text('comments').nullable()
      table.timestamp('completed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['cycle_id', 'employee_id', 'type'])
      table.index(['cycle_id'])
      table.index(['employee_id'])
      table.index(['evaluator_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

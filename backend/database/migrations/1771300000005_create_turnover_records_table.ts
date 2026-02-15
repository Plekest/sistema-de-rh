import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'turnover_records'

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
        .enum('type', ['voluntary', 'involuntary', 'retirement', 'end_of_contract'])
        .notNullable()
      table.string('reason', 500).nullable()
      table.date('exit_date').notNullable()
      table
        .integer('department_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('departments')
        .onDelete('SET NULL')
      table
        .integer('position_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('positions')
        .onDelete('SET NULL')
      table.integer('tenure_months').nullable()
      table.decimal('salary_at_exit', 12, 2).nullable()
      table.boolean('exit_interview_done').notNullable().defaultTo(false)
      table.text('exit_interview_notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['exit_date'])
      table.index(['department_id'])
      table.index(['type'])
      table.index(['employee_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

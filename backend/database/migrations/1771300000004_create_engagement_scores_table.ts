import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'engagement_scores'

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
      table.decimal('score', 5, 2).notNullable()
      table.decimal('attendance_score', 5, 2).nullable()
      table.decimal('performance_score', 5, 2).nullable()
      table.decimal('training_score', 5, 2).nullable()
      table.decimal('tenure_score', 5, 2).nullable()
      table.decimal('leave_score', 5, 2).nullable()
      table.integer('reference_month').notNullable()
      table.integer('reference_year').notNullable()
      table.timestamp('calculated_at').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['employee_id', 'reference_month', 'reference_year'])
      table.index(['employee_id', 'reference_year', 'reference_month'])
      table.index(['score'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

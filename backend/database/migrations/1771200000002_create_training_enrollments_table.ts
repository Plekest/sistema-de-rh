import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'training_enrollments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('training_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('trainings')
        .onDelete('CASCADE')
      table
        .integer('employee_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table
        .enum('status', ['enrolled', 'in_progress', 'completed', 'cancelled', 'no_show'])
        .notNullable()
        .defaultTo('enrolled')
      table.timestamp('enrolled_at').notNullable().defaultTo(this.now())
      table.timestamp('completed_at').nullable()
      table.decimal('score', 5, 2).nullable()
      table.string('certificate_url', 500).nullable()
      table.text('feedback').nullable()
      table.integer('feedback_rating').nullable()
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['training_id', 'employee_id'])
      table.index(['training_id'])
      table.index(['employee_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

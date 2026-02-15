import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_checklists'

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
        .integer('template_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('checklist_templates')
        .onDelete('SET NULL')
      table.enum('type', ['onboarding', 'offboarding']).notNullable()
      table
        .enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])
        .notNullable()
        .defaultTo('pending')
      table.timestamp('started_at').nullable()
      table.timestamp('completed_at').nullable()
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

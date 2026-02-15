import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_skills'

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
        .integer('skill_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('skills')
        .onDelete('CASCADE')
      table.integer('current_level').notNullable().checkBetween([1, 5])
      table.integer('target_level').nullable().checkBetween([1, 5])
      table
        .integer('assessed_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('assessed_at').nullable()
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['employee_id', 'skill_id'])
      table.index(['employee_id'])
      table.index(['skill_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

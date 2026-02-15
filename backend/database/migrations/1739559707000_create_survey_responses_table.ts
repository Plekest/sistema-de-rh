import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'survey_responses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('survey_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('surveys')
        .onDelete('CASCADE')
      table
        .integer('employee_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL')
      table.timestamp('submitted_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['survey_id', 'employee_id'])
      table.index(['survey_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'survey_questions'

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
      table.text('text').notNullable()
      table
        .enum('type', ['scale', 'multiple_choice', 'text', 'yes_no', 'enps'])
        .notNullable()
      table.jsonb('options').nullable()
      table.integer('order').notNullable().defaultTo(0)
      table.boolean('is_required').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['survey_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

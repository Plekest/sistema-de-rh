import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'survey_answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('response_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('survey_responses')
        .onDelete('CASCADE')
      table
        .integer('question_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('survey_questions')
        .onDelete('CASCADE')
      table.text('value').nullable()
      table.integer('numeric_value').nullable()
      table.timestamp('created_at').notNullable()

      table.unique(['response_id', 'question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

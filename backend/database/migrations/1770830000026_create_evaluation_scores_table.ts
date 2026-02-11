import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'evaluation_scores'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('evaluation_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('evaluations')
        .onDelete('CASCADE')
      table
        .integer('competency_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('competencies')
        .onDelete('CASCADE')
      table.integer('score').notNullable()
      table.text('comments').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['evaluation_id', 'competency_id'])
      table.index(['evaluation_id'])
      table.index(['competency_id'])

      table.check('?? >= 1 AND ?? <= 5', ['score', 'score'], 'chk_score_range')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

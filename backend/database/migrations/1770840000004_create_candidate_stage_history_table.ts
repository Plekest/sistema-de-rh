import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'candidate_stage_history'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('candidate_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('candidates')
        .onDelete('CASCADE')
      table
        .integer('stage_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('recruitment_stages')
        .onDelete('CASCADE')
      table
        .integer('moved_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.text('feedback').nullable()
      table.integer('score').nullable().checkBetween([1, 5])
      table.timestamp('entered_at').notNullable()
      table.timestamp('left_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['candidate_id'])
      table.index(['stage_id'])
      table.index(['entered_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

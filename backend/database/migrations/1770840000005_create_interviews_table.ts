import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'interviews'

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
        .integer('interviewer_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table
        .integer('stage_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('recruitment_stages')
        .onDelete('CASCADE')
      table.timestamp('scheduled_at').notNullable()
      table.integer('duration_minutes').notNullable().defaultTo(60)
      table.string('location', 300).nullable()
      table.string('meeting_link', 500).nullable()
      table
        .enum('status', ['scheduled', 'completed', 'cancelled', 'no_show'])
        .notNullable()
        .defaultTo('scheduled')
      table.text('feedback').nullable()
      table.integer('score').nullable().checkBetween([1, 5])
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['candidate_id'])
      table.index(['interviewer_id'])
      table.index(['scheduled_at'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

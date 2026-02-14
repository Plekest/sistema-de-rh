import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .enum('type', [
          'leave_approved',
          'leave_rejected',
          'document_uploaded',
          'salary_changed',
          'general',
        ])
        .notNullable()
      table.string('title', 255).notNullable()
      table.text('message').notNullable()
      table.boolean('is_read').defaultTo(false).notNullable()
      table.timestamp('read_at').nullable()
      table.jsonb('metadata').nullable()

      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'is_read'])
      table.index('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
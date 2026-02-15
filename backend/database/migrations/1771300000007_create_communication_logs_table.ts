import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'communication_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('communication_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('automated_communications')
        .onDelete('SET NULL')
      table
        .integer('employee_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL')
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.text('message').notNullable()
      table.timestamp('sent_at').notNullable()
      table.enum('status', ['sent', 'read', 'failed']).notNullable().defaultTo('sent')
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'status'])
      table.index(['employee_id'])
      table.index(['sent_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'data_change_requests'

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
        .integer('requested_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('reviewed_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('field_name', 100).notNullable()
      table.text('old_value').nullable()
      table.text('new_value').notNullable()
      table.text('reason').nullable()
      table
        .enum('status', ['pending', 'approved', 'rejected'])
        .notNullable()
        .defaultTo('pending')
      table.text('review_notes').nullable()
      table.timestamp('reviewed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.index(['status'])
      table.index(['requested_by'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

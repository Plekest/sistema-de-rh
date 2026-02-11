import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_requisitions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', 300).notNullable()
      table
        .integer('department_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('departments')
        .onDelete('CASCADE')
      table
        .integer('position_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('positions')
        .onDelete('CASCADE')
      table
        .integer('requested_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .integer('approved_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.decimal('salary_range_min', 12, 2).nullable()
      table.decimal('salary_range_max', 12, 2).nullable()
      table.enum('employment_type', ['clt', 'pj']).notNullable()
      table.enum('work_model', ['onsite', 'hybrid', 'remote']).notNullable()
      table.integer('headcount').notNullable().defaultTo(1)
      table.text('description').nullable()
      table.text('requirements').nullable()
      table
        .enum('status', [
          'pending_approval',
          'approved',
          'open',
          'filled',
          'cancelled',
        ])
        .notNullable()
        .defaultTo('pending_approval')
      table.timestamp('approved_at').nullable()
      table.timestamp('closed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status'])
      table.index(['department_id'])
      table.index(['position_id'])
      table.index(['employment_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

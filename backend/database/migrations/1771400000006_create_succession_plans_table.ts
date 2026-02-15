import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'succession_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('position_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('positions')
        .onDelete('CASCADE')
      table
        .integer('current_holder_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL')
      table
        .integer('successor_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('employees')
        .onDelete('SET NULL')
      table
        .enum('readiness', ['ready_now', 'ready_1_year', 'ready_2_years', 'development_needed'])
        .notNullable()
      table.enum('priority', ['critical', 'high', 'medium', 'low']).notNullable()
      table.text('development_actions').nullable()
      table.text('notes').nullable()
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['position_id'])
      table.index(['successor_id'])
      table.index(['readiness'])
      table.index(['priority'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

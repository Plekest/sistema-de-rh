import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'automated_communications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 255).notNullable()
      table
        .enum('trigger_type', [
          'birthday',
          'work_anniversary',
          'document_expiring',
          'probation_ending',
          'leave_returning',
          'onboarding_incomplete',
          'custom',
        ])
        .notNullable()
      table.integer('trigger_days_before').notNullable().defaultTo(0)
      table.text('message_template').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.jsonb('target_roles').nullable()
      table.timestamp('last_executed_at').nullable()
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['trigger_type'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

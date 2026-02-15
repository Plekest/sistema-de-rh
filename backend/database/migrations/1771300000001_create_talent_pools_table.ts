import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'talent_pools'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('candidate_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('candidates')
        .onDelete('SET NULL')
      table.string('full_name', 255).notNullable()
      table.string('email', 255).notNullable()
      table.string('phone', 20).nullable()
      table.string('linkedin_url', 500).nullable()
      table.string('resume_url', 500).nullable()
      table
        .enum('source', [
          'recruitment',
          'referral',
          'spontaneous',
          'linkedin',
          'event',
          'other',
        ])
        .notNullable()
        .defaultTo('spontaneous')
      table
        .enum('status', ['active', 'contacted', 'interviewing', 'hired', 'archived'])
        .notNullable()
        .defaultTo('active')
      table.text('notes').nullable()
      table.integer('experience_years').nullable()
      table.decimal('salary_expectation', 12, 2).nullable()
      table
        .enum('availability', ['immediate', '15_days', '30_days', '60_days', 'unavailable'])
        .nullable()
      table
        .integer('added_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status'])
      table.index(['source'])
      table.index(['email'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

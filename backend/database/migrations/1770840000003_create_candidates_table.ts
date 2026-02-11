import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'candidates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('job_requisition_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('job_requisitions')
        .onDelete('CASCADE')
      table.string('name', 200).notNullable()
      table.string('email', 200).notNullable()
      table.string('phone', 30).nullable()
      table.string('linkedin_url', 500).nullable()
      table.decimal('salary_expectation', 12, 2).nullable()
      table.string('resume_path', 500).nullable()
      table
        .enum('source', ['referral', 'linkedin', 'website', 'agency', 'other'])
        .notNullable()
        .defaultTo('other')
      table
        .integer('current_stage_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('recruitment_stages')
        .onDelete('SET NULL')
      table
        .enum('status', ['active', 'hired', 'rejected', 'withdrawn'])
        .notNullable()
        .defaultTo('active')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['job_requisition_id'])
      table.index(['status'])
      table.index(['current_stage_id'])
      table.index(['email'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

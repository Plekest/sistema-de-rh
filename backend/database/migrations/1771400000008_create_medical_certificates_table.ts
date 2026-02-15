import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medical_certificates'

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
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.integer('days_count').notNullable()
      table.string('cid_code', 10).nullable()
      table.string('cid_description', 500).nullable()
      table.string('doctor_name', 255).nullable()
      table.string('crm', 50).nullable()
      table.string('document_path', 500).nullable()
      table
        .integer('leave_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('leaves')
        .onDelete('SET NULL')
      table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending')
      table
        .integer('approved_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.index(['start_date'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

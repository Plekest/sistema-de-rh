import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'occupational_exams'

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
        .enum('type', ['admission', 'periodic', 'dismissal', 'return_to_work', 'role_change'])
        .notNullable()
      table.date('exam_date').notNullable()
      table.date('expiry_date').nullable()
      table.enum('result', ['fit', 'unfit', 'fit_with_restrictions']).notNullable()
      table.text('restrictions').nullable()
      table.string('doctor_name', 255).nullable()
      table.string('crm', 50).nullable()
      table.string('clinic_name', 255).nullable()
      table.string('aso_document_path', 500).nullable()
      table
        .enum('status', ['scheduled', 'completed', 'expired', 'cancelled'])
        .notNullable()
        .defaultTo('scheduled')
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

      table.index(['employee_id'])
      table.index(['type'])
      table.index(['status'])
      table.index(['expiry_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

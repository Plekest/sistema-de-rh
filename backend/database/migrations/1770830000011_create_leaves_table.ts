import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leaves'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE')
      table.integer('leave_balance_id').unsigned().nullable().references('id').inTable('leave_balances').onDelete('SET NULL')
      table
        .enum('type', [
          'vacation',
          'medical',
          'maternity',
          'paternity',
          'bereavement',
          'wedding',
          'blood_donation',
          'military',
          'other',
        ])
        .notNullable()
      table
        .enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'in_progress', 'completed'])
        .notNullable()
        .defaultTo('pending')
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.integer('days_count').notNullable()
      table.boolean('is_paid').notNullable().defaultTo(true)
      table.integer('sell_days').notNullable().defaultTo(0)
      table.text('notes').nullable()
      table.text('rejection_reason').nullable()
      table.integer('requested_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.integer('approved_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('approved_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.index(['status'])
      table.index(['start_date', 'end_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leave_balances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE')
      table.date('accrual_start_date').notNullable()
      table.date('accrual_end_date').notNullable()
      table.integer('total_days').notNullable().defaultTo(30)
      table.integer('used_days').notNullable().defaultTo(0)
      table.integer('sold_days').notNullable().defaultTo(0)
      table.integer('remaining_days').notNullable().defaultTo(30)
      table
        .enum('status', ['accruing', 'available', 'partially_used', 'used', 'expired'])
        .notNullable()
        .defaultTo('accruing')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.unique(['employee_id', 'accrual_start_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pay_slips'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('payroll_period_id').unsigned().notNullable().references('id').inTable('payroll_periods').onDelete('CASCADE')
      table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE')
      table.decimal('gross_salary', 12, 2).notNullable()
      table.decimal('total_earnings', 12, 2).notNullable()
      table.decimal('total_deductions', 12, 2).notNullable()
      table.decimal('net_salary', 12, 2).notNullable()
      table.decimal('inss_amount', 12, 2).notNullable().defaultTo(0)
      table.decimal('irrf_amount', 12, 2).notNullable().defaultTo(0)
      table.decimal('fgts_amount', 12, 2).notNullable().defaultTo(0)
      table.jsonb('details').nullable()
      table.enum('status', ['draft', 'final']).notNullable().defaultTo('draft')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['payroll_period_id', 'employee_id'])
      table.index(['employee_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payroll_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('payroll_period_id').unsigned().notNullable().references('id').inTable('payroll_periods').onDelete('CASCADE')
      table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE')
      table.enum('component_type', ['earning', 'deduction']).notNullable()
      table.enum('code', [
        'base_salary',
        'overtime_50',
        'overtime_100',
        'night_shift',
        'bonus',
        'commission',
        'fixed_bonus',
        'hazard_pay',
        'unhealthy_pay',
        'inss',
        'irrf',
        'fgts',
        'vt_discount',
        'benefit_discount',
        'absence',
        'advance',
        'other',
      ]).notNullable()
      table.string('description', 200).notNullable()
      table.decimal('reference_value', 12, 2).nullable()
      table.decimal('quantity', 10, 4).nullable()
      table.decimal('amount', 12, 2).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['payroll_period_id'])
      table.index(['employee_id'])
      table.index(['payroll_period_id', 'employee_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

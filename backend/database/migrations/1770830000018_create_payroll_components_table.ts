import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payroll_components'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE')
      table.enum('type', ['base_salary', 'fixed_bonus', 'hazard_pay', 'unhealthy_pay', 'other']).notNullable()
      table.string('description', 200).notNullable()
      table.decimal('amount', 12, 2).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.date('effective_from').notNullable()
      table.date('effective_until').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.index(['employee_id', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

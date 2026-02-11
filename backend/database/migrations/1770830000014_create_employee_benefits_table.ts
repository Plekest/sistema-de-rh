import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_benefits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().notNullable().references('id').inTable('employees').onDelete('CASCADE')
      table.integer('benefit_plan_id').unsigned().notNullable().references('id').inTable('benefit_plans').onDelete('CASCADE')
      table.date('enrollment_date').notNullable()
      table.date('cancellation_date').nullable()
      table
        .enum('status', ['active', 'cancelled', 'suspended'])
        .notNullable()
        .defaultTo('active')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_id'])
      table.index(['benefit_plan_id'])
      table.unique(['employee_id', 'benefit_plan_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

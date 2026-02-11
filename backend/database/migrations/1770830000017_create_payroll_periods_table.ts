import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payroll_periods'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('reference_month').notNullable()
      table.integer('reference_year').notNullable()
      table.enum('status', ['open', 'calculating', 'closed']).notNullable().defaultTo('open')
      table.integer('closed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('closed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['reference_month', 'reference_year'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

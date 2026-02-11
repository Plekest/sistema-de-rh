import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'performance_cycles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 200).notNullable()
      table.enum('type', ['semestral', 'anual']).notNullable()
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.date('self_eval_deadline').notNullable()
      table.date('manager_eval_deadline').notNullable()
      table
        .enum('status', ['draft', 'self_eval', 'manager_eval', 'calibration', 'closed'])
        .notNullable()
        .defaultTo('draft')
      table.integer('created_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status'])
      table.index(['start_date', 'end_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

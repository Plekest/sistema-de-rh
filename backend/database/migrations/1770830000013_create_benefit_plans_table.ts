import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'benefit_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('benefit_id').unsigned().notNullable().references('id').inTable('benefits').onDelete('CASCADE')
      table.string('name', 100).notNullable()
      table.decimal('monthly_value', 10, 2).notNullable()
      table.decimal('employee_discount_value', 10, 2).nullable()
      table.decimal('employee_discount_percentage', 5, 2).nullable()
      table.jsonb('eligibility_rules').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['benefit_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

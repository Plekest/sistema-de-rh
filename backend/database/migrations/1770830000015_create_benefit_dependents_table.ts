import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'benefit_dependents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_benefit_id').unsigned().notNullable().references('id').inTable('employee_benefits').onDelete('CASCADE')
      table.string('name', 200).notNullable()
      table.string('cpf', 14).nullable()
      table.date('birth_date').nullable()
      table
        .enum('relationship', ['spouse', 'child', 'parent', 'other'])
        .notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['employee_benefit_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

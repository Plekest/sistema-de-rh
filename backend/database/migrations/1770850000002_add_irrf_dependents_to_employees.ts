import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('irrf_dependents').notNullable().defaultTo(0).after('salary')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('irrf_dependents')
    })
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'time_entries'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_late').notNullable().defaultTo(false)
      table.integer('late_minutes').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_late')
      table.dropColumn('late_minutes')
    })
  }
}

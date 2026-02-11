import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .enum('role', ['admin', 'manager', 'employee'])
        .notNullable()
      table
        .enum('module', ['employees', 'attendance', 'hours_bank', 'documents', 'history'])
        .notNullable()
      table.boolean('can_access').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['role', 'module'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'document_templates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 300).notNullable()
      table.text('description').nullable()
      table
        .enum('type', ['contract', 'nda', 'declaration', 'letter', 'policy', 'other'])
        .notNullable()
      table.text('content').notNullable()
      table.jsonb('variables').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['type'])
      table.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

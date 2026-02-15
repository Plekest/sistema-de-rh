import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'surveys'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', 300).notNullable()
      table.text('description').nullable()
      table
        .enum('type', ['pulse', 'enps', 'climate', 'satisfaction', 'custom'])
        .notNullable()
      table
        .enum('status', ['draft', 'active', 'closed', 'archived'])
        .notNullable()
        .defaultTo('draft')
      table.boolean('is_anonymous').notNullable().defaultTo(true)
      table.date('start_date').nullable()
      table.date('end_date').nullable()
      table.jsonb('target_departments').nullable()
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

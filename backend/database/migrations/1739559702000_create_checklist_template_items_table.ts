import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'checklist_template_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('template_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('checklist_templates')
        .onDelete('CASCADE')
      table.string('title', 300).notNullable()
      table.text('description').nullable()
      table
        .enum('responsible_role', ['hr', 'manager', 'it', 'employee', 'other'])
        .notNullable()
      table.integer('order').notNullable().defaultTo(0)
      table.integer('due_days').nullable()
      table.boolean('is_required').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['template_id'], 'idx_template_items_template_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

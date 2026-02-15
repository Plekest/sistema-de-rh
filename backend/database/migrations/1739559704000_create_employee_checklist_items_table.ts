import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employee_checklist_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('checklist_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('employee_checklists')
        .onDelete('CASCADE')
      table
        .integer('template_item_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('checklist_template_items')
        .onDelete('SET NULL')
      table.string('title', 300).notNullable()
      table.text('description').nullable()
      table
        .enum('responsible_role', ['hr', 'manager', 'it', 'employee', 'other'])
        .notNullable()
      table
        .integer('completed_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('completed_at').nullable()
      table.date('due_date').nullable()
      table.text('notes').nullable()
      table.enum('status', ['pending', 'completed', 'skipped']).notNullable().defaultTo('pending')
      table.integer('order').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['checklist_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

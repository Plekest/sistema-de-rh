import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('employee_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('type').notNullable()
      table.string('file_name').notNullable()
      table.string('file_path').notNullable()
      table.integer('file_size').nullable()
      table.string('mime_type').nullable()
      table.text('notes').nullable()
      table.timestamp('uploaded_at').notNullable().defaultTo(this.now())
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

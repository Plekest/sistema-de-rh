import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'benefits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 100).notNullable()
      table
        .enum('type', [
          'vt',
          'vr',
          'va',
          'health',
          'dental',
          'life_insurance',
          'daycare',
          'gym',
          'other',
        ])
        .notNullable()
      table.text('description').nullable()
      table.string('provider', 200).nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

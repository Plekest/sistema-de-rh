import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'talent_pool_tag_pivot'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('talent_pool_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('talent_pools')
        .onDelete('CASCADE')
      table
        .integer('tag_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('talent_pool_tags')
        .onDelete('CASCADE')

      table.unique(['talent_pool_id', 'tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

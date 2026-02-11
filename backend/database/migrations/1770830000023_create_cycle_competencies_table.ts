import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cycle_competencies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('cycle_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('performance_cycles')
        .onDelete('CASCADE')
      table
        .integer('competency_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('competencies')
        .onDelete('CASCADE')
      table.decimal('weight', 5, 2).notNullable().defaultTo(1.0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['cycle_id', 'competency_id'])
      table.index(['cycle_id'])
      table.index(['competency_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

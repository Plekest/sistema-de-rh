import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'career_path_levels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('career_path_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('career_paths')
        .onDelete('CASCADE')
      table
        .integer('position_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('positions')
        .onDelete('SET NULL')
      table.integer('level_order').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.integer('min_experience_months').nullable()
      table.jsonb('required_skills').nullable()
      table.decimal('salary_range_min', 12, 2).nullable()
      table.decimal('salary_range_max', 12, 2).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['career_path_id'])
      table.index(['level_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

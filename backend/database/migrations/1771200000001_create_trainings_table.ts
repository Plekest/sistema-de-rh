import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trainings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.enum('type', ['online', 'presential', 'hybrid']).notNullable()
      table.string('category', 100).nullable()
      table.string('instructor', 255).nullable()
      table.string('provider', 255).nullable()
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.integer('duration_hours').notNullable()
      table.integer('max_participants').nullable()
      table.string('location', 255).nullable()
      table
        .enum('status', ['planned', 'in_progress', 'completed', 'cancelled'])
        .notNullable()
        .defaultTo('planned')
      table.boolean('is_mandatory').notNullable().defaultTo(false)
      table
        .integer('created_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status'])
      table.index(['type'])
      table.index(['category'])
      table.index(['start_date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

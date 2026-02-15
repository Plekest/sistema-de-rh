import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'analytics_snapshots'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .enum('type', [
          'monthly_summary',
          'department_health',
          'turnover_prediction',
          'engagement_trend',
        ])
        .notNullable()
      table.integer('reference_month').notNullable()
      table.integer('reference_year').notNullable()
      table.jsonb('data').notNullable()
      table.timestamp('generated_at').notNullable()
      table.timestamp('created_at').notNullable()

      table.unique(['type', 'reference_month', 'reference_year'])
      table.index(['type'])
      table.index(['reference_year', 'reference_month'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

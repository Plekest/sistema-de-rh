import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'leave_configs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .enum('leave_type', [
          'vacation',
          'medical',
          'maternity',
          'paternity',
          'bereavement',
          'wedding',
          'blood_donation',
          'military',
          'other',
        ])
        .notNullable()
      table.string('label', 100).notNullable()
      table.integer('default_days').notNullable()
      table.boolean('requires_approval').notNullable().defaultTo(true)
      table.boolean('requires_document').notNullable().defaultTo(false)
      table.boolean('is_paid').notNullable().defaultTo(true)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['leave_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

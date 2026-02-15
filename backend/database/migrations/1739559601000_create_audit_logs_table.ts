import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .enum('action', [
          'create',
          'update',
          'delete',
          'login',
          'logout',
          'approve',
          'reject',
          'process',
          'export',
          'download',
        ])
        .notNullable()
      table.string('resource_type', 100).notNullable()
      table.integer('resource_id').nullable()
      table.text('description').notNullable()
      table.jsonb('old_values').nullable()
      table.jsonb('new_values').nullable()
      table.string('ip_address', 45).nullable()
      table.string('user_agent', 500).nullable()
      table.timestamp('created_at').notNullable()

      table.index(['user_id'])
      table.index(['action'])
      table.index(['resource_type', 'resource_id'])
      table.index(['created_at'], 'idx_audit_logs_created_at_desc', {
        storageEngineIndexType: 'btree',
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

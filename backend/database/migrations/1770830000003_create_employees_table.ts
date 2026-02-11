import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('registration_number').nullable().unique()
      table.string('full_name').notNullable()
      table.string('cpf').nullable().unique()
      table.string('cnpj').nullable().unique()
      table.string('rg').nullable()
      table.string('email').notNullable()
      table.string('phone').nullable()
      table.enum('type', ['clt', 'pj']).notNullable().defaultTo('clt')
      table
        .integer('department_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('departments')
        .onDelete('SET NULL')
      table
        .integer('position_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('positions')
        .onDelete('SET NULL')
      table.date('hire_date').notNullable()
      table.date('termination_date').nullable()
      table.decimal('salary', 10, 2).nullable()
      table.enum('status', ['active', 'inactive', 'terminated']).notNullable().defaultTo('active')
      table.date('birth_date').nullable()
      table.string('address_street').nullable()
      table.string('address_number').nullable()
      table.string('address_complement').nullable()
      table.string('address_neighborhood').nullable()
      table.string('address_city').nullable()
      table.string('address_state').nullable()
      table.string('address_zip').nullable()
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

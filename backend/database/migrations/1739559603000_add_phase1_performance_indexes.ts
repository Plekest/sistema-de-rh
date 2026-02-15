import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Índice para query de aniversariantes (Dashboard birthdays)
    this.schema.raw(`
      CREATE INDEX idx_employees_birth_date_month_day
      ON employees (EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date))
    `)

    // Índice para busca global de colaboradores
    this.schema.alterTable('employees', (table) => {
      table.index(['full_name'])
    })
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS idx_employees_birth_date_month_day')

    this.schema.alterTable('employees', (table) => {
      table.dropIndex(['full_name'])
    })
  }
}

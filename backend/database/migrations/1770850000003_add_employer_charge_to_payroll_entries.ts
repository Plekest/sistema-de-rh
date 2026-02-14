import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payroll_entries'

  async up() {
    // PostgreSQL: drop old check constraint and create new one with employer_charge
    this.schema.alterTable(this.tableName, (table) => {
      table.dropChecks('payroll_entries_component_type_check')
    })

    this.schema.raw(`
      ALTER TABLE "payroll_entries"
      ADD CONSTRAINT "payroll_entries_component_type_check"
      CHECK ("component_type" IN ('earning', 'deduction', 'employer_charge'))
    `)
  }

  async down() {
    // Revert: remove 'employer_charge' from constraint
    // First update any rows with 'employer_charge' to 'deduction'
    this.schema.raw(`
      UPDATE "payroll_entries" SET "component_type" = 'deduction'
      WHERE "component_type" = 'employer_charge'
    `)

    this.schema.alterTable(this.tableName, (table) => {
      table.dropChecks('payroll_entries_component_type_check')
    })

    this.schema.raw(`
      ALTER TABLE "payroll_entries"
      ADD CONSTRAINT "payroll_entries_component_type_check"
      CHECK ("component_type" IN ('earning', 'deduction'))
    `)
  }
}

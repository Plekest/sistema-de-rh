import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payroll_entries'

  async up() {
    // PostgreSQL enum alteration - add 'employer_charge' to component_type
    this.schema.raw(`
      ALTER TYPE "payroll_entries_component_type_check"
      RENAME TO "payroll_entries_component_type_check_old"
    `)

    this.schema.raw(`
      CREATE TYPE "payroll_entries_component_type_check"
      AS ENUM ('earning', 'deduction', 'employer_charge')
    `)

    this.schema.raw(`
      ALTER TABLE "payroll_entries"
      ALTER COLUMN "component_type"
      TYPE "payroll_entries_component_type_check"
      USING "component_type"::text::"payroll_entries_component_type_check"
    `)

    this.schema.raw(`
      DROP TYPE "payroll_entries_component_type_check_old"
    `)
  }

  async down() {
    // Revert: remove 'employer_charge' from enum
    // First update any rows with 'employer_charge' to 'deduction'
    this.schema.raw(`
      UPDATE "payroll_entries" SET "component_type" = 'deduction'
      WHERE "component_type" = 'employer_charge'
    `)

    this.schema.raw(`
      ALTER TYPE "payroll_entries_component_type_check"
      RENAME TO "payroll_entries_component_type_check_old"
    `)

    this.schema.raw(`
      CREATE TYPE "payroll_entries_component_type_check"
      AS ENUM ('earning', 'deduction')
    `)

    this.schema.raw(`
      ALTER TABLE "payroll_entries"
      ALTER COLUMN "component_type"
      TYPE "payroll_entries_component_type_check"
      USING "component_type"::text::"payroll_entries_component_type_check"
    `)

    this.schema.raw(`
      DROP TYPE "payroll_entries_component_type_check_old"
    `)
  }
}

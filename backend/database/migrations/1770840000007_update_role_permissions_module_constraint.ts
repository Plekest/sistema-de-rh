import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_permissions'

  async up() {
    // Drop the old ENUM constraint and recreate with all 10 modules
    this.schema.raw(`
      ALTER TABLE role_permissions
      DROP CONSTRAINT IF EXISTS role_permissions_module_check;

      ALTER TABLE role_permissions
      ADD CONSTRAINT role_permissions_module_check
      CHECK (module IN (
        'employees',
        'attendance',
        'hours_bank',
        'documents',
        'history',
        'leave',
        'benefits',
        'payroll',
        'performance',
        'recruitment'
      ));
    `)
  }

  async down() {
    // Restore original constraint with only 5 modules
    this.schema.raw(`
      ALTER TABLE role_permissions
      DROP CONSTRAINT IF EXISTS role_permissions_module_check;

      ALTER TABLE role_permissions
      ADD CONSTRAINT role_permissions_module_check
      CHECK (module IN (
        'employees',
        'attendance',
        'hours_bank',
        'documents',
        'history'
      ));
    `)
  }
}

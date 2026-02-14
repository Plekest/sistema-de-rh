import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_permissions'

  async up() {
    // Adiciona 'training' ao constraint de modulos
    await this.db.rawQuery(`
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
        'recruitment',
        'training'
      ));
    `)

    // Insere permissoes default para training
    await this.db.table(this.tableName).multiInsert([
      { role: 'admin', module: 'training', can_access: true, created_at: this.now() },
      { role: 'manager', module: 'training', can_access: true, created_at: this.now() },
      { role: 'employee', module: 'training', can_access: true, created_at: this.now() },
    ])
  }

  async down() {
    // Remove permissoes de training
    await this.db.table(this.tableName).where('module', 'training').delete()

    // Restaura constraint sem training
    await this.db.rawQuery(`
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
}

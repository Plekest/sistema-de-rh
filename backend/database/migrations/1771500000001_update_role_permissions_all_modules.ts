import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'role_permissions'

  async up() {
    // Atualizar CHECK constraint para incluir TODOS os módulos do sistema
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
        'recruitment',
        'training',
        'calendar',
        'onboarding',
        'surveys',
        'orgchart',
        'dashboard',
        'skills',
        'career',
        'health',
        'analytics'
      ));
    `)

    // Inserir permissões para os novos módulos
    const newModules = [
      'calendar',
      'onboarding',
      'surveys',
      'orgchart',
      'dashboard',
      'skills',
      'career',
      'health',
      'analytics',
    ]

    const roles = ['admin', 'manager', 'employee']

    // Configuração de acesso por role
    const accessConfig: Record<string, Record<string, boolean>> = {
      admin: {
        calendar: true,
        onboarding: true,
        surveys: true,
        orgchart: true,
        dashboard: true,
        skills: true,
        career: true,
        health: true,
        analytics: true,
      },
      manager: {
        calendar: true,
        onboarding: true,
        surveys: true,
        orgchart: true,
        dashboard: true,
        skills: true,
        career: true,
        health: true,
        analytics: false,
      },
      employee: {
        calendar: true,
        onboarding: true,
        surveys: true,
        orgchart: true,
        dashboard: true,
        skills: true,
        career: true,
        health: true,
        analytics: false,
      },
    }

    const now = new Date().toISOString()

    for (const role of roles) {
      for (const mod of newModules) {
        this.defer(async (db) => {
          const existing = await db
            .from('role_permissions')
            .where('role', role)
            .where('module', mod)
            .first()

          if (!existing) {
            await db.table('role_permissions').insert({
              role,
              module: mod,
              can_access: accessConfig[role][mod],
              created_at: now,
            })
          }
        })
      }
    }
  }

  async down() {
    const newModules = [
      'calendar',
      'onboarding',
      'surveys',
      'orgchart',
      'dashboard',
      'skills',
      'career',
      'health',
      'analytics',
    ]

    this.defer(async (db) => {
      await db.from('role_permissions').whereIn('module', newModules).delete()
    })

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
        'recruitment',
        'training'
      ));
    `)
  }
}

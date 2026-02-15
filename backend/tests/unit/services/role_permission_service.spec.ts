import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import RolePermissionService from '#services/role_permission_service'
import RolePermission from '#models/role_permission'

test.group('RolePermissionService', (group) => {
  let service: RolePermissionService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new RolePermissionService()
  })

  test('deve retornar permissoes padrao quando nao ha registros', async ({ assert }) => {
    // Limpar permissoes existentes
    await RolePermission.query().delete()

    const adminPerms = await service.getByRole('admin')

    assert.isDefined(adminPerms)
    assert.isTrue(adminPerms.employees)
    assert.isTrue(adminPerms.attendance)
    assert.isTrue(adminPerms.leave)
  })

  test('deve retornar permissoes do admin', async ({ assert }) => {
    const perms = await service.getByRole('admin')

    assert.isDefined(perms)
    assert.isObject(perms)
    assert.property(perms, 'employees')
    assert.property(perms, 'attendance')
    assert.property(perms, 'hours_bank')
  })

  test('deve retornar permissoes do manager', async ({ assert }) => {
    const perms = await service.getByRole('manager')

    assert.isDefined(perms)
    assert.isObject(perms)
    assert.property(perms, 'employees')
    assert.property(perms, 'payroll')
  })

  test('deve retornar permissoes do employee', async ({ assert }) => {
    const perms = await service.getByRole('employee')

    assert.isDefined(perms)
    assert.isObject(perms)

    // Employees nao tem acesso a alguns modulos
    assert.isFalse(perms.employees)
    assert.isFalse(perms.recruitment)

    // Mas tem acesso a outros
    assert.isTrue(perms.attendance)
    assert.isTrue(perms.documents)
  })

  test('deve retornar todas as permissoes agrupadas por role', async ({ assert }) => {
    const grouped = await service.getAll()

    assert.isDefined(grouped)
    assert.property(grouped, 'admin')
    assert.property(grouped, 'manager')
    assert.property(grouped, 'employee')

    assert.isObject(grouped.admin)
    assert.isObject(grouped.manager)
    assert.isObject(grouped.employee)
  })

  test('deve atualizar permissoes', async ({ assert }) => {
    const updates = [
      { role: 'employee' as const, module: 'employees' as const, canAccess: true },
      { role: 'employee' as const, module: 'recruitment' as const, canAccess: true },
    ]

    const result = await service.update(updates)

    assert.isDefined(result)
    assert.isTrue(result.employee.employees)
    assert.isTrue(result.employee.recruitment)
  })

  test('deve criar permissao se nao existir', async ({ assert }) => {
    // Limpar permissao especifica
    await RolePermission.query()
      .where('role', 'employee')
      .where('module', 'payroll')
      .delete()

    const updates = [
      { role: 'employee' as const, module: 'payroll' as const, canAccess: false },
    ]

    await service.update(updates)

    const perms = await service.getByRole('employee')
    assert.isFalse(perms.payroll)
  })

  test('deve sobrescrever permissao existente', async ({ assert }) => {
    // Criar permissao
    await RolePermission.updateOrCreate(
      { role: 'employee', module: 'leave' },
      { canAccess: false }
    )

    // Verificar que esta false
    let perms = await service.getByRole('employee')
    assert.isFalse(perms.leave)

    // Atualizar para true
    await service.update([
      { role: 'employee', module: 'leave', canAccess: true },
    ])

    // Verificar que esta true
    perms = await service.getByRole('employee')
    assert.isTrue(perms.leave)
  })

  test('deve atualizar multiplas permissoes de uma vez', async ({ assert }) => {
    const updates = [
      { role: 'manager' as const, module: 'employees' as const, canAccess: false },
      { role: 'manager' as const, module: 'payroll' as const, canAccess: false },
      { role: 'manager' as const, module: 'recruitment' as const, canAccess: false },
    ]

    await service.update(updates)

    const perms = await service.getByRole('manager')

    assert.isFalse(perms.employees)
    assert.isFalse(perms.payroll)
    assert.isFalse(perms.recruitment)
  })

  test('deve manter outras permissoes ao atualizar uma especifica', async ({ assert }) => {
    const beforeUpdate = await service.getByRole('admin')

    await service.update([
      { role: 'admin', module: 'documents', canAccess: false },
    ])

    const afterUpdate = await service.getByRole('admin')

    // documents mudou
    assert.notEqual(afterUpdate.documents, beforeUpdate.documents)

    // outras permissoes continuam iguais
    assert.equal(afterUpdate.employees, beforeUpdate.employees)
    assert.equal(afterUpdate.attendance, beforeUpdate.attendance)
  })

  test('deve retornar objeto de permissoes com todas as chaves', async ({ assert }) => {
    const perms = await service.getByRole('admin')

    const expectedKeys = [
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
    ]

    expectedKeys.forEach(key => {
      assert.property(perms, key)
      assert.isBoolean(perms[key as keyof typeof perms])
    })
  })

  test('deve aplicar defaults corretos para cada role', async ({ assert }) => {
    await RolePermission.query().delete()

    const adminPerms = await service.getByRole('admin')
    const managerPerms = await service.getByRole('manager')
    const employeePerms = await service.getByRole('employee')

    // Admin tem acesso a tudo
    assert.isTrue(adminPerms.employees)
    assert.isTrue(adminPerms.recruitment)

    // Manager tem acesso a tudo
    assert.isTrue(managerPerms.employees)
    assert.isTrue(managerPerms.payroll)

    // Employee tem acesso limitado
    assert.isFalse(employeePerms.employees)
    assert.isFalse(employeePerms.recruitment)
    assert.isTrue(employeePerms.attendance)
  })
})

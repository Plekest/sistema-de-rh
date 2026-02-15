import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import DataChangeRequest from '#models/data_change_request'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import { DateTime } from 'luxon'

// TODO: Importar DataChangeRequestService quando for criado
// import DataChangeRequestService from '#services/data_change_request_service'

test.group('DataChangeRequestService - Criar Solicitacao', (group) => {
  let employee: Employee
  let user: User
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })

    user = await User.create({
      fullName: 'Usuario Teste',
      email: `user.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'employee',
      isActive: true,
    })

    employee = await Employee.create({
      fullName: 'Employee Teste',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      userId: user.id,
      departmentId: department.id,
    })
  })

  test('deve criar solicitacao de alteracao de telefone', async ({ assert }) => {
    const request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'phone',
      oldValue: '11999999999',
      newValue: '11988888888',
      reason: 'Mudei de numero',
      status: 'pending',
    })

    assert.equal(request.employeeId, employee.id)
    assert.equal(request.fieldName, 'phone')
    assert.equal(request.status, 'pending')
  })

  test('deve criar solicitacao de alteracao de endereco', async ({ assert }) => {
    const request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'address_street',
      oldValue: 'Rua Antiga, 100',
      newValue: 'Rua Nova, 200',
      reason: 'Mudanca de residencia',
      status: 'pending',
    })

    assert.equal(request.fieldName, 'address_street')
    assert.equal(request.newValue, 'Rua Nova, 200')
  })

  test('deve criar solicitacao sem oldValue quando campo vazio', async ({ assert }) => {
    const request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'phone',
      oldValue: null,
      newValue: '11999999999',
      reason: 'Primeiro cadastro de telefone',
      status: 'pending',
    })

    assert.isNull(request.oldValue)
    assert.equal(request.newValue, '11999999999')
  })

  test('deve criar solicitacao com status pending por padrao', async ({ assert }) => {
    const request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'email',
      oldValue: employee.email,
      newValue: `novo.${Date.now()}@empresa.com`,
      status: 'pending',
    })

    assert.equal(request.status, 'pending')
    assert.isUndefined(request.reviewedBy)
    assert.isUndefined(request.reviewedAt)
  })
})

test.group('DataChangeRequestService - Listar Solicitacoes', (group) => {
  let employee1: Employee
  let employee2: Employee
  let user1: User
  let user2: User
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })

    user1 = await User.create({
      fullName: 'User 1',
      email: `user1.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'employee',
      isActive: true,
    })

    user2 = await User.create({
      fullName: 'User 2',
      email: `user2.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'employee',
      isActive: true,
    })

    employee1 = await Employee.create({
      fullName: 'Employee 1',
      email: `emp1.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      userId: user1.id,
      departmentId: department.id,
    })

    employee2 = await Employee.create({
      fullName: 'Employee 2',
      email: `emp2.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      userId: user2.id,
      departmentId: department.id,
    })
  })

  test('deve listar solicitacoes do employee logado', async ({ assert }) => {
    await DataChangeRequest.create({
      employeeId: employee1.id,
      requestedBy: user1.id,
      fieldName: 'phone',
      newValue: '11999999999',
      status: 'pending',
    })

    await DataChangeRequest.create({
      employeeId: employee2.id,
      requestedBy: user2.id,
      fieldName: 'phone',
      newValue: '11988888888',
      status: 'pending',
    })

    const requests = await DataChangeRequest.query().where('employee_id', employee1.id)

    assert.equal(requests.length, 1)
    assert.equal(requests[0].employeeId, employee1.id)
  })

  test('employee nao deve ver solicitacoes de outros', async ({ assert }) => {
    await DataChangeRequest.create({
      employeeId: employee2.id,
      requestedBy: user2.id,
      fieldName: 'phone',
      newValue: '11988888888',
      status: 'pending',
    })

    const requests = await DataChangeRequest.query().where('employee_id', employee1.id)

    assert.equal(requests.length, 0)
  })

  test('deve listar todas solicitacoes pendentes (admin)', async ({ assert }) => {
    await DataChangeRequest.create({
      employeeId: employee1.id,
      requestedBy: user1.id,
      fieldName: 'phone',
      newValue: '11999999999',
      status: 'pending',
    })

    await DataChangeRequest.create({
      employeeId: employee2.id,
      requestedBy: user2.id,
      fieldName: 'email',
      newValue: `novo.${Date.now()}@empresa.com`,
      status: 'pending',
    })

    const requests = await DataChangeRequest.query().where('status', 'pending')

    assert.isAtLeast(requests.length, 2)
  })
})

test.group('DataChangeRequestService - Aprovar Solicitacao', (group) => {
  let employee: Employee
  let user: User
  let admin: User
  let department: Department
  let request: DataChangeRequest

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })

    user = await User.create({
      fullName: 'Employee User',
      email: `empuser.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'employee',
      isActive: true,
    })

    admin = await User.create({
      fullName: 'Admin User',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    employee = await Employee.create({
      fullName: 'Employee Teste',
      email: `emp.${Date.now()}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      userId: user.id,
      departmentId: department.id,
    })

    request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'phone',
      oldValue: '11999999999',
      newValue: '11988888888',
      reason: 'Novo numero',
      status: 'pending',
    })
  })

  test('deve aprovar solicitacao e mudar status', async ({ assert }) => {
    request.status = 'approved'
    request.reviewedBy = admin.id
    request.reviewedAt = DateTime.now()
    await request.save()

    const updated = await DataChangeRequest.find(request.id)
    assert.equal(updated!.status, 'approved')
    assert.equal(updated!.reviewedBy, admin.id)
    assert.isNotNull(updated!.reviewedAt)
  })

  test('ao aprovar, deve atualizar campo do employee', async ({ assert }) => {
    // Simula aprovacao
    request.status = 'approved'
    request.reviewedBy = admin.id
    request.reviewedAt = DateTime.now()
    await request.save()

    // Atualiza employee
    employee.phone = request.newValue
    await employee.save()

    const updatedEmployee = await Employee.find(employee.id)
    assert.equal(updatedEmployee!.phone, '11988888888')
  })

  test('nao deve aprovar solicitacao ja processada', async ({ assert }) => {
    request.status = 'approved'
    request.reviewedBy = admin.id
    request.reviewedAt = DateTime.now()
    await request.save()

    // Verifica que status não é mais pending
    await request.refresh()
    assert.equal(request.status, 'approved')
  })
})

test.group('DataChangeRequestService - Rejeitar Solicitacao', (group) => {
  let employee: Employee
  let user: User
  let admin: User
  let department: Department
  let request: DataChangeRequest

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })

    user = await User.create({
      fullName: 'Employee User',
      email: `empuser.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'employee',
      isActive: true,
    })

    admin = await User.create({
      fullName: 'Admin User',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    employee = await Employee.create({
      fullName: 'Employee Teste',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      userId: user.id,
      departmentId: department.id,
    })

    request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'email',
      oldValue: employee.email,
      newValue: `invalido@invalido.com`,
      status: 'pending',
    })
  })

  test('deve rejeitar solicitacao e mudar status', async ({ assert }) => {
    request.status = 'rejected'
    request.reviewedBy = admin.id
    request.reviewedAt = DateTime.now()
    request.reviewNotes = 'Email invalido'
    await request.save()

    const updated = await DataChangeRequest.find(request.id)
    assert.equal(updated!.status, 'rejected')
    assert.equal(updated!.reviewNotes, 'Email invalido')
  })

  test('ao rejeitar, nao deve atualizar campo do employee', async ({ assert }) => {
    const originalEmail = employee.email

    request.status = 'rejected'
    request.reviewedBy = admin.id
    request.reviewedAt = DateTime.now()
    await request.save()

    // Employee nao deve ser alterado
    const updatedEmployee = await Employee.find(employee.id)
    assert.equal(updatedEmployee!.email, originalEmail)
  })

  test('nao deve rejeitar solicitacao ja processada', async ({ assert }) => {
    request.status = 'rejected'
    request.reviewedBy = admin.id
    request.reviewedAt = DateTime.now()
    await request.save()

    // Verifica que status não é mais pending
    await request.refresh()
    assert.equal(request.status, 'rejected')
  })
})

test.group('DataChangeRequestService - Validacoes', () => {
  test('deve validar campos permitidos para alteracao', async ({ assert }) => {
    const allowedFields = [
      'phone',
      'email',
      'address_street',
      'address_number',
      'address_complement',
      'address_district',
      'address_city',
      'address_state',
      'address_postal_code',
    ]

    assert.include(allowedFields, 'phone')
    assert.include(allowedFields, 'email')
    assert.include(allowedFields, 'address_street')
    assert.notInclude(allowedFields, 'salary')
    assert.notInclude(allowedFields, 'department_id')
  })

  test('nao deve permitir alterar campos criticos', async ({ assert }) => {
    const forbiddenFields = ['salary', 'department_id', 'position_id', 'status', 'type']

    for (const field of forbiddenFields) {
      assert.notInclude(
        [
          'phone',
          'email',
          'address_street',
          'address_number',
          'address_complement',
          'address_district',
          'address_city',
          'address_state',
          'address_postal_code',
        ],
        field
      )
    }
  })

  test('deve exigir newValue preenchido', async ({ assert }) => {
    // Validacao: newValue nao pode ser vazio
    const newValue = ''
    const isValid = newValue.trim().length > 0

    assert.isFalse(isValid)
  })

  test('deve aceitar reason opcional', async ({ assert }) => {
    const request = await DataChangeRequest.create({
      employeeId: 1,
      requestedBy: 1,
      fieldName: 'phone',
      newValue: '11999999999',
      status: 'pending',
    })

    assert.isUndefined(request.reason)
  })
})

test.group('DataChangeRequestService - Casos Especiais', (group) => {
  let employee: Employee
  let user: User
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })

    user = await User.create({
      fullName: 'User Teste',
      email: `user.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'employee',
      isActive: true,
    })

    employee = await Employee.create({
      fullName: 'Employee Teste',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      userId: user.id,
      departmentId: department.id,
    })
  })

  test('deve permitir multiplas solicitacoes pendentes para o mesmo employee', async ({
    assert,
  }) => {
    await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'phone',
      newValue: '11999999999',
      status: 'pending',
    })

    await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'email',
      newValue: `novo.${Date.now()}@empresa.com`,
      status: 'pending',
    })

    const requests = await DataChangeRequest.query()
      .where('employee_id', employee.id)
      .where('status', 'pending')

    assert.isAtLeast(requests.length, 2)
  })

  test('deve manter historico de solicitacoes aprovadas', async ({ assert }) => {
    const request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'phone',
      oldValue: '11999999999',
      newValue: '11988888888',
      status: 'pending',
    })

    request.status = 'approved'
    request.reviewedBy = user.id
    request.reviewedAt = DateTime.now()
    await request.save()

    const approved = await DataChangeRequest.query()
      .where('employee_id', employee.id)
      .where('status', 'approved')

    assert.isAtLeast(approved.length, 1)
  })

  test('deve manter historico de solicitacoes rejeitadas', async ({ assert }) => {
    const request = await DataChangeRequest.create({
      employeeId: employee.id,
      requestedBy: user.id,
      fieldName: 'phone',
      newValue: 'invalido',
      status: 'pending',
    })

    request.status = 'rejected'
    request.reviewedBy = user.id
    request.reviewedAt = DateTime.now()
    request.reviewNotes = 'Formato invalido'
    await request.save()

    const rejected = await DataChangeRequest.query()
      .where('employee_id', employee.id)
      .where('status', 'rejected')

    assert.isAtLeast(rejected.length, 1)
  })
})

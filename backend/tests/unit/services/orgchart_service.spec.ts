import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import Department from '#models/department'
import Position from '#models/position'
import Employee from '#models/employee'
import User from '#models/user'
import { DateTime } from 'luxon'

test.group('OrgchartService - Organograma', (group) => {
  let user: User
  let department1: Department
  let department2: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    department1 = await Department.create({
      name: `Departamento TI ${Date.now()}`,
    })

    department2 = await Department.create({
      name: `Departamento RH ${Date.now()}`,
    })

    const position1 = await Position.create({
      title: `Gerente TI ${Date.now()}`,
      departmentId: department1.id,
    })

    const position2 = await Position.create({
      title: `Desenvolvedor ${Date.now()}`,
      departmentId: department1.id,
    })

    const position3 = await Position.create({
      title: `Analista RH ${Date.now()}`,
      departmentId: department2.id,
    })

    // Criar employees no departamento 1
    await Employee.create({
      userId: user.id,
      fullName: 'João Silva',
      email: `joao.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department1.id,
      positionId: position1.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    await Employee.create({
      userId: user.id,
      fullName: 'Maria Santos',
      email: `maria.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department1.id,
      positionId: position2.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    // Criar employee no departamento 2
    await Employee.create({
      userId: user.id,
      fullName: 'Pedro Costa',
      email: `pedro.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department2.id,
      positionId: position3.id,
      hireDate: DateTime.now(),
      status: 'active',
    })
  })

  test('deve retornar departamentos com employees', async ({ assert }) => {
    const departments = await Department.query().preload('employees', (query) => {
      query.where('status', 'active')
    })

    assert.isAtLeast(departments.length, 2)

    const dept1 = departments.find((d) => d.id === department1.id)
    const dept2 = departments.find((d) => d.id === department2.id)

    assert.isDefined(dept1)
    assert.isDefined(dept2)
    assert.equal(dept1!.employees.length, 2)
    assert.equal(dept2!.employees.length, 1)
  })

  test('cada departamento tem manager identificado', async ({ assert }) => {
    // Atualizar um employee como manager
    const managerPosition = await Position.query()
      .where('department_id', department1.id)
      .where('title', 'like', '%Gerente%')
      .firstOrFail()

    const manager = await Employee.query()
      .where('department_id', department1.id)
      .where('position_id', managerPosition.id)
      .first()

    assert.isNotNull(manager)

    // Verificar se o cargo contém "Gerente"
    await manager!.load('position')
    const isManager = manager!.position!.title.toLowerCase().includes('gerente')

    assert.isTrue(isManager)
  })

  test('employees ativos apenas (nao terminated)', async ({ assert }) => {
    // Criar um employee terminated
    const terminatedEmployee = await Employee.create({
      userId: user.id,
      fullName: 'Employee Terminated',
      email: `terminated.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department1.id,
      hireDate: DateTime.now(),
      status: 'terminated',
      terminationDate: DateTime.now(),
    })

    const activeEmployees = await Employee.query().where('status', 'active')

    // Verificar que o terminated não está na lista
    const hasTerminated = activeEmployees.some((e) => e.id === terminatedEmployee.id)

    assert.isFalse(hasTerminated)

    for (const emp of activeEmployees) {
      assert.notEqual(emp.status, 'terminated')
    }
  })

  test('departamento sem employees aparece com lista vazia', async ({ assert }) => {
    const emptyDepartment = await Department.create({
      name: `Departamento Vazio ${Date.now()}`,
    })

    await emptyDepartment.load('employees')

    assert.equal(emptyDepartment.employees.length, 0)
  })

  test('employee count correto por departamento', async ({ assert }) => {
    const dept1Employees = await Employee.query()
      .where('department_id', department1.id)
      .where('status', 'active')

    const dept2Employees = await Employee.query()
      .where('department_id', department2.id)
      .where('status', 'active')

    assert.equal(dept1Employees.length, 2)
    assert.equal(dept2Employees.length, 1)
  })

  test('deve ordenar departamentos por nome', async ({ assert }) => {
    const departments = await Department.query().orderBy('name', 'asc')

    // Verificar que está ordenado
    if (departments.length >= 2) {
      for (let i = 0; i < departments.length - 1; i++) {
        const current = departments[i].name.toLowerCase()
        const next = departments[i + 1].name.toLowerCase()
        assert.isTrue(current <= next)
      }
    }
  })

  test('deve incluir posição de cada employee no organograma', async ({ assert }) => {
    const departments = await Department.query().preload('employees', (employeeQuery) => {
      employeeQuery.where('status', 'active').preload('position')
    })

    const dept1 = departments.find((d) => d.id === department1.id)

    assert.isDefined(dept1)
    assert.isAtLeast(dept1!.employees.length, 1)

    for (const employee of dept1!.employees) {
      assert.isDefined(employee.position)
      assert.isNotNull(employee.position!.title)
    }
  })

  test('deve agrupar employees por departamento corretamente', async ({ assert }) => {
    const departments = await Department.query()
      .preload('employees', (query) => {
        query.where('status', 'active')
      })
      .orderBy('name', 'asc')

    const orgChart: Record<string, any[]> = {}

    for (const dept of departments) {
      orgChart[dept.name] = dept.employees.map((emp) => ({
        id: emp.id,
        fullName: emp.fullName,
        email: emp.email,
      }))
    }

    assert.property(orgChart, department1.name)
    assert.property(orgChart, department2.name)
    assert.equal(orgChart[department1.name].length, 2)
    assert.equal(orgChart[department2.name].length, 1)
  })
})

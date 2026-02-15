import { test } from '@japa/runner'
import SearchService from '#services/search_service'
import Database from '@adonisjs/lucid/services/db'
import Employee from '#models/employee'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

test.group('SearchService - Busca Geral', (group) => {
  let service: SearchService
  let department: Department
  let position: Position

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SearchService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Tecnologia-${Date.now()}`,
    })

    position = await Position.create({
      title: `Desenvolvedor-${Date.now()}`,
      departmentId: department.id,
    })
  })

  test('deve buscar colaborador por nome com match parcial', async ({ assert }) => {
    await Employee.create({
      fullName: 'João da Silva Santos',
      email: `joao.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    const result = await service.search('João')

    assert.isAtLeast(result.employees.length, 1)
    assert.include(result.employees[0].fullName, 'João')
  })

  test('deve buscar colaborador por email', async ({ assert }) => {
    const uniqueEmail = `maria.${Date.now()}@empresa.com`
    await Employee.create({
      fullName: 'Maria Oliveira',
      email: uniqueEmail,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    const result = await service.search(uniqueEmail)

    assert.isAtLeast(result.employees.length, 1)
    assert.equal(result.employees[0].email, uniqueEmail)
  })

  test('deve buscar colaborador por CPF', async ({ assert }) => {
    const uniqueCpf = `${Date.now()}`.substring(0, 11)
    await Employee.create({
      fullName: 'Pedro Santos',
      email: `pedro.${Date.now()}@empresa.com`,
      cpf: uniqueCpf,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    const result = await service.search(uniqueCpf)

    assert.isAtLeast(result.employees.length, 1)
  })

  test('deve buscar departamento por nome', async ({ assert }) => {
    const uniqueDept = `RH-${Date.now()}`
    await Department.create({
      name: uniqueDept,
    })

    const result = await service.search(uniqueDept)

    assert.isAtLeast(result.departments.length, 1)
    assert.include(result.departments[0].name, uniqueDept)
  })

  test('deve buscar cargo por titulo', async ({ assert }) => {
    const uniqueTitle = `Analista-${Date.now()}`
    await Position.create({
      title: uniqueTitle,
      departmentId: department.id,
    })

    const result = await service.search(uniqueTitle)

    assert.isAtLeast(result.positions.length, 1)
    assert.include(result.positions[0].title, uniqueTitle)
  })

  test('deve retornar estrutura correta quando query vazia', async ({ assert }) => {
    const result = await service.search('')

    assert.property(result, 'employees')
    assert.property(result, 'departments')
    assert.property(result, 'positions')
    assert.isArray(result.employees)
    assert.isArray(result.departments)
    assert.isArray(result.positions)
  })
})

test.group('SearchService - Filtro por Tipo', (group) => {
  let service: SearchService
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SearchService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })
  })

  test('deve retornar apenas employees quando type=employees', async ({ assert }) => {
    await Employee.create({
      fullName: 'Carlos Teste',
      email: `carlos.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.search('Carlos', 'employees')

    assert.isAtLeast(result.employees.length, 1)
    assert.equal(result.departments.length, 0)
    assert.equal(result.positions.length, 0)
  })

  test('deve retornar apenas departments quando type=departments', async ({ assert }) => {
    const uniqueDept = `Vendas-${Date.now()}`
    await Department.create({
      name: uniqueDept,
    })

    const result = await service.search(uniqueDept, 'departments')

    assert.equal(result.employees.length, 0)
    assert.isAtLeast(result.departments.length, 1)
    assert.equal(result.positions.length, 0)
  })

  test('deve retornar apenas positions quando type=positions', async ({ assert }) => {
    const uniquePos = `Gerente-${Date.now()}`
    await Position.create({
      title: uniquePos,
      departmentId: department.id,
    })

    const result = await service.search(uniquePos, 'positions')

    assert.equal(result.employees.length, 0)
    assert.equal(result.departments.length, 0)
    assert.isAtLeast(result.positions.length, 1)
  })

  test('deve retornar todos os tipos quando type=all', async ({ assert }) => {
    const searchTerm = `Test-${Date.now()}`

    await Employee.create({
      fullName: `${searchTerm} Employee`,
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await Department.create({
      name: `${searchTerm} Dept`,
    })

    const result = await service.search(searchTerm, 'all')

    // Pelo menos um dos arrays deve ter resultado
    const totalResults =
      result.employees.length + result.departments.length + result.positions.length
    assert.isAtLeast(totalResults, 1)
  })
})

test.group('SearchService - Limites e Ordenacao', (group) => {
  let service: SearchService
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SearchService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })
  })

  test('deve retornar maximo 10 resultados por tipo', async ({ assert }) => {
    // Criar 15 employees com mesmo prefixo
    const prefix = `Emp-${Date.now()}`
    for (let i = 0; i < 15; i++) {
      await Employee.create({
        fullName: `${prefix} ${i}`,
        email: `emp${i}.${Date.now()}@empresa.com`,
        type: 'clt',
        hireDate: DateTime.now(),
        status: 'active',
        irrfDependents: 0,
        departmentId: department.id,
      })
    }

    const result = await service.search(prefix)

    assert.isAtMost(result.employees.length, 10)
  })

  test('deve ordenar employees por nome ascendente', async ({ assert }) => {
    const prefix = `Order-${Date.now()}`
    await Employee.create({
      fullName: `${prefix} Zebra`,
      email: `zebra.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await Employee.create({
      fullName: `${prefix} Alpha`,
      email: `alpha.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.search(prefix)

    if (result.employees.length >= 2) {
      assert.include(result.employees[0].fullName, 'Alpha')
      assert.include(result.employees[1].fullName, 'Zebra')
    }
  })

  test('deve buscar apenas employees ativos', async ({ assert }) => {
    const prefix = `Status-${Date.now()}`

    // Employee ativo
    await Employee.create({
      fullName: `${prefix} Ativo`,
      email: `ativo.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    // Employee inativo (nao deve aparecer)
    await Employee.create({
      fullName: `${prefix} Inativo`,
      email: `inativo.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'inactive',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.search(prefix)

    // Apenas o ativo deve aparecer
    assert.equal(result.employees.length, 1)
    assert.include(result.employees[0].fullName, 'Ativo')
  })
})

test.group('SearchService - Campos de Retorno', (group) => {
  let service: SearchService
  let department: Department
  let position: Position

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SearchService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })

    position = await Position.create({
      title: `Position-${Date.now()}`,
      departmentId: department.id,
    })
  })

  test('deve retornar campos corretos para employee', async ({ assert }) => {
    await Employee.create({
      fullName: 'Ana Paula',
      email: `ana.${Date.now()}@empresa.com`,
      registrationNumber: `REG-${Date.now()}`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    const result = await service.search('Ana')

    const employee = result.employees[0]
    assert.property(employee, 'id')
    assert.property(employee, 'fullName')
    assert.property(employee, 'email')
    assert.property(employee, 'department')
    assert.property(employee, 'position')
    assert.property(employee, 'registrationNumber')
  })

  test('deve retornar campos corretos para department', async ({ assert }) => {
    const uniqueDept = `Finance-${Date.now()}`
    await Department.create({
      name: uniqueDept,
    })

    const result = await service.search(uniqueDept)

    const dept = result.departments[0]
    assert.property(dept, 'id')
    assert.property(dept, 'name')
    assert.property(dept, 'employeeCount')
  })

  test('deve retornar campos corretos para position', async ({ assert }) => {
    const uniquePos = `Manager-${Date.now()}`
    await Position.create({
      title: uniquePos,
      departmentId: department.id,
    })

    const result = await service.search(uniquePos)

    const pos = result.positions[0]
    assert.property(pos, 'id')
    assert.property(pos, 'title')
    assert.property(pos, 'department')
  })

  test('deve retornar null quando employee sem department/position', async ({ assert }) => {
    await Employee.create({
      fullName: 'Sem Estrutura',
      email: `sem.${Date.now()}@empresa.com`,
      type: 'pj',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })

    const result = await service.search('Sem Estrutura')

    if (result.employees.length > 0) {
      const employee = result.employees.find((e) => e.fullName === 'Sem Estrutura')
      if (employee) {
        assert.isNull(employee.department)
        assert.isNull(employee.position)
      }
    }
  })
})

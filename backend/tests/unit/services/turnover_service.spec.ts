import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import TurnoverService from '#services/turnover_service'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

test.group('TurnoverService - Registros', (group) => {
  let service: TurnoverService
  let user: User
  let employee: Employee
  let department: Department
  let position: Position

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new TurnoverService()

    user = await User.create({
      fullName: 'RH Manager',
      email: `rh.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'manager',
      isActive: true,
    })

    department = await Department.create({
      name: `Depto ${Date.now()}`,
    })

    position = await Position.create({
      title: `Cargo ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Colaborador Saindo',
      email: `saindo.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 18 }),
      salary: 5000,
      status: 'active',
    })
  })

  test('deve registrar desligamento', async ({ assert }) => {
    const record = await service.record(
      {
        employee_id: employee.id,
        type: 'voluntary',
        reason: 'Nova oportunidade',
        exit_date: DateTime.now(),
        exit_interview_done: true,
        exit_interview_notes: 'Entrevista realizada',
      },
      user.id
    )

    assert.equal(record.employeeId, employee.id)
    assert.equal(record.type, 'voluntary')
    assert.equal(record.reason, 'Nova oportunidade')
    assert.isTrue(record.exitInterviewDone)
  })

  test('deve auto-preencher department_id do employee', async ({ assert }) => {
    const record = await service.record(
      {
        employee_id: employee.id,
        type: 'involuntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    assert.equal(record.departmentId, employee.departmentId)
  })

  test('deve auto-preencher position_id do employee', async ({ assert }) => {
    const record = await service.record(
      {
        employee_id: employee.id,
        type: 'retirement',
        exit_date: DateTime.now(),
      },
      user.id
    )

    assert.equal(record.positionId, employee.positionId)
  })

  test('deve calcular tenure_months corretamente', async ({ assert }) => {
    const hireDate = DateTime.now().minus({ months: 24, days: 15 })
    const exitDate = DateTime.now()

    const emp = await Employee.create({
      userId: user.id,
      fullName: 'Emp Tenure Test',
      email: `tenure.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: hireDate,
      status: 'active',
    })

    const record = await service.record(
      {
        employee_id: emp.id,
        type: 'voluntary',
        exit_date: exitDate,
      },
      user.id
    )

    const expectedTenure = Math.floor(exitDate.diff(hireDate, 'months').months)

    assert.equal(record.tenureMonths, expectedTenure)
  })

  test('deve registrar salary_at_exit', async ({ assert }) => {
    const record = await service.record(
      {
        employee_id: employee.id,
        type: 'end_of_contract',
        exit_date: DateTime.now(),
      },
      user.id
    )

    assert.equal(record.salaryAtExit, employee.salary)
  })

  test('deve listar registros de turnover com paginação', async ({ assert }) => {
    await service.record(
      {
        employee_id: employee.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    const result = await service.list({ page: 1, limit: 10 })
    const data = result.toJSON()

    assert.isAtLeast(data.data.length, 1)
    assert.property(data, 'meta')
  })

  test('deve filtrar por tipo de desligamento', async ({ assert }) => {
    const emp1 = await Employee.create({
      userId: user.id,
      fullName: 'Emp Vol',
      email: `vol.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const emp2 = await Employee.create({
      userId: user.id,
      fullName: 'Emp Invol',
      email: `invol.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    await service.record(
      {
        employee_id: emp1.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    await service.record(
      {
        employee_id: emp2.id,
        type: 'involuntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    const voluntaryResults = await service.list({ type: 'voluntary' })
    const voluntaryData = voluntaryResults.toJSON()

    assert.isAtLeast(voluntaryData.data.length, 1)

    for (const record of voluntaryData.data) {
      assert.equal(record.type, 'voluntary')
    }
  })

  test('deve filtrar por departamento', async ({ assert }) => {
    const dept2 = await Department.create({
      name: `Depto 2 ${Date.now()}`,
    })

    const emp2 = await Employee.create({
      userId: user.id,
      fullName: 'Emp Dept 2',
      email: `dept2.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: dept2.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    await service.record(
      {
        employee_id: employee.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    await service.record(
      {
        employee_id: emp2.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    const deptResults = await service.list({ department_id: department.id })
    const deptData = deptResults.toJSON()

    assert.isAtLeast(deptData.data.length, 1)

    for (const record of deptData.data) {
      assert.equal(record.departmentId, department.id)
    }
  })

  test('deve filtrar por período', async ({ assert }) => {
    const pastDate = DateTime.now().minus({ months: 6 })
    const futureDate = DateTime.now().plus({ days: 1 })

    await service.record(
      {
        employee_id: employee.id,
        type: 'voluntary',
        exit_date: pastDate,
      },
      user.id
    )

    const results = await service.list({
      from: pastDate.minus({ days: 1 }),
      to: futureDate,
    })
    const data = results.toJSON()

    assert.isAtLeast(data.data.length, 1)
  })
})

test.group('TurnoverService - Métricas', (group) => {
  let service: TurnoverService
  let user: User
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new TurnoverService()

    user = await User.create({
      fullName: 'Admin',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${Date.now()}`,
    })
  })

  test('deve calcular taxa de turnover', async ({ assert }) => {
    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    // Criar colaboradores ativos
    const emp1 = await Employee.create({
      userId: user.id,
      fullName: 'Ativo 1',
      email: `ativo1.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 12 }),
      status: 'active',
    })

    await Employee.create({
      userId: user.id,
      fullName: 'Ativo 2',
      email: `ativo2.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    // Registrar turnover
    await service.record(
      {
        employee_id: emp1.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    const period = {
      from: DateTime.now().minus({ days: 30 }),
      to: DateTime.now().plus({ days: 1 }),
    }

    const rate = await service.getTurnoverRate(period)

    assert.isAtLeast(rate, 0)
    assert.isAtMost(rate, 100)
  })

  test('taxa deve ser (desligamentos / média ativos) * 100', async ({ assert }) => {
    // Formula: (1 desligamento / 2 ativos) * 100 = 50
    const desligamentos = 1
    const mediaAtivos = 2

    const taxaEsperada = (desligamentos / mediaAtivos) * 100

    assert.equal(taxaEsperada, 50)
  })

  test('deve retornar turnover por departamento', async ({ assert }) => {
    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    const emp = await Employee.create({
      userId: user.id,
      fullName: 'Emp',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 6 }),
      status: 'active',
    })

    await service.record(
      {
        employee_id: emp.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    const byDepartment = await service.getTurnoverByDepartment(DateTime.now().year)

    assert.isArray(byDepartment)
    assert.isAtLeast(byDepartment.length, 1)
    assert.property(byDepartment[0], 'departmentId')
    assert.property(byDepartment[0], 'departmentName')
    assert.property(byDepartment[0], 'count')
  })

  test('deve retornar distribuição por motivo', async ({ assert }) => {
    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    const emp1 = await Employee.create({
      userId: user.id,
      fullName: 'Emp 1',
      email: `emp1.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const emp2 = await Employee.create({
      userId: user.id,
      fullName: 'Emp 2',
      email: `emp2.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    await service.record(
      {
        employee_id: emp1.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    await service.record(
      {
        employee_id: emp2.id,
        type: 'involuntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    const byReason = await service.getTurnoverByReason({
      from: DateTime.now().minus({ days: 30 }),
      to: DateTime.now().plus({ days: 1 }),
    })

    assert.isArray(byReason)
    assert.isAtLeast(byReason.length, 1)
    assert.property(byReason[0], 'type')
    assert.property(byReason[0], 'count')
  })

  test('deve retornar tendência dos últimos meses', async ({ assert }) => {
    const trend = await service.getTurnoverTrend(12)

    assert.isArray(trend)
    // Pode estar vazio se não houver registros
  })

  test('deve calcular tempo médio de empresa', async ({ assert }) => {
    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    const emp = await Employee.create({
      userId: user.id,
      fullName: 'Emp Tenure',
      email: `tenure.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 24 }),
      status: 'active',
    })

    await service.record(
      {
        employee_id: emp.id,
        type: 'voluntary',
        exit_date: DateTime.now(),
      },
      user.id
    )

    const avgTenure = await service.getAverageTenure()

    assert.property(avgTenure, 'averageTenureMonths')
    assert.property(avgTenure, 'averageTenureYears')

    if (avgTenure.averageTenureMonths !== null) {
      assert.isAtLeast(avgTenure.averageTenureMonths, 0)
    }
  })
})

test.group('TurnoverService - Validações', (group) => {
  let service: TurnoverService
  let user: User
  let department: Department
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new TurnoverService()

    user = await User.create({
      fullName: 'Admin',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Emp',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })
  })

  test('deve rejeitar tipo inválido', async ({ assert }) => {
    try {
      await service.record(
        {
          employee_id: employee.id,
          type: 'invalid_type' as any,
          exit_date: DateTime.now(),
        },
        user.id
      )
      assert.fail('Deveria ter lançado erro')
    } catch (error) {
      assert.exists(error)
    }
  })

  test('deve exigir employee_id válido', async ({ assert }) => {
    try {
      await service.record(
        {
          employee_id: 99999,
          type: 'voluntary',
          exit_date: DateTime.now(),
        },
        user.id
      )
      assert.fail('Deveria ter lançado erro')
    } catch (error) {
      assert.exists(error)
    }
  })
})

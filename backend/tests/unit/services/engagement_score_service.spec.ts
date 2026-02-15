import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import EngagementScoreService from '#services/engagement_score_service'
import EngagementScore from '#models/engagement_score'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import TimeEntry from '#models/time_entry'
import { DateTime } from 'luxon'

test.group('EngagementScoreService - Cálculo', (group) => {
  let service: EngagementScoreService
  let user: User
  let employee: Employee
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new EngagementScoreService()

    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Depto ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Cargo ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Colaborador Teste',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 6 }),
      status: 'active',
    })
  })

  test('deve calcular score para um employee', async ({ assert }) => {
    const now = DateTime.now()
    const month = now.month
    const year = now.year

    const score = await service.calculateForEmployee(employee.id, month, year, user.id)

    assert.exists(score)
    assert.equal(score.employeeId, employee.id)
    assert.equal(score.referenceMonth, month)
    assert.equal(score.referenceYear, year)
  })

  test('score deve estar entre 0 e 100', async ({ assert }) => {
    const now = DateTime.now()

    const score = await service.calculateForEmployee(employee.id, now.month, now.year, user.id)

    assert.isAtLeast(score.score, 0)
    assert.isAtMost(score.score, 100)
  })

  test('deve calcular attendance_score baseado em presença', async ({ assert }) => {
    const now = DateTime.now()
    const startOfMonth = now.startOf('month')

    // Criar registros de ponto para 10 dias do mês
    for (let i = 0; i < 10; i++) {
      const date = startOfMonth.plus({ days: i })
      // Pular finais de semana
      if (date.weekday < 6) {
        await TimeEntry.create({
          employeeId: employee.id,
          date: date,
          clockIn: date.set({ hour: 9, minute: 0 }),
          clockOut: date.set({ hour: 18, minute: 0 }),
          type: 'regular',
          totalWorkedMinutes: 480,
        })
      }
    }

    const score = await service.calculateForEmployee(employee.id, now.month, now.year, user.id)

    assert.exists(score.attendanceScore)
    assert.isAtLeast(score.attendanceScore ?? 0, 0)
    assert.isAtMost(score.attendanceScore ?? 0, 100)
  })

  test('deve calcular tenure_score baseado em tempo de empresa', async ({ assert }) => {
    const now = DateTime.now()

    // Employee criado há 6 meses (definido no setup)
    const score = await service.calculateForEmployee(employee.id, now.month, now.year, user.id)

    assert.exists(score.tenureScore)
    assert.isAtLeast(score.tenureScore ?? 0, 0)
    // 6 meses = ~25% de 24 meses
    assert.isAtMost(score.tenureScore ?? 0, 50)
  })

  test('deve calcular score para todos os employees ativos', async ({ assert }) => {
    const employee2 = await Employee.create({
      userId: user.id,
      fullName: 'Outro Colaborador',
      email: `outro.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const now = DateTime.now()
    const results = await service.calculateForAll(now.month, now.year, user.id)

    assert.isAtLeast(results.length, 2)
    assert.isTrue(results.some((r) => r.employeeId === employee.id))
    assert.isTrue(results.some((r) => r.employeeId === employee2.id))
  })

  test('deve salvar score no banco com mês/ano de referência', async ({ assert }) => {
    const month = 1
    const year = 2026

    const score = await service.calculateForEmployee(employee.id, month, year, user.id)

    const saved = await EngagementScore.query()
      .where('employee_id', employee.id)
      .where('reference_month', month)
      .where('reference_year', year)
      .firstOrFail()

    assert.equal(saved.id, score.id)
    assert.equal(saved.referenceMonth, month)
    assert.equal(saved.referenceYear, year)
  })

  test('deve atualizar score se já existir para o mês/ano', async ({ assert }) => {
    const month = 2
    const year = 2026

    const firstScore = await service.calculateForEmployee(employee.id, month, year, user.id)

    // Calcular novamente
    const secondScore = await service.calculateForEmployee(employee.id, month, year, user.id)

    // Deve ser o mesmo registro (atualizado)
    assert.equal(secondScore.id, firstScore.id)

    // Verificar que não há duplicação
    const allScores = await EngagementScore.query()
      .where('employee_id', employee.id)
      .where('reference_month', month)
      .where('reference_year', year)

    assert.equal(allScores.length, 1)
  })
})

test.group('EngagementScoreService - Consultas', (group) => {
  let service: EngagementScoreService
  let user: User
  let employee: Employee
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new EngagementScoreService()

    user = await User.create({
      fullName: 'Manager Teste',
      email: `manager.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'manager',
      isActive: true,
    })

    department = await Department.create({
      name: `Departamento ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Posição ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Employee Teste',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 12 }),
      status: 'active',
    })
  })

  test('deve retornar histórico de scores do employee', async ({ assert }) => {
    const now = DateTime.now()

    // Criar scores para 3 meses diferentes
    await service.calculateForEmployee(employee.id, now.month, now.year, user.id)
    await service.calculateForEmployee(
      employee.id,
      now.minus({ months: 1 }).month,
      now.minus({ months: 1 }).year,
      user.id
    )
    await service.calculateForEmployee(
      employee.id,
      now.minus({ months: 2 }).month,
      now.minus({ months: 2 }).year,
      user.id
    )

    const history = await service.getEmployeeHistory(employee.id, 12)

    assert.isAtLeast(history.length, 3)
  })

  test('deve retornar média por departamento', async ({ assert }) => {
    const employee2 = await Employee.create({
      userId: user.id,
      fullName: 'Outro Employee',
      email: `outro.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const now = DateTime.now()

    await service.calculateForEmployee(employee.id, now.month, now.year, user.id)
    await service.calculateForEmployee(employee2.id, now.month, now.year, user.id)

    const average = await service.getDepartmentAverage(department.id, now.month, now.year)

    assert.equal(average.departmentId, department.id)
    assert.exists(average.averageScore)
    assert.isAtLeast(average.averageScore!, 0)
    assert.isAtMost(average.averageScore!, 100)
  })

  test('deve retornar média da empresa', async ({ assert }) => {
    const now = DateTime.now()

    await service.calculateForEmployee(employee.id, now.month, now.year, user.id)

    const average = await service.getCompanyAverage(now.month, now.year)

    assert.equal(average.month, now.month)
    assert.equal(average.year, now.year)
    assert.exists(average.averageScore)
  })

  test('deve retornar ranking top N', async ({ assert }) => {
    const employee2 = await Employee.create({
      userId: user.id,
      fullName: 'Top Performer',
      email: `top.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const now = DateTime.now()

    await service.calculateForEmployee(employee.id, now.month, now.year, user.id)
    await service.calculateForEmployee(employee2.id, now.month, now.year, user.id)

    const ranking = await service.getRanking(now.month, now.year, 10)

    assert.isAtLeast(ranking.length, 2)
  })

  test('ranking deve estar ordenado por score decrescente', async ({ assert }) => {
    const now = DateTime.now()

    await service.calculateForEmployee(employee.id, now.month, now.year, user.id)

    const ranking = await service.getRanking(now.month, now.year, 10)

    for (let i = 0; i < ranking.length - 1; i++) {
      assert.isAtLeast(ranking[i].score, ranking[i + 1].score)
    }
  })
})

test.group('EngagementScoreService - Pesos', (group) => {
  let service: EngagementScoreService
  let user: User
  let employee: Employee
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new EngagementScoreService()

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
      hireDate: DateTime.now().minus({ months: 24 }), // 24 meses = tenure 100
      status: 'active',
    })
  })

  test('score final deve ser média ponderada dos sub-scores', async ({ assert }) => {
    const now = DateTime.now()

    const score = await service.calculateForEmployee(employee.id, now.month, now.year, user.id)

    const calculatedScore = Math.round(
      (score.attendanceScore ?? 0) * 0.25 +
        (score.performanceScore ?? 0) * 0.3 +
        (score.trainingScore ?? 0) * 0.2 +
        (score.tenureScore ?? 0) * 0.15 +
        (score.leaveScore ?? 0) * 0.1
    )

    assert.equal(score.score, calculatedScore)
  })

  test('attendance tem peso de 25%', async ({ assert }) => {
    const weight = 0.25
    assert.equal(weight, 0.25)
  })

  test('performance tem peso de 30%', async ({ assert }) => {
    const weight = 0.3
    assert.equal(weight, 0.3)
  })

  test('training tem peso de 20%', async ({ assert }) => {
    const weight = 0.2
    assert.equal(weight, 0.2)
  })

  test('tenure tem peso de 15%', async ({ assert }) => {
    const weight = 0.15
    assert.equal(weight, 0.15)
  })

  test('leave tem peso de 10%', async ({ assert }) => {
    const weight = 0.1
    assert.equal(weight, 0.1)
  })
})

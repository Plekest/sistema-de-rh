import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import EmployeeLifecycleService from '#services/employee_lifecycle_service'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import EmployeeHistory from '#models/employee_history'
import Leave from '#models/leave'
import TrainingEnrollment from '#models/training_enrollment'
import Training from '#models/training'
import EngagementScore from '#models/engagement_score'
import { DateTime } from 'luxon'

test.group('EmployeeLifecycleService - Timeline', (group) => {
  let service: EmployeeLifecycleService
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
    service = new EmployeeLifecycleService()

    user = await User.create({
      fullName: 'Manager',
      email: `manager.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'manager',
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
      fullName: 'Employee Timeline',
      email: `timeline.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 12 }),
      status: 'active',
    })
  })

  test('deve retornar timeline com eventos de múltiplas fontes', async ({ assert }) => {
    // Criar evento de history
    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'hire',
      title: 'Admissão',
      description: 'Colaborador admitido',
      eventDate: DateTime.fromJSDate(employee.hireDate.toJSDate()),
      createdBy: user.id,
    })

    // Criar leave
    await Leave.create({
      employeeId: employee.id,
      type: 'vacation',
      startDate: DateTime.now().minus({ days: 15 }),
      endDate: DateTime.now().minus({ days: 10 }),
      daysCount: 5,
      status: 'approved',
      requestedBy: user.id,
      approvedBy: user.id,
    })

    const timeline = await service.getTimeline(employee.id)

    assert.isArray(timeline)
    assert.isAtLeast(timeline.length, 2)
  })

  test('deve incluir eventos de employee_history', async ({ assert }) => {
    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'promotion',
      title: 'Promoção',
      description: 'Promovido a Senior',
      eventDate: DateTime.now().minus({ months: 6 }),
      createdBy: user.id,
    })

    const timeline = await service.getTimeline(employee.id)

    const historyEvents = timeline.filter((e) => e.source === 'history')

    assert.isAtLeast(historyEvents.length, 1)
  })

  test('deve incluir eventos de leaves', async ({ assert }) => {
    await Leave.create({
      employeeId: employee.id,
      type: 'vacation',
      startDate: DateTime.now().minus({ days: 10 }),
      endDate: DateTime.now().minus({ days: 5 }),
      daysCount: 5,
      status: 'approved',
      requestedBy: user.id,
      approvedBy: user.id,
    })

    const timeline = await service.getTimeline(employee.id)

    const leaveEvents = timeline.filter((e) => e.source === 'leave')

    assert.isAtLeast(leaveEvents.length, 1)
  })

  test('deve incluir eventos de training_enrollments', async ({ assert }) => {
    const training = await Training.create({
      title: `Treinamento ${Date.now()}`,
      description: 'Curso teste',
      type: 'online',
      startDate: DateTime.now().plus({ days: 10 }),
      endDate: DateTime.now().plus({ days: 15 }),
      durationHours: 10,
      maxParticipants: 20,
      createdBy: user.id,
    })

    await TrainingEnrollment.create({
      employeeId: employee.id,
      trainingId: training.id,
      status: 'enrolled',
      enrolledAt: DateTime.now().minus({ days: 30 }),
    })

    const timeline = await service.getTimeline(employee.id)

    const trainingEvents = timeline.filter((e) => e.source === 'training')

    assert.isAtLeast(trainingEvents.length, 1)
  })

  test('deve ordenar eventos por data decrescente', async ({ assert }) => {
    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'hire',
      title: 'Admissão',
      description: 'Admitido',
      eventDate: DateTime.now().minus({ months: 12 }),
      createdBy: user.id,
    })

    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'promotion',
      title: 'Promoção',
      description: 'Promovido',
      eventDate: DateTime.now().minus({ months: 6 }),
      createdBy: user.id,
    })

    const timeline = await service.getTimeline(employee.id)

    // Eventos devem estar em ordem decrescente (mais recente primeiro)
    for (let i = 0; i < timeline.length - 1; i++) {
      const date1 = DateTime.fromISO(timeline[i].date)
      const date2 = DateTime.fromISO(timeline[i + 1].date)
      assert.isAtLeast(date1.toMillis(), date2.toMillis())
    }
  })

  test('deve filtrar por período (from/to)', async ({ assert }) => {
    const now = DateTime.now()
    const pastEvent = DateTime.now().minus({ months: 12 })
    const recentEvent = DateTime.now().minus({ days: 5 })

    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'hire',
      title: 'Evento Antigo',
      description: 'Evento antigo',
      eventDate: pastEvent,
      createdBy: user.id,
    })

    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'promotion',
      title: 'Evento Recente',
      description: 'Evento recente',
      eventDate: recentEvent,
      createdBy: user.id,
    })

    const timeline = await service.getTimeline(employee.id, {
      from: now.minus({ days: 10 }),
      to: now,
    })

    // Deve retornar apenas o evento recente
    assert.isAtLeast(timeline.length, 1)
    const hasOldEvent = timeline.some((e) => e.title.includes('Antigo'))
    assert.isFalse(hasOldEvent)
  })

  test('deve filtrar por tipo de evento', async ({ assert }) => {
    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'promotion',
      title: 'Promoção',
      description: 'Promovido',
      eventDate: DateTime.now(),
      createdBy: user.id,
    })

    await Leave.create({
      employeeId: employee.id,
      type: 'vacation',
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 5 }),
      daysCount: 5,
      status: 'approved',
      requestedBy: user.id,
      approvedBy: user.id,
    })

    const timeline = await service.getTimeline(employee.id, {
      types: ['history'],
    })

    // Deve retornar apenas eventos de history
    const hasLeaveEvent = timeline.some((e) => e.source === 'leave')
    assert.isFalse(hasLeaveEvent)
  })
})

test.group('EmployeeLifecycleService - Summary', (group) => {
  let service: EmployeeLifecycleService
  let user: User
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new EmployeeLifecycleService()

    user = await User.create({
      fullName: 'Admin',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    const department = await Department.create({
      name: `Dept ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Employee Summary',
      email: `summary.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ months: 18 }),
      status: 'active',
    })
  })

  test('deve retornar tempo de empresa em meses', async ({ assert }) => {
    const summary = await service.getSummary(employee.id)

    assert.property(summary, 'tenure')
    assert.property(summary.tenure, 'tenureMonths')
    assert.isAtLeast(summary.tenure.tenureMonths, 18)
  })

  test('deve contar total de promoções', async ({ assert }) => {
    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'promotion',
      title: 'Promoção 1',
      description: 'Primeira promoção',
      eventDate: DateTime.now().minus({ months: 6 }),
      createdBy: user.id,
    })

    await EmployeeHistory.create({
      employeeId: employee.id,
      type: 'promotion',
      title: 'Promoção 2',
      description: 'Segunda promoção',
      eventDate: DateTime.now().minus({ months: 3 }),
      createdBy: user.id,
    })

    const summary = await service.getSummary(employee.id)

    assert.property(summary, 'stats')
    assert.property(summary.stats, 'totalPromotions')
    assert.equal(summary.stats.totalPromotions, 2)
  })

  test('deve contar total de treinamentos', async ({ assert }) => {
    const training1 = await Training.create({
      title: `Training 1 ${Date.now()}`,
      description: 'First training',
      type: 'online',
      startDate: DateTime.now().minus({ months: 3 }),
      endDate: DateTime.now().minus({ months: 2, days: 25 }),
      durationHours: 5,
      maxParticipants: 10,
      createdBy: user.id,
    })

    const training2 = await Training.create({
      title: `Training 2 ${Date.now()}`,
      description: 'Second training',
      type: 'online',
      startDate: DateTime.now().minus({ months: 1 }),
      endDate: DateTime.now().minus({ days: 22 }),
      durationHours: 8,
      maxParticipants: 10,
      createdBy: user.id,
    })

    await TrainingEnrollment.create({
      employeeId: employee.id,
      trainingId: training1.id,
      status: 'completed',
      enrolledAt: DateTime.now().minus({ months: 3 }),
      completedAt: DateTime.now().minus({ months: 2 }),
    })

    await TrainingEnrollment.create({
      employeeId: employee.id,
      trainingId: training2.id,
      status: 'completed',
      enrolledAt: DateTime.now().minus({ months: 1 }),
      completedAt: DateTime.now(),
    })

    const summary = await service.getSummary(employee.id)

    assert.property(summary.stats, 'totalTrainingsCompleted')
    assert.equal(summary.stats.totalTrainingsCompleted, 2)
  })

  test('deve incluir engagement score atual (se existir)', async ({ assert }) => {
    const now = DateTime.now()

    await EngagementScore.create({
      employeeId: employee.id,
      score: 85,
      attendanceScore: 90,
      performanceScore: 80,
      trainingScore: 85,
      tenureScore: 75,
      leaveScore: 95,
      referenceMonth: now.month,
      referenceYear: now.year,
      calculatedAt: now,
    })

    const summary = await service.getSummary(employee.id)

    assert.property(summary.stats, 'currentEngagementScore')
    assert.equal(summary.stats.currentEngagementScore, 85)
  })
})

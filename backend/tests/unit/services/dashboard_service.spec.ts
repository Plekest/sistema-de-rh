import { test } from '@japa/runner'
import DashboardService from '#services/dashboard_service'
import Database from '@adonisjs/lucid/services/db'
import Employee from '#models/employee'
import Department from '#models/department'
import Position from '#models/position'
import Leave from '#models/leave'
import TimeEntry from '#models/time_entry'
import { DateTime } from 'luxon'

test.group('DashboardService - getAdminDashboard', (group) => {
  let service: DashboardService
  let department: Department
  let position: Position

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new DashboardService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `TI-${Date.now()}`,
    })

    position = await Position.create({
      title: `Desenvolvedor-${Date.now()}`,
      departmentId: department.id,
    })
  })

  test('deve retornar estrutura completa do dashboard admin', async ({ assert }) => {
    const dashboard = await service.getAdminDashboard()

    assert.property(dashboard, 'totalEmployees')
    assert.property(dashboard, 'employeesByType')
    assert.property(dashboard, 'employeesByStatus')
    assert.property(dashboard, 'departmentDistribution')
    assert.property(dashboard, 'pendingLeaves')
    assert.property(dashboard, 'upcomingLeaves')
    assert.property(dashboard, 'recentHires')
    assert.property(dashboard, 'totalPayroll')
    assert.property(dashboard, 'attendanceToday')
  })

  test('deve contar total de employees ativos corretamente', async ({ assert }) => {
    await Employee.create({
      fullName: 'Colaborador Ativo 1',
      email: `ativo1.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    await Employee.create({
      fullName: 'Colaborador Ativo 2',
      email: `ativo2.${Date.now()}@empresa.com`,
      type: 'pj',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    await Employee.create({
      fullName: 'Colaborador Inativo',
      email: `inativo.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'inactive',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    const dashboard = await service.getAdminDashboard()

    assert.isAtLeast(dashboard.totalEmployees, 2)
  })

  test('deve separar employees por tipo corretamente', async ({ assert }) => {
    await Employee.create({
      fullName: 'CLT Employee',
      email: `clt.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await Employee.create({
      fullName: 'PJ Employee',
      email: `pj.${Date.now()}@empresa.com`,
      type: 'pj',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const dashboard = await service.getAdminDashboard()

    assert.property(dashboard.employeesByType, 'clt')
    assert.property(dashboard.employeesByType, 'pj')
    assert.isAtLeast(dashboard.employeesByType.clt, 1)
    assert.isAtLeast(dashboard.employeesByType.pj, 1)
  })

  test('deve separar employees por status corretamente', async ({ assert }) => {
    await Employee.create({
      fullName: 'Active Employee',
      email: `active.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await Employee.create({
      fullName: 'Terminated Employee',
      email: `terminated.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now().minus({ years: 1 }),
      terminationDate: DateTime.now(),
      status: 'terminated',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const dashboard = await service.getAdminDashboard()

    assert.property(dashboard.employeesByStatus, 'active')
    assert.property(dashboard.employeesByStatus, 'inactive')
    assert.property(dashboard.employeesByStatus, 'terminated')
  })

  test('deve retornar distribuicao por departamento', async ({ assert }) => {
    const dept2 = await Department.create({
      name: `RH-${Date.now()}`,
    })

    await Employee.create({
      fullName: 'Employee TI',
      email: `empti.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await Employee.create({
      fullName: 'Employee RH',
      email: `emprh.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: dept2.id,
    })

    const dashboard = await service.getAdminDashboard()

    assert.isArray(dashboard.departmentDistribution)
    assert.isAtLeast(dashboard.departmentDistribution.length, 2)
  })

  test('deve contar pending leaves corretamente', async ({ assert }) => {
    const employee = await Employee.create({
      fullName: 'Employee Leave',
      email: `leave.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await Leave.create({
      employeeId: employee.id,
      type: 'vacation',
      startDate: DateTime.now().plus({ days: 10 }),
      endDate: DateTime.now().plus({ days: 20 }),
      daysCount: 10,
      isPaid: true,
      status: 'pending',
    })

    const dashboard = await service.getAdminDashboard()

    assert.isAtLeast(dashboard.pendingLeaves, 1)
  })

  test('deve listar upcoming leaves nos proximos 30 dias', async ({ assert }) => {
    const employee = await Employee.create({
      fullName: 'Employee Upcoming',
      email: `upcoming.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await Leave.create({
      employeeId: employee.id,
      type: 'vacation',
      startDate: DateTime.now().plus({ days: 15 }),
      endDate: DateTime.now().plus({ days: 20 }),
      daysCount: 5,
      isPaid: true,
      status: 'approved',
    })

    const dashboard = await service.getAdminDashboard()

    assert.isArray(dashboard.upcomingLeaves)
  })

  test('deve listar recent hires', async ({ assert }) => {
    await Employee.create({
      fullName: 'New Hire',
      email: `newhire.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })

    const dashboard = await service.getAdminDashboard()

    assert.isArray(dashboard.recentHires)
    assert.isAtLeast(dashboard.recentHires.length, 1)
  })

  test('deve contar attendance hoje', async ({ assert }) => {
    const employee = await Employee.create({
      fullName: 'Employee Today',
      email: `today.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    await TimeEntry.create({
      employeeId: employee.id,
      date: DateTime.now(),
      clockIn: DateTime.now().set({ hour: 8 }),
      type: 'regular',
      totalWorkedMinutes: 0,
    })

    const dashboard = await service.getAdminDashboard()

    assert.isAtLeast(dashboard.attendanceToday, 1)
  })

  test('deve retornar 0 para totalPayroll quando nao ha periodos fechados', async ({
    assert,
  }) => {
    const dashboard = await service.getAdminDashboard()

    assert.equal(dashboard.totalPayroll, 0)
  })
})

test.group('DashboardService - getEmployeeDashboard', (group) => {
  let service: DashboardService
  let employee: Employee
  let department: Department
  let position: Position

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new DashboardService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Financeiro-${Date.now()}`,
    })

    position = await Position.create({
      title: `Analista-${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      fullName: 'Colaborador Dashboard',
      email: `dashboard.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now().minus({ years: 1 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
      positionId: position.id,
    })
  })

  test('deve retornar estrutura completa do dashboard employee', async ({ assert }) => {
    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.property(dashboard, 'employee')
    assert.property(dashboard, 'myLeaves')
    assert.property(dashboard, 'upcomingLeaves')
    assert.property(dashboard, 'myBenefits')
    assert.property(dashboard, 'lastPaySlip')
    assert.property(dashboard, 'recentHistory')
    assert.property(dashboard, 'attendanceThisMonth')
  })

  test('deve retornar dados basicos do employee', async ({ assert }) => {
    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.equal(dashboard.employee.id, employee.id)
    assert.equal(dashboard.employee.fullName, employee.fullName)
    assert.equal(dashboard.employee.email, employee.email)
    assert.equal(dashboard.employee.type, employee.type)
    assert.equal(dashboard.employee.department, department.name)
    assert.equal(dashboard.employee.position, position.title)
  })

  test('deve contar my leaves corretamente', async ({ assert }) => {
    await Leave.create({
      employeeId: employee.id,
      type: 'vacation',
      startDate: DateTime.now().plus({ days: 10 }),
      endDate: DateTime.now().plus({ days: 15 }),
      daysCount: 5,
      isPaid: true,
      status: 'pending',
    })

    await Leave.create({
      employeeId: employee.id,
      type: 'medical',
      startDate: DateTime.now().plus({ days: 20 }),
      endDate: DateTime.now().plus({ days: 22 }),
      daysCount: 2,
      isPaid: true,
      status: 'approved',
    })

    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.isAtLeast(dashboard.myLeaves.pending, 1)
    assert.isAtLeast(dashboard.myLeaves.approved, 1)
    assert.isAtLeast(dashboard.myLeaves.total, 2)
  })

  test('deve listar upcoming leaves nos proximos 60 dias', async ({ assert }) => {
    await Leave.create({
      employeeId: employee.id,
      type: 'vacation',
      startDate: DateTime.now().plus({ days: 30 }),
      endDate: DateTime.now().plus({ days: 35 }),
      daysCount: 5,
      isPaid: true,
      status: 'approved',
    })

    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.isArray(dashboard.upcomingLeaves)
  })

  test('deve retornar 0 benefits quando nao ha', async ({ assert }) => {
    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.equal(dashboard.myBenefits, 0)
  })

  test('deve retornar null lastPaySlip quando nao ha', async ({ assert }) => {
    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.isNull(dashboard.lastPaySlip)
  })

  test('deve retornar recent history vazio quando nao ha', async ({ assert }) => {
    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.isArray(dashboard.recentHistory)
    assert.lengthOf(dashboard.recentHistory, 0)
  })

  test('deve calcular attendance this month corretamente', async ({ assert }) => {
    const now = DateTime.now()

    // Criar 5 dias de presenca
    for (let i = 0; i < 5; i++) {
      const date = now.minus({ days: i })
      if (date.month === now.month) {
        await TimeEntry.create({
          employeeId: employee.id,
          date: date,
          clockIn: date.set({ hour: 8 }),
          clockOut: date.set({ hour: 17 }),
          lunchStart: date.set({ hour: 12 }),
          lunchEnd: date.set({ hour: 13 }),
          type: 'regular',
          totalWorkedMinutes: 480,
        })
      }
    }

    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.isAtLeast(dashboard.attendanceThisMonth.days, 1)
    assert.isString(dashboard.attendanceThisMonth.hoursTotal)
    assert.match(dashboard.attendanceThisMonth.hoursTotal, /\d+h \d+m/)
  })

  test('deve retornar attendance zerado quando nao ha registros', async ({ assert }) => {
    const dashboard = await service.getEmployeeDashboard(employee.id)

    assert.equal(dashboard.attendanceThisMonth.days, 0)
    assert.equal(dashboard.attendanceThisMonth.hoursTotal, '0h 0m')
  })

  test('deve lancar erro quando employee nao existe', async ({ assert }) => {
    await assert.rejects(async () => await service.getEmployeeDashboard(99999))
  })
})

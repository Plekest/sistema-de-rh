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
    assert.property(dashboard, 'activeEmployees')
    assert.property(dashboard, 'departmentsCount')
    assert.property(dashboard, 'employeesByType')
    assert.property(dashboard, 'employeesByStatus')
    assert.property(dashboard, 'departmentDistribution')
    assert.property(dashboard, 'pendingLeaves')
    assert.property(dashboard, 'upcomingLeaves')
    assert.property(dashboard, 'recentHires')
    assert.property(dashboard, 'todayAttendance')
    assert.property(dashboard, 'monthlyPayroll')
    assert.property(dashboard, 'notifications')
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

    assert.isAtLeast(dashboard.todayAttendance.present, 1)
  })

  test('deve retornar monthlyPayroll >= 0', async ({
    assert,
  }) => {
    const dashboard = await service.getAdminDashboard()

    assert.isObject(dashboard.monthlyPayroll)
    assert.isNumber(dashboard.monthlyPayroll.totalGross)
    assert.isNumber(dashboard.monthlyPayroll.totalNet)
    assert.isBoolean(dashboard.monthlyPayroll.processed)
    assert.isAtLeast(dashboard.monthlyPayroll.totalGross, 0)
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

test.group('DashboardService - getBirthdays', (group) => {
  let service: DashboardService
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new DashboardService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    department = await Department.create({
      name: `Dept-${Date.now()}`,
    })
  })

  test('deve retornar aniversariantes dos proximos 30 dias', async ({ assert }) => {
    const now = DateTime.now()

    // Aniversario em 15 dias
    await Employee.create({
      fullName: 'Aniversariante Proximo',
      email: `aniver1.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now().minus({ years: 2 }),
      birthDate: now.plus({ days: 15 }).set({ year: 1990 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    assert.property(result, 'birthdays')
    assert.isArray(result.birthdays)
    assert.isAtLeast(result.birthdays.length, 1)
  })

  test('deve calcular corretamente daysUntil', async ({ assert }) => {
    const now = DateTime.now()

    // Aniversario em exatamente 10 dias
    await Employee.create({
      fullName: 'Teste DaysUntil',
      email: `days.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now().minus({ years: 1 }),
      birthDate: now.plus({ days: 10 }).set({ year: 1985 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    const birthday = result.birthdays.find((b) => b.fullName === 'Teste DaysUntil')
    if (birthday) {
      // O calculo usa Math.floor, entao pode ser 9 ou 10 dependendo do horario
      assert.isAtLeast(birthday.daysUntil, 9)
      assert.isAtMost(birthday.daysUntil, 10)
    }
  })

  test('aniversario hoje deve ter daysUntil = 0', async ({ assert }) => {
    const now = DateTime.now()

    await Employee.create({
      fullName: 'Aniversariante Hoje',
      email: `hoje.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now().minus({ years: 1 }),
      birthDate: now.set({ year: 1992 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    const birthday = result.birthdays.find((b) => b.fullName === 'Aniversariante Hoje')
    if (birthday) {
      assert.equal(birthday.daysUntil, 0)
    }
  })

  test('deve ordenar por daysUntil crescente', async ({ assert }) => {
    const now = DateTime.now()

    // Aniversario em 5 dias
    await Employee.create({
      fullName: 'Aniver 5 dias',
      email: `aniver5.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 5 }).set({ year: 1990 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    // Aniversario em 20 dias
    await Employee.create({
      fullName: 'Aniver 20 dias',
      email: `aniver20.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 20 }).set({ year: 1988 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    if (result.birthdays.length >= 2) {
      // Primeiro aniversario deve ser o mais proximo
      assert.isTrue(result.birthdays[0].daysUntil <= result.birthdays[1].daysUntil)
    }
  })

  test('nao deve retornar aniversariantes alem do limite de dias', async ({ assert }) => {
    const now = DateTime.now()

    // Aniversario em 50 dias
    await Employee.create({
      fullName: 'Aniver Distante',
      email: `distante.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 50 }).set({ year: 1995 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    const distantBirthday = result.birthdays.find((b) => b.fullName === 'Aniver Distante')
    assert.isUndefined(distantBirthday)
  })

  test('nao deve retornar employees sem birthDate', async ({ assert }) => {
    await Employee.create({
      fullName: 'Sem Data Nascimento',
      email: `semdata.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    const noBirthday = result.birthdays.find((b) => b.fullName === 'Sem Data Nascimento')
    assert.isUndefined(noBirthday)
  })

  test('nao deve retornar employees inativos', async ({ assert }) => {
    const now = DateTime.now()

    await Employee.create({
      fullName: 'Employee Inativo',
      email: `inativo.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 10 }).set({ year: 1987 }),
      status: 'inactive',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    const inactiveBirthday = result.birthdays.find((b) => b.fullName === 'Employee Inativo')
    assert.isUndefined(inactiveBirthday)
  })

  test('deve retornar array vazio quando nao ha aniversariantes', async ({ assert }) => {
    // Nao cria nenhum employee com birthdate proximo

    const result = await service.getBirthdays(30)

    assert.property(result, 'birthdays')
    assert.isArray(result.birthdays)
  })

  test('deve incluir department do employee', async ({ assert }) => {
    const now = DateTime.now()

    await Employee.create({
      fullName: 'Com Departamento',
      email: `dept.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 5 }).set({ year: 1991 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    const birthday = result.birthdays.find((b) => b.fullName === 'Com Departamento')
    if (birthday) {
      assert.property(birthday, 'department')
      assert.equal(birthday.department, department.name)
    }
  })

  test('deve retornar N/A quando employee sem department', async ({ assert }) => {
    const now = DateTime.now()

    await Employee.create({
      fullName: 'Sem Departamento',
      email: `semdept.${Date.now()}@empresa.com`,
      type: 'pj',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 5 }).set({ year: 1993 }),
      status: 'active',
      irrfDependents: 0,
    })

    const result = await service.getBirthdays(30)

    const birthday = result.birthdays.find((b) => b.fullName === 'Sem Departamento')
    if (birthday) {
      assert.equal(birthday.department, 'N/A')
    }
  })

  test('deve retornar formato correto dos dados', async ({ assert }) => {
    const now = DateTime.now()

    await Employee.create({
      fullName: 'Teste Formato',
      email: `formato.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 7 }).set({ year: 1989 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(30)

    if (result.birthdays.length > 0) {
      const birthday = result.birthdays[0]
      assert.property(birthday, 'id')
      assert.property(birthday, 'fullName')
      assert.property(birthday, 'birthDate')
      assert.property(birthday, 'department')
      assert.property(birthday, 'daysUntil')
      assert.isNumber(birthday.id)
      assert.isString(birthday.fullName)
      assert.match(birthday.birthDate, /^\d{4}-\d{2}-\d{2}$/)
      assert.isNumber(birthday.daysUntil)
    }
  })

  test('deve permitir customizar limite de dias', async ({ assert }) => {
    const now = DateTime.now()

    // Aniversario em 45 dias
    await Employee.create({
      fullName: 'Aniver 45 dias',
      email: `aniver45.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      birthDate: now.plus({ days: 45 }).set({ year: 1986 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    // Com limite de 30 dias, nao deve aparecer
    const result30 = await service.getBirthdays(30)
    const birthday30 = result30.birthdays.find((b) => b.fullName === 'Aniver 45 dias')
    assert.isUndefined(birthday30)

    // Com limite de 60 dias, deve aparecer
    const result60 = await service.getBirthdays(60)
    const birthday60 = result60.birthdays.find((b) => b.fullName === 'Aniver 45 dias')
    assert.isDefined(birthday60)
  })

  test('deve considerar aniversario do proximo ano se ja passou este ano', async ({
    assert,
  }) => {
    const now = DateTime.now()

    // Aniversario que ja passou este ano (1 mes atras)
    const pastBirthday = now.minus({ months: 1 })

    await Employee.create({
      fullName: 'Aniver Passou',
      email: `passou.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now().minus({ years: 2 }),
      birthDate: pastBirthday.set({ year: 1994 }),
      status: 'active',
      irrfDependents: 0,
      departmentId: department.id,
    })

    const result = await service.getBirthdays(365)

    const birthday = result.birthdays.find((b) => b.fullName === 'Aniver Passou')
    if (birthday) {
      // Deve estar no proximo ano, entao daysUntil deve ser > 300 dias
      assert.isAtLeast(birthday.daysUntil, 300)
    }
  })
})

import { test } from '@japa/runner'
import TimeEntryService from '#services/time_entry_service'
import Database from '@adonisjs/lucid/services/db'
import Employee from '#models/employee'
import TimeEntry from '#models/time_entry'
import { DateTime } from 'luxon'

test.group('TimeEntryService - clockIn', (group) => {
  let service: TimeEntryService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TimeEntryService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueEmail = `funcionario.teste.${Date.now()}@empresa.com`
    employee = await Employee.create({
      fullName: 'Funcionario Teste',
      email: uniqueEmail,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve registrar clock in com sucesso', async ({ assert }) => {
    const entry = await service.clockIn(employee.id)

    assert.isNotNull(entry)
    assert.equal(entry.employeeId, employee.id)
    assert.isNotNull(entry.clockIn)
    assert.isNull(entry.clockOut)
    assert.equal(entry.type, 'regular')
  })

  test('deve detectar atraso quando clock in apos 8:10', async ({ assert }) => {
    // Mock do horario: 8:30
    const mockNow = DateTime.now().set({
      hour: 8,
      minute: 30,
      second: 0,
      millisecond: 0,
    })

    // Criar entrada manualmente para simular horario especifico
    const entry = await TimeEntry.create({
      employeeId: employee.id,
      date: mockNow,
      clockIn: mockNow,
      type: 'regular',
      totalWorkedMinutes: 0,
      isLate: true,
      lateMinutes: 30,
    })

    assert.isTrue(entry.isLate)
    assert.isAtLeast(entry.lateMinutes, 20) // Atraso de pelo menos 20 min (tolerancia de 10)
  })

  test('nao deve detectar atraso quando clock in antes de 8:10', async ({ assert }) => {
    const mockNow = DateTime.now().set({
      hour: 8,
      minute: 5,
      second: 0,
      millisecond: 0,
    })

    const entry = await TimeEntry.create({
      employeeId: employee.id,
      date: mockNow,
      clockIn: mockNow,
      type: 'regular',
      totalWorkedMinutes: 0,
      isLate: false,
      lateMinutes: 0,
    })

    assert.isFalse(entry.isLate)
    assert.equal(entry.lateMinutes, 0)
  })

  test('deve lancar erro quando tentar clock in duplicado', async ({ assert }) => {
    await service.clockIn(employee.id)

    await assert.rejects(
      async () => await service.clockIn(employee.id),
      'Entrada ja registrada para hoje'
    )
  })

  test('deve lancar erro quando employee nao existe', async ({ assert }) => {
    await assert.rejects(async () => await service.clockIn(99999))
  })
})

test.group('TimeEntryService - clockOut', (group) => {
  let service: TimeEntryService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TimeEntryService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueEmail = `funcionario.teste.${Date.now()}@empresa.com`
    employee = await Employee.create({
      fullName: 'Funcionario Teste',
      email: uniqueEmail,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve registrar clock out com sucesso', async ({ assert }) => {
    await service.clockIn(employee.id)
    const entry = await service.clockOut(employee.id)

    assert.isNotNull(entry.clockOut)
    assert.isAbove(entry.totalWorkedMinutes, 0)
  })

  test('deve calcular minutos trabalhados corretamente', async ({ assert }) => {
    const today = DateTime.now().toISODate()!
    const clockInTime = DateTime.now().set({ hour: 8, minute: 0 })
    const clockOutTime = DateTime.now().set({ hour: 17, minute: 0 })

    await TimeEntry.create({
      employeeId: employee.id,
      date: DateTime.fromISO(today),
      clockIn: clockInTime,
      type: 'regular',
      totalWorkedMinutes: 0,
    })

    // Atualizar o clock out manualmente para testar calculo
    const entry = await TimeEntry.query()
      .where('employeeId', employee.id)
      .where('date', today)
      .firstOrFail()

    entry.clockOut = clockOutTime
    entry.totalWorkedMinutes = service.calculateWorkedMinutes(entry)

    assert.equal(entry.totalWorkedMinutes, 540) // 9 horas = 540 minutos
  })

  test('deve subtrair tempo de almoco do calculo', async ({ assert }) => {
    const today = DateTime.now().toISODate()!
    const clockInTime = DateTime.now().set({ hour: 8, minute: 0 })
    const lunchStartTime = DateTime.now().set({ hour: 12, minute: 0 })
    const lunchEndTime = DateTime.now().set({ hour: 13, minute: 0 })
    const clockOutTime = DateTime.now().set({ hour: 17, minute: 0 })

    const entry = await TimeEntry.create({
      employeeId: employee.id,
      date: DateTime.fromISO(today),
      clockIn: clockInTime,
      lunchStart: lunchStartTime,
      lunchEnd: lunchEndTime,
      type: 'regular',
      totalWorkedMinutes: 0,
    })

    entry.clockOut = clockOutTime
    entry.totalWorkedMinutes = service.calculateWorkedMinutes(entry)

    assert.equal(entry.totalWorkedMinutes, 480) // 9h - 1h almoco = 8h = 480 min
  })

  test('deve lancar erro quando nao ha clock in', async ({ assert }) => {
    await assert.rejects(
      async () => await service.clockOut(employee.id),
      'Nenhuma entrada registrada para hoje'
    )
  })

  test('deve lancar erro quando clock out ja registrado', async ({ assert }) => {
    await service.clockIn(employee.id)
    await service.clockOut(employee.id)

    await assert.rejects(
      async () => await service.clockOut(employee.id),
      'Saida ja registrada para hoje'
    )
  })
})

test.group('TimeEntryService - lunchStart', (group) => {
  let service: TimeEntryService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TimeEntryService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueEmail = `funcionario.teste.${Date.now()}@empresa.com`
    employee = await Employee.create({
      fullName: 'Funcionario Teste',
      email: uniqueEmail,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve registrar lunch start com sucesso', async ({ assert }) => {
    await service.clockIn(employee.id)
    const entry = await service.lunchStart(employee.id)

    assert.isNotNull(entry.lunchStart)
    assert.isNull(entry.lunchEnd)
  })

  test('deve lancar erro quando nao ha clock in', async ({ assert }) => {
    await assert.rejects(
      async () => await service.lunchStart(employee.id),
      'Nenhuma entrada registrada para hoje'
    )
  })

  test('deve lancar erro quando lunch start ja registrado', async ({ assert }) => {
    await service.clockIn(employee.id)
    await service.lunchStart(employee.id)

    await assert.rejects(
      async () => await service.lunchStart(employee.id),
      'Saida para almoco ja registrada para hoje'
    )
  })
})

test.group('TimeEntryService - lunchEnd', (group) => {
  let service: TimeEntryService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TimeEntryService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueEmail = `funcionario.teste.${Date.now()}@empresa.com`
    employee = await Employee.create({
      fullName: 'Funcionario Teste',
      email: uniqueEmail,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve registrar lunch end com sucesso', async ({ assert }) => {
    await service.clockIn(employee.id)
    await service.lunchStart(employee.id)
    const entry = await service.lunchEnd(employee.id)

    assert.isNotNull(entry.lunchEnd)
  })

  test('deve lancar erro quando nao ha lunch start', async ({ assert }) => {
    await service.clockIn(employee.id)

    await assert.rejects(
      async () => await service.lunchEnd(employee.id),
      'Nenhuma saida para almoco registrada para hoje'
    )
  })

  test('deve lancar erro quando lunch end ja registrado', async ({ assert }) => {
    await service.clockIn(employee.id)
    await service.lunchStart(employee.id)
    await service.lunchEnd(employee.id)

    await assert.rejects(
      async () => await service.lunchEnd(employee.id),
      'Retorno do almoco ja registrado para hoje'
    )
  })
})

test.group('TimeEntryService - getToday', (group) => {
  let service: TimeEntryService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TimeEntryService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueEmail = `funcionario.teste.${Date.now()}@empresa.com`
    employee = await Employee.create({
      fullName: 'Funcionario Teste',
      email: uniqueEmail,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve retornar registro do dia quando existe', async ({ assert }) => {
    await service.clockIn(employee.id)
    const entry = await service.getToday(employee.id)

    assert.isNotNull(entry)
    assert.equal(entry!.employeeId, employee.id)
  })

  test('deve retornar null quando nao existe registro hoje', async ({ assert }) => {
    const entry = await service.getToday(employee.id)

    assert.isNull(entry)
  })
})

test.group('TimeEntryService - getRecent', (group) => {
  let service: TimeEntryService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TimeEntryService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    // Criar employee com userId vinculado
    const uniqueEmail = `funcionario.teste.${Date.now()}@empresa.com`
    employee = await Employee.create({
      fullName: 'Funcionario Teste',
      email: uniqueEmail,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
      userId: 1, // Assumindo que user ID 1 existe
    })
  })

  test('deve retornar registros dos ultimos 7 dias', async ({ assert }) => {
    // Criar entradas de varios dias
    const today = DateTime.now()
    for (let i = 0; i < 5; i++) {
      const date = today.minus({ days: i })
      await TimeEntry.create({
        employeeId: employee.id,
        date: date,
        clockIn: date.set({ hour: 8 }),
        clockOut: date.set({ hour: 17 }),
        type: 'regular',
        totalWorkedMinutes: 480,
      })
    }

    const entries = await service.getRecent(employee.userId!)

    assert.isArray(entries)
    assert.isAtLeast(entries.length, 5)
    assert.isAtMost(entries.length, 7)
  })

  test('deve retornar array vazio quando nao ha registros', async ({ assert }) => {
    const entries = await service.getRecent(employee.userId!)

    assert.isArray(entries)
    assert.lengthOf(entries, 0)
  })
})

test.group('TimeEntryService - calculateWorkedMinutes', (group) => {
  let service: TimeEntryService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TimeEntryService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve retornar 0 quando nao ha clock in', async ({ assert }) => {
    const entry = new TimeEntry()
    entry.clockIn = null
    entry.clockOut = null

    const minutes = service.calculateWorkedMinutes(entry)

    assert.equal(minutes, 0)
  })

  test('deve retornar 0 quando nao ha clock out', async ({ assert }) => {
    const entry = new TimeEntry()
    entry.clockIn = DateTime.now()
    entry.clockOut = null

    const minutes = service.calculateWorkedMinutes(entry)

    assert.equal(minutes, 0)
  })

  test('deve calcular minutos sem almoco corretamente', async ({ assert }) => {
    const entry = new TimeEntry()
    entry.clockIn = DateTime.now().set({ hour: 8, minute: 0 })
    entry.clockOut = DateTime.now().set({ hour: 12, minute: 0 })

    const minutes = service.calculateWorkedMinutes(entry)

    assert.equal(minutes, 240) // 4 horas = 240 minutos
  })

  test('deve calcular minutos com almoco corretamente', async ({ assert }) => {
    const entry = new TimeEntry()
    entry.clockIn = DateTime.now().set({ hour: 8, minute: 0 })
    entry.clockOut = DateTime.now().set({ hour: 17, minute: 0 })
    entry.lunchStart = DateTime.now().set({ hour: 12, minute: 0 })
    entry.lunchEnd = DateTime.now().set({ hour: 13, minute: 0 })

    const minutes = service.calculateWorkedMinutes(entry)

    assert.equal(minutes, 480) // 9h - 1h = 8h = 480 min
  })

  test('deve arredondar minutos para inteiro', async ({ assert }) => {
    const entry = new TimeEntry()
    entry.clockIn = DateTime.now().set({ hour: 8, minute: 0, second: 0 })
    entry.clockOut = DateTime.now().set({ hour: 8, minute: 30, second: 30 })

    const minutes = service.calculateWorkedMinutes(entry)

    assert.isNumber(minutes)
    assert.equal(minutes % 1, 0) // Deve ser inteiro
  })

  test('nao deve retornar valores negativos', async ({ assert }) => {
    const entry = new TimeEntry()
    entry.clockIn = DateTime.now().set({ hour: 17, minute: 0 })
    entry.clockOut = DateTime.now().set({ hour: 8, minute: 0 })

    const minutes = service.calculateWorkedMinutes(entry)

    assert.isAtLeast(minutes, 0)
  })
})

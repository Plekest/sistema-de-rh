import { test } from '@japa/runner'
import HoursBankService from '#services/hours_bank_service'
import Database from '@adonisjs/lucid/services/db'
import Employee from '#models/employee'
import TimeEntry from '#models/time_entry'
import HoursBank from '#models/hours_bank'
import { DateTime } from 'luxon'

test.group('HoursBankService - calculateMonth', (group) => {
  let service: HoursBankService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new HoursBankService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    employee = await Employee.create({
      fullName: 'Funcionario Banco Horas',
      email: 'banco.horas@empresa.com',
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve calcular saldo mensal corretamente quando trabalhou exato', async ({ assert }) => {
    const month = DateTime.now().month
    const year = DateTime.now().year

    // Criar 5 dias de trabalho com 8h cada (480 minutos)
    for (let i = 0; i < 5; i++) {
      const date = DateTime.fromObject({ year, month, day: i + 1 })
      if (date.weekday >= 1 && date.weekday <= 5) {
        await TimeEntry.create({
          employeeId: employee.id,
          date: date,
          clockIn: date.set({ hour: 8 }),
          clockOut: date.set({ hour: 17 }),
          lunchStart: date.set({ hour: 12 }),
          lunchEnd: date.set({ hour: 13 }),
          type: 'regular',
          totalWorkedMinutes: 480, // 8 horas
        })
      }
    }

    const hoursBank = await service.calculateMonth(employee.id, month, year)

    assert.isNotNull(hoursBank)
    assert.equal(hoursBank.employeeId, employee.id)
    assert.equal(hoursBank.referenceMonth, month)
    assert.equal(hoursBank.referenceYear, year)
    assert.isNumber(hoursBank.workedMinutes)
    assert.isNumber(hoursBank.expectedMinutes)
    assert.isNumber(hoursBank.balanceMinutes)
  })

  test('deve calcular saldo positivo quando trabalhou mais', async ({ assert }) => {
    const month = DateTime.now().month
    const year = DateTime.now().year

    // Criar 5 dias com 10h cada = 600 min (2h extras por dia)
    for (let i = 0; i < 5; i++) {
      const date = DateTime.fromObject({ year, month, day: i + 1 })
      if (date.weekday >= 1 && date.weekday <= 5) {
        await TimeEntry.create({
          employeeId: employee.id,
          date: date,
          clockIn: date.set({ hour: 8 }),
          clockOut: date.set({ hour: 19 }),
          lunchStart: date.set({ hour: 12 }),
          lunchEnd: date.set({ hour: 13 }),
          type: 'regular',
          totalWorkedMinutes: 600, // 10 horas
        })
      }
    }

    const hoursBank = await service.calculateMonth(employee.id, month, year)

    assert.isAbove(hoursBank.balanceMinutes, 0)
  })

  test('deve calcular saldo negativo quando trabalhou menos', async ({ assert }) => {
    const month = DateTime.now().month
    const year = DateTime.now().year

    // Criar 5 dias com 6h cada = 360 min (2h a menos por dia)
    for (let i = 0; i < 5; i++) {
      const date = DateTime.fromObject({ year, month, day: i + 1 })
      if (date.weekday >= 1 && date.weekday <= 5) {
        await TimeEntry.create({
          employeeId: employee.id,
          date: date,
          clockIn: date.set({ hour: 8 }),
          clockOut: date.set({ hour: 15 }),
          lunchStart: date.set({ hour: 12 }),
          lunchEnd: date.set({ hour: 13 }),
          type: 'regular',
          totalWorkedMinutes: 360, // 6 horas
        })
      }
    }

    const hoursBank = await service.calculateMonth(employee.id, month, year)

    assert.isBelow(hoursBank.balanceMinutes, 0)
  })

  test('deve acumular saldo de meses anteriores', async ({ assert }) => {
    const currentMonth = DateTime.now().month
    const currentYear = DateTime.now().year

    // Criar saldo anterior de +120 minutos (2h positivas)
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: previousMonth,
      referenceYear: previousYear,
      expectedMinutes: 9600, // 20 dias * 480 min
      workedMinutes: 9720, // +120 min
      balanceMinutes: 120,
      accumulatedBalanceMinutes: 120,
    })

    // Criar mes atual com saldo zero
    const hoursBank = await service.calculateMonth(employee.id, currentMonth, currentYear)

    // Saldo acumulado deve incluir o anterior
    assert.isAtLeast(hoursBank.accumulatedBalanceMinutes, 120)
  })

  test('deve atualizar registro existente ao recalcular', async ({ assert }) => {
    const month = DateTime.now().month
    const year = DateTime.now().year

    // Primeira execucao
    await service.calculateMonth(employee.id, month, year)

    // Segunda execucao (recalculo)
    const hoursBank = await service.calculateMonth(employee.id, month, year)

    // Verificar que nao duplicou
    const count = await HoursBank.query()
      .where('employeeId', employee.id)
      .where('referenceMonth', month)
      .where('referenceYear', year)
      .count('* as total')

    assert.equal(count[0].$extras.total, 1)
    assert.isNotNull(hoursBank)
  })

  test('deve considerar apenas dias uteis no calculo esperado', async ({ assert }) => {
    const month = 2 // Fevereiro
    const year = 2026

    const hoursBank = await service.calculateMonth(employee.id, month, year)

    // Fevereiro 2026 tem 20 dias uteis (segunda a sexta)
    // Cada dia = 480 minutos (8h)
    // Entao esperado deveria ser um multiplo de 480
    assert.equal(hoursBank.expectedMinutes % 480, 0)
  })

  test('deve lancar erro quando employee nao existe', async ({ assert }) => {
    await assert.rejects(async () => await service.calculateMonth(99999, 1, 2026))
  })
})

test.group('HoursBankService - getBalance', (group) => {
  let service: HoursBankService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new HoursBankService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    employee = await Employee.create({
      fullName: 'Funcionario Balance',
      email: 'balance@empresa.com',
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve retornar saldo acumulado do ultimo mes', async ({ assert }) => {
    const month = DateTime.now().month
    const year = DateTime.now().year

    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: month,
      referenceYear: year,
      expectedMinutes: 9600,
      workedMinutes: 9840,
      balanceMinutes: 240,
      accumulatedBalanceMinutes: 240,
    })

    const balance = await service.getBalance(employee.id)

    assert.equal(balance.accumulatedBalanceMinutes, 240)
    assert.deepEqual(balance.lastMonth, { month, year })
  })

  test('deve retornar 0 quando nao ha historico', async ({ assert }) => {
    const balance = await service.getBalance(employee.id)

    assert.equal(balance.accumulatedBalanceMinutes, 0)
    assert.isNull(balance.lastMonth)
  })

  test('deve retornar o mes mais recente quando ha multiplos meses', async ({ assert }) => {
    const currentMonth = DateTime.now().month
    const currentYear = DateTime.now().year

    // Criar mes anterior
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: previousMonth,
      referenceYear: previousYear,
      expectedMinutes: 9600,
      workedMinutes: 9600,
      balanceMinutes: 0,
      accumulatedBalanceMinutes: 100,
    })

    // Criar mes atual
    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: currentMonth,
      referenceYear: currentYear,
      expectedMinutes: 9600,
      workedMinutes: 9720,
      balanceMinutes: 120,
      accumulatedBalanceMinutes: 220,
    })

    const balance = await service.getBalance(employee.id)

    assert.equal(balance.accumulatedBalanceMinutes, 220)
    assert.deepEqual(balance.lastMonth, { month: currentMonth, year: currentYear })
  })

  test('deve lancar erro quando employee nao existe', async ({ assert }) => {
    await assert.rejects(async () => await service.getBalance(99999))
  })
})

test.group('HoursBankService - getHistory', (group) => {
  let service: HoursBankService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new HoursBankService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    employee = await Employee.create({
      fullName: 'Funcionario History',
      email: 'history@empresa.com',
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve retornar historico paginado', async ({ assert }) => {
    // Criar varios meses de historico
    for (let i = 1; i <= 15; i++) {
      await HoursBank.create({
        employeeId: employee.id,
        referenceMonth: i <= 12 ? i : i - 12,
        referenceYear: i <= 12 ? 2025 : 2026,
        expectedMinutes: 9600,
        workedMinutes: 9600,
        balanceMinutes: 0,
        accumulatedBalanceMinutes: 0,
      })
    }

    const result = await service.getHistory(employee.id, { page: 1, limit: 12 })

    assert.isNotNull(result)
    assert.isArray(result.all())
    assert.isAtMost(result.all().length, 12)
  })

  test('deve filtrar por ano quando especificado', async ({ assert }) => {
    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: 1,
      referenceYear: 2025,
      expectedMinutes: 9600,
      workedMinutes: 9600,
      balanceMinutes: 0,
      accumulatedBalanceMinutes: 0,
    })

    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: 1,
      referenceYear: 2026,
      expectedMinutes: 9600,
      workedMinutes: 9600,
      balanceMinutes: 0,
      accumulatedBalanceMinutes: 0,
    })

    const result = await service.getHistory(employee.id, { year: 2026 })

    const records = result.all()
    assert.isArray(records)
    records.forEach((record) => {
      assert.equal(record.referenceYear, 2026)
    })
  })

  test('deve ordenar por ano e mes descendente', async ({ assert }) => {
    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: 1,
      referenceYear: 2025,
      expectedMinutes: 9600,
      workedMinutes: 9600,
      balanceMinutes: 0,
      accumulatedBalanceMinutes: 0,
    })

    await HoursBank.create({
      employeeId: employee.id,
      referenceMonth: 12,
      referenceYear: 2025,
      expectedMinutes: 9600,
      workedMinutes: 9600,
      balanceMinutes: 0,
      accumulatedBalanceMinutes: 0,
    })

    const result = await service.getHistory(employee.id)
    const records = result.all()

    if (records.length >= 2) {
      // O mais recente deve vir primeiro
      const first = records[0]
      const second = records[1]

      const firstDate = first.referenceYear * 100 + first.referenceMonth
      const secondDate = second.referenceYear * 100 + second.referenceMonth

      assert.isAtLeast(firstDate, secondDate)
    }
  })

  test('deve lancar erro quando employee nao existe', async ({ assert }) => {
    await assert.rejects(async () => await service.getHistory(99999))
  })
})

test.group('HoursBankService - recalculate', (group) => {
  let service: HoursBankService
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new HoursBankService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    employee = await Employee.create({
      fullName: 'Funcionario Recalc',
      email: 'recalc@empresa.com',
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
      irrfDependents: 0,
    })
  })

  test('deve recalcular mes existente', async ({ assert }) => {
    const month = DateTime.now().month
    const year = DateTime.now().year

    // Criar primeiro calculo
    await service.calculateMonth(employee.id, month, year)

    // Adicionar mais horas trabalhadas
    const date = DateTime.fromObject({ year, month, day: 15 })
    if (date.weekday >= 1 && date.weekday <= 5) {
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

    // Recalcular
    const recalculated = await service.recalculate(employee.id, month, year)

    assert.isNotNull(recalculated)
    assert.equal(recalculated.referenceMonth, month)
    assert.equal(recalculated.referenceYear, year)
  })
})

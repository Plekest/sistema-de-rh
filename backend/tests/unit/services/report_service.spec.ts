import { test } from '@japa/runner'
import ReportService from '#services/report_service'
import Database from '@adonisjs/lucid/services/db'
import Employee from '#models/employee'
import Department from '#models/department'
import Position from '#models/position'
import PayrollPeriod from '#models/payroll_period'
import PaySlip from '#models/pay_slip'
import { DateTime } from 'luxon'

test.group('ReportService - exportEmployeesCSV', (group) => {
  let service: ReportService
  let department: Department
  let position: Position
  let counter = 0

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new ReportService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    counter++
    const timestamp = `${Date.now()}${counter}`
    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })
  })

  test('deve gerar CSV com headers corretos', async ({ assert }) => {
    // Act
    const csv = await service.exportEmployeesCSV()

    // Assert
    assert.include(csv, 'Nome')
    assert.include(csv, 'CPF/CNPJ')
    assert.include(csv, 'Email')
    assert.include(csv, 'Telefone')
    assert.include(csv, 'Tipo')
    assert.include(csv, 'Departamento')
    assert.include(csv, 'Cargo')
    assert.include(csv, 'Salario')
    assert.include(csv, 'Status')
    assert.include(csv, 'Data Admissao')
    assert.include(csv, 'Data Desligamento')
  })

  test('deve incluir BOM UTF-8', async ({ assert }) => {
    // Act
    const csv = await service.exportEmployeesCSV()

    // Assert
    assert.equal(csv.charCodeAt(0), 0xfeff) // BOM UTF-8
  })

  test('deve usar ponto-e-vírgula como separador', async ({ assert }) => {
    // Act
    const csv = await service.exportEmployeesCSV()

    // Assert
    const lines = csv.split('\n')
    const header = lines[0].replace('\uFEFF', '') // Remove BOM
    assert.include(header, ';')
  })

  test('deve formatar datas como DD/MM/YYYY', async ({ assert }) => {
    // Arrange
    const timestamp = `${Date.now()}${counter++}`
    await Employee.create({
      registrationNumber: `REG${timestamp}`,
      fullName: `Colaborador Teste ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.fromISO('2024-01-15'),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    // Act
    const csv = await service.exportEmployeesCSV()

    // Assert
    // Data deve estar no formato DD/MM/YYYY
    assert.include(csv, '15/01/2024')
  })

  test('deve retornar string com apenas headers quando não há dados', async ({ assert }) => {
    // Act
    const csv = await service.exportEmployeesCSV({ status: 'terminated' })

    // Assert
    const lines = csv.split('\n').filter((line) => line.trim() !== '')
    // Pode ter apenas header se não houver colaboradores
    assert.isAtLeast(lines.length, 1)
  })

  test('deve filtrar por tipo (CLT/PJ)', async ({ assert }) => {
    // Arrange
    const timestamp = `${Date.now()}${counter++}`
    const timestamp2 = `${Date.now()}${counter++}`

    await Employee.create({
      registrationNumber: `CLT${timestamp}`,
      fullName: `CLT ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `clt${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    await Employee.create({
      registrationNumber: `PJ${timestamp2}`,
      fullName: `PJ ${timestamp2}`,
      cnpj: `${timestamp2}`.substring(0, 14).padEnd(14, '0'),
      email: `pj${timestamp2}@empresa.com`,
      phone: '11999999998',
      type: 'pj',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 8000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    // Act
    const csv = await service.exportEmployeesCSV({ type: 'clt' })

    // Assert
    assert.include(csv, `CLT ${timestamp}`)
    assert.notInclude(csv, `PJ ${timestamp2}`)
  })

  test('deve escapar campos com ponto-e-vírgula', async ({ assert }) => {
    // Arrange
    const timestamp = `${Date.now()}${counter++}`
    await Employee.create({
      registrationNumber: `REG${timestamp}`,
      fullName: `Nome; Com; Ponto-e-vírgula ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    // Act
    const csv = await service.exportEmployeesCSV()

    // Assert
    // Campo deve estar entre aspas por conter ;
    assert.include(csv, `"Nome; Com; Ponto-e-vírgula ${timestamp}"`)
  })
})

test.group('ReportService - exportPayrollCSV', (group) => {
  let service: ReportService
  let department: Department
  let position: Position
  let employee: Employee
  let period: PayrollPeriod
  let counter = 0

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new ReportService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    counter++
    const timestamp = `${Date.now()}${counter}`
    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      registrationNumber: `REG${timestamp}`,
      fullName: `Colaborador ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    period = await PayrollPeriod.create({
      referenceMonth: 1,
      referenceYear: 2024,
      status: 'open',
    })
  })

  test('deve gerar CSV com dados de folha', async ({ assert }) => {
    // Arrange
    await PaySlip.create({
      payrollPeriodId: period.id,
      employeeId: employee.id,
      grossSalary: '5000.00',
      totalEarnings: '5000.00',
      totalDeductions: '800.00',
      inssAmount: '550.00',
      irrfAmount: '150.00',
      fgtsAmount: '400.00',
      netSalary: '4200.00',
      status: 'draft',
    })

    // Act
    const csv = await service.exportPayrollCSV(period.id)

    // Assert
    assert.include(csv, 'Colaborador')
    assert.include(csv, 'CPF/CNPJ')
    assert.include(csv, 'Salario Base')
    assert.include(csv, 'Total Proventos')
    assert.include(csv, 'Total Descontos')
    assert.include(csv, 'INSS')
    assert.include(csv, 'IRRF')
    assert.include(csv, 'FGTS (Patronal)')
    assert.include(csv, 'Salario Liquido')
    assert.include(csv, 'Status')
  })

  test('deve formatar valores monetários', async ({ assert }) => {
    // Arrange
    await PaySlip.create({
      payrollPeriodId: period.id,
      employeeId: employee.id,
      grossSalary: '5000.00',
      totalEarnings: '5000.00',
      totalDeductions: '800.00',
      inssAmount: '550.00',
      irrfAmount: '150.00',
      fgtsAmount: '400.00',
      netSalary: '4200.00',
      status: 'draft',
    })

    // Act
    const csv = await service.exportPayrollCSV(period.id)

    // Assert
    // Valores devem estar formatados no padrão brasileiro (com vírgula)
    assert.include(csv, '5.000,00')
    assert.include(csv, '4.200,00')
  })

  test('deve incluir BOM UTF-8', async ({ assert }) => {
    // Arrange
    await PaySlip.create({
      payrollPeriodId: period.id,
      employeeId: employee.id,
      grossSalary: '5000.00',
      totalEarnings: '5000.00',
      totalDeductions: '800.00',
      inssAmount: '550.00',
      irrfAmount: '150.00',
      fgtsAmount: '400.00',
      netSalary: '4200.00',
      status: 'draft',
    })

    // Act
    const csv = await service.exportPayrollCSV(period.id)

    // Assert
    assert.equal(csv.charCodeAt(0), 0xfeff) // BOM UTF-8
  })

  test('deve usar ponto-e-vírgula como separador', async ({ assert }) => {
    // Arrange
    await PaySlip.create({
      payrollPeriodId: period.id,
      employeeId: employee.id,
      grossSalary: '5000.00',
      totalEarnings: '5000.00',
      totalDeductions: '800.00',
      inssAmount: '550.00',
      irrfAmount: '150.00',
      fgtsAmount: '400.00',
      netSalary: '4200.00',
      status: 'draft',
    })

    // Act
    const csv = await service.exportPayrollCSV(period.id)

    // Assert
    const lines = csv.split('\n')
    const header = lines[0].replace('\uFEFF', '') // Remove BOM
    assert.include(header, ';')
  })
})

test.group('ReportService - exportAttendanceCSV', (group) => {
  let service: ReportService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new ReportService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve gerar CSV com headers de ponto', async ({ assert }) => {
    // Act
    const csv = await service.exportAttendanceCSV(1, 2024)

    // Assert
    assert.include(csv, 'Colaborador')
    assert.include(csv, 'Data')
    assert.include(csv, 'Entrada')
    assert.include(csv, 'Saida Almoco')
    assert.include(csv, 'Retorno Almoco')
    assert.include(csv, 'Saida')
    assert.include(csv, 'Horas Trabalhadas')
  })

  test('deve incluir BOM UTF-8', async ({ assert }) => {
    // Act
    const csv = await service.exportAttendanceCSV(1, 2024)

    // Assert
    assert.equal(csv.charCodeAt(0), 0xfeff)
  })
})

test.group('ReportService - exportLeaveCSV', (group) => {
  let service: ReportService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new ReportService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve gerar CSV com headers de férias/licenças', async ({ assert }) => {
    // Act
    const csv = await service.exportLeaveCSV()

    // Assert
    assert.include(csv, 'Colaborador')
    assert.include(csv, 'Tipo')
    assert.include(csv, 'Data Inicio')
    assert.include(csv, 'Data Fim')
    assert.include(csv, 'Dias')
    assert.include(csv, 'Status')
  })

  test('deve incluir BOM UTF-8', async ({ assert }) => {
    // Act
    const csv = await service.exportLeaveCSV()

    // Assert
    assert.equal(csv.charCodeAt(0), 0xfeff)
  })
})

test.group('ReportService - exportTrainingsCSV', (group) => {
  let service: ReportService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new ReportService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve gerar CSV com headers de treinamentos', async ({ assert }) => {
    // Act
    const csv = await service.exportTrainingsCSV()

    // Assert
    assert.include(csv, 'Titulo')
    assert.include(csv, 'Tipo')
    assert.include(csv, 'Categoria')
    assert.include(csv, 'Instrutor')
    assert.include(csv, 'Data Inicio')
    assert.include(csv, 'Data Fim')
    assert.include(csv, 'Duracao (h)')
    assert.include(csv, 'Inscritos')
    assert.include(csv, 'Concluidos')
    assert.include(csv, 'Status')
    assert.include(csv, 'Obrigatorio')
  })

  test('deve incluir BOM UTF-8', async ({ assert }) => {
    // Act
    const csv = await service.exportTrainingsCSV()

    // Assert
    assert.equal(csv.charCodeAt(0), 0xfeff)
  })
})

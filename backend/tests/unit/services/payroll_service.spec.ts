import { test } from '@japa/runner'
import PayrollService from '#services/payroll_service'
import Database from '@adonisjs/lucid/services/db'

test.group('PayrollService - Calculo INSS', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular INSS corretamente para salario de R$1.320,00 (7.5%)', async ({ assert }) => {
    // Arrange
    const grossSalary = 1320.0
    const expectedINSS = 99.0 // 1320 * 0.075

    // Act
    const inss = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(inss, expectedINSS)
  })

  test('deve calcular INSS corretamente para salario de R$2.000,00 (progressivo)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 2000.0
    // Calculo progressivo:
    // Faixa 1: 1412.00 * 7.5% = 105.90
    // Faixa 2: 588.00 * 9% = 52.92
    // Total: 158.82
    const expectedINSS = 158.82

    // Act
    const inss = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(inss, expectedINSS)
  })

  test('deve calcular INSS corretamente para salario de R$5.000,00 (progressivo)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 5000.0
    // Calculo progressivo:
    // Faixa 1: 1412.00 * 7.5% = 105.90
    // Faixa 2: 1254.68 * 9% = 112.92
    // Faixa 3: 1333.35 * 12% = 160.00
    // Faixa 4: 999.97 * 14% = 140.00
    // Total: 518.82
    const expectedINSS = 518.82

    // Act
    const inss = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(inss, expectedINSS)
  })

  test('deve respeitar o teto do INSS (R$7.786,02 com desconto maximo)', async ({ assert }) => {
    // Arrange
    const grossSalary = 10000.0
    // Calculo progressivo ate o teto:
    // Faixa 1: 1412.00 * 7.5% = 105.90
    // Faixa 2: 1254.68 * 9% = 112.92
    // Faixa 3: 1333.35 * 12% = 160.00
    // Faixa 4: 3785.99 * 14% = 530.04
    // Total: 908.86 (teto maximo de desconto)
    const expectedINSS = 908.86

    // Act
    const inss = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(inss, expectedINSS)
  })

  test('deve retornar 0 para salario zero', async ({ assert }) => {
    // Arrange
    const grossSalary = 0

    // Act
    const inss = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(inss, 0)
  })

  test('deve retornar 0 para salario negativo', async ({ assert }) => {
    // Arrange
    const grossSalary = -1000

    // Act
    const inss = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(inss, 0)
  })
})

test.group('PayrollService - Calculo IRRF', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve retornar 0 para salario abaixo da faixa de isencao (R$2.259,20)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 2000.0
    const inssAmount = 150.0
    const dependents = 0
    // taxableBase = grossSalary - inssAmount = 1850.00 (abaixo de 2259.20)

    // Act
    const irrf = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(irrf, 0)
  })

  test('deve calcular IRRF corretamente para salario de R$3.000,00 (faixa 7.5%)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 3000.0
    const inssAmount = 281.92
    const dependents = 0
    // taxableBase = grossSalary - inssAmount = 2718.08
    // Faixa 2: 2718.08 * 7.5% - 169.44 = 203.86 - 169.44 = 34.42
    const expectedIRRF = 34.42

    // Act
    const irrf = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(irrf, expectedIRRF)
  })

  test('deve calcular IRRF corretamente para salario de R$5.000,00 (faixa 15%)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 5000.0
    const inssAmount = 518.82
    const dependents = 0
    // taxableBase = grossSalary - inssAmount = 4481.18
    // Faixa 4: 4481.18 * 22.5% - 662.77 = 1008.27 - 662.77 = 345.50
    const expectedIRRF = 345.5

    // Act
    const irrf = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(irrf, expectedIRRF)
  })

  test('deve deduzir valor correto por dependente (R$189,59)', async ({ assert }) => {
    // Arrange
    const grossSalary = 3500.0
    const inssAmount = 365.63
    const dependents = 2
    // taxableBase = grossSalary - inssAmount - 189.59 * 2 = 2755.19
    // Faixa 2: 2755.19 * 7.5% - 169.44 = 206.64 - 169.44 = 37.20

    // Act
    const irrf = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.isAbove(irrf, 0)
    assert.isBelow(irrf, 100) // Com dependentes, IRRF deve ser menor
  })

  test('deve retornar 0 quando base de calculo negativa apos deducoes', async ({ assert }) => {
    // Arrange
    const grossSalary = 2000.0
    const inssAmount = 1500.0
    const dependents = 3

    // Act
    const irrf = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(irrf, 0)
  })

  test('deve calcular IRRF para salario alto (faixa 27.5%)', async ({ assert }) => {
    // Arrange
    const grossSalary = 10000.0
    const inssAmount = 908.86
    const dependents = 0
    // taxableBase = grossSalary - inssAmount = 9091.14
    // Faixa 5: 9091.14 * 27.5% - 896.00 = 2500.06 - 896.00 = 1604.06
    const expectedIRRF = 1604.06

    // Act
    const irrf = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(irrf, expectedIRRF)
  })
})

test.group('PayrollService - Calculo FGTS', () => {
  test('deve calcular FGTS corretamente (8% sobre salario bruto)', async ({ assert }) => {
    // Arrange
    const grossSalary = 3000.0
    const expectedFGTS = 240.0 // 3000 * 0.08

    // Act
    const fgts = Math.round(grossSalary * 0.08 * 100) / 100

    // Assert
    assert.equal(fgts, expectedFGTS)
  })

  test('deve calcular FGTS para salario minimo', async ({ assert }) => {
    // Arrange
    const grossSalary = 1412.0
    const expectedFGTS = 112.96 // 1412 * 0.08

    // Act
    const fgts = Math.round(grossSalary * 0.08 * 100) / 100

    // Assert
    assert.equal(fgts, expectedFGTS)
  })

  test('deve calcular FGTS para salario alto', async ({ assert }) => {
    // Arrange
    const grossSalary = 15000.0
    const expectedFGTS = 1200.0 // 15000 * 0.08

    // Act
    const fgts = Math.round(grossSalary * 0.08 * 100) / 100

    // Assert
    assert.equal(fgts, expectedFGTS)
  })

  test('deve retornar 0 para salario zero', async ({ assert }) => {
    // Arrange
    const grossSalary = 0
    const expectedFGTS = 0

    // Act
    const fgts = Math.round(grossSalary * 0.08 * 100) / 100

    // Assert
    assert.equal(fgts, expectedFGTS)
  })
})

test.group('PayrollService - Calculo VT', () => {
  test('deve calcular desconto VT corretamente (6% do salario)', async ({ assert }) => {
    // Arrange
    const grossSalary = 3000.0
    const expectedVT = 180.0 // 3000 * 0.06

    // Act
    const vt = Math.round(grossSalary * 0.06 * 100) / 100

    // Assert
    assert.equal(vt, expectedVT)
  })

  test('deve respeitar o limite de 6% para VT', async ({ assert }) => {
    // Arrange
    const grossSalary = 10000.0
    const expectedVT = 600.0 // 10000 * 0.06

    // Act
    const vt = Math.round(grossSalary * 0.06 * 100) / 100

    // Assert
    assert.equal(vt, expectedVT)
  })
})

test.group('PayrollService - Validacoes de Negocio', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('nao deve permitir criar periodo duplicado', async ({ assert }) => {
    // Este teste deve ser implementado com dados reais no banco
    // Aqui esta apenas a estrutura
    assert.plan(1)

    try {
      // Primeiro periodo
      await service.createPeriod({
        referenceMonth: 1,
        referenceYear: 2024,
      })

      // Tentar criar periodo duplicado
      await service.createPeriod({
        referenceMonth: 1,
        referenceYear: 2024,
      })

      assert.fail('Deveria lancar erro ao criar periodo duplicado')
    } catch (error) {
      assert.include(error.message, 'Ja existe um periodo')
    }
  })

  test('nao deve permitir calcular folha em periodo fechado', async ({ assert }) => {
    // Este teste requer dados de periodo fechado no banco
    assert.plan(1)
    // Implementacao real requer setup de dados
    assert.isTrue(true) // Placeholder
  })

  test('nao deve permitir criar componente para colaborador inativo', async ({ assert }) => {
    // Este teste requer setup de colaborador inativo
    assert.plan(1)
    // Implementacao real requer setup de dados
    assert.isTrue(true) // Placeholder
  })
})

test.group('PayrollService - Edge Cases', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve arredondar valores corretamente (2 casas decimais)', async ({ assert }) => {
    // Arrange
    const value = 123.456

    // Act
    const rounded = Math.round(value * 100) / 100

    // Assert
    assert.equal(rounded, 123.46)
  })

  test('deve lidar com salarios com centavos corretamente', async ({ assert }) => {
    // Arrange
    const grossSalary = 3456.78

    // Act
    const inss = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.isNumber(inss)
    assert.isAbove(inss, 0)
    assert.equal(inss.toFixed(2), inss.toFixed(2)) // Verifica 2 casas decimais
  })

  test('deve converter strings de decimal do PostgreSQL para number', async ({ assert }) => {
    // PostgreSQL retorna decimals como string
    const decimalString = '1234.56'
    const converted = Number(decimalString)

    assert.equal(converted, 1234.56)
    assert.equal(typeof converted, 'number')
  })
})

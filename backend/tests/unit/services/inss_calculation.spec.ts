import { test } from '@japa/runner'
import PayrollService from '#services/payroll_service'
import Database from '@adonisjs/lucid/services/db'

/**
 * Testes unitarios para o calculo progressivo de INSS.
 *
 * Tabela INSS 2024:
 *   Faixa 1: Ate R$1.412,00         -> 7,5%
 *   Faixa 2: De R$1.412,01 a R$2.666,68 -> 9,0%
 *   Faixa 3: De R$2.666,69 a R$4.000,03 -> 12,0%
 *   Faixa 4: De R$4.000,04 a R$7.786,02 -> 14,0%
 *
 * O calculo e PROGRESSIVO: cada faixa tributa apenas a parcela
 * do salario que se encontra dentro dela.
 *
 * Teto maximo de contribuicao: R$908,86 (salario R$7.786,02).
 */

test.group('Calculo INSS Progressivo - Faixa 1 (7.5%)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular INSS para salario R$1.000,00 (inteiramente na faixa 1)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 1000.0
    // Calculo: 1000.00 * 7.5% = 75.00
    const expected = 75.0

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular INSS para salario R$1.412,00 (fronteira exata da faixa 1)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 1412.0
    // Calculo: 1412.00 * 7.5% = 105.90
    const expected = 105.9

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular INSS para salario minimo R$1.412,00', async ({ assert }) => {
    // Arrange - salario minimo 2024
    const grossSalary = 1412.0
    // Calculo: toda a faixa 1 = 1412 * 0.075 = 105.90
    const expected = 105.9

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo INSS Progressivo - Faixa 2 (9.0%)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular INSS para salario R$2.000,00 (faixa 1 + parcial faixa 2)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 2000.0
    // Calculo progressivo:
    //   Faixa 1: 1412.00 * 7.5%  = 105.90
    //   Faixa 2: (2000.00 - 1412.00) * 9.0% = 588.00 * 9% = 52.92
    //   Total: 105.90 + 52.92 = 158.82
    const expected = 158.82

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular INSS para salario R$2.666,68 (fronteira exata da faixa 2)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 2666.68
    // Calculo progressivo:
    //   Faixa 1: 1412.00 * 7.5%  = 105.90
    //   Faixa 2: (2666.68 - 1412.00) * 9.0% = 1254.68 * 9% = 112.9212 -> arredonda 112.92
    //   Total: 105.90 + 112.92 = 218.82
    const expected = 218.82

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo INSS Progressivo - Faixa 3 (12.0%)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular INSS para salario R$3.000,00 (faixas 1 + 2 + parcial 3)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 3000.0
    // Calculo progressivo:
    //   Faixa 1: 1412.00 * 7.5%  = 105.90
    //   Faixa 2: 1254.68 * 9.0%  = 112.9212
    //   Faixa 3: (3000.00 - 2666.68) * 12.0% = 333.32 * 12% = 39.9984
    //   Total: 105.90 + 112.9212 + 39.9984 = 258.8196 -> arredonda 258.82
    const expected = 258.82

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular INSS para salario R$4.000,03 (fronteira exata da faixa 3)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 4000.03
    // Calculo progressivo:
    //   Faixa 1: 1412.00 * 7.5%  = 105.90
    //   Faixa 2: 1254.68 * 9.0%  = 112.9212
    //   Faixa 3: (4000.03 - 2666.68) * 12.0% = 1333.35 * 12% = 160.002
    //   Total: 105.90 + 112.9212 + 160.002 = 378.8232 -> arredonda 378.82
    const expected = 378.82

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo INSS Progressivo - Faixa 4 (14.0%)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular INSS para salario R$5.000,00 (faixas 1 a 4)', async ({ assert }) => {
    // Arrange
    const grossSalary = 5000.0
    // Calculo progressivo:
    //   Faixa 1: 1412.00 * 7.5%  = 105.90
    //   Faixa 2: 1254.68 * 9.0%  = 112.9212
    //   Faixa 3: 1333.35 * 12.0% = 160.002
    //   Faixa 4: (5000.00 - 4000.03) * 14.0% = 999.97 * 14% = 139.9958
    //   Total: 105.90 + 112.9212 + 160.002 + 139.9958 = 518.819 -> arredonda 518.82
    const expected = 518.82

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular INSS para salario R$7.786,02 (teto exato do INSS)', async ({ assert }) => {
    // Arrange
    const grossSalary = 7786.02
    // Calculo progressivo (teto):
    //   Faixa 1: 1412.00 * 7.5%  = 105.90
    //   Faixa 2: 1254.68 * 9.0%  = 112.9212
    //   Faixa 3: 1333.35 * 12.0% = 160.002
    //   Faixa 4: (7786.02 - 4000.03) * 14.0% = 3785.99 * 14% = 530.0386
    //   Total: 105.90 + 112.9212 + 160.002 + 530.0386 = 908.8618 -> arredonda 908.86
    const expected = 908.86

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo INSS Progressivo - Acima do Teto', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve limitar INSS ao teto para salario R$10.000,00 (acima do teto)', async ({
    assert,
  }) => {
    // Arrange
    const grossSalary = 10000.0
    // O calculo deve usar cappedSalary = min(10000, 7786.02) = 7786.02
    // Resultado identico ao teto: R$908.86
    const expected = 908.86

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve limitar INSS ao teto para salario R$50.000,00', async ({ assert }) => {
    // Arrange
    const grossSalary = 50000.0
    // Mesmo resultado do teto independente de quanto acima estiver
    const expected = 908.86

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve retornar o mesmo valor para qualquer salario acima de R$7.786,02', async ({
    assert,
  }) => {
    // Arrange - testa varios salarios acima do teto
    const salaries = [7786.02, 8000, 10000, 15000, 20000, 50000, 100000]

    // Act
    const results: number[] = []
    for (const salary of salaries) {
      const inss = await (service as any).calculateINSS(salary)
      results.push(inss)
    }

    // Assert - todos devem ser iguais ao teto
    const tetoINSS = results[0]
    for (let i = 1; i < results.length; i++) {
      assert.equal(results[i], tetoINSS, `Salario ${salaries[i]} deveria retornar ${tetoINSS}`)
    }
  })
})

test.group('Calculo INSS Progressivo - Edge Cases', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve retornar 0 para salario R$0,00', async ({ assert }) => {
    // Arrange
    const grossSalary = 0

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, 0)
  })

  test('deve retornar 0 para salario negativo', async ({ assert }) => {
    // Arrange
    const grossSalary = -1000

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, 0)
  })

  test('deve calcular corretamente para salario com centavos R$1.234,56', async ({ assert }) => {
    // Arrange
    const grossSalary = 1234.56
    // Calculo: 1234.56 * 7.5% = 92.592 -> arredonda 92.59
    const expected = 92.59

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular corretamente para salario R$0,01 (1 centavo)', async ({ assert }) => {
    // Arrange
    const grossSalary = 0.01
    // Calculo: 0.01 * 7.5% = 0.00075 -> arredonda 0.00
    const expected = 0.0

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
  })

  test('deve arredondar para 2 casas decimais', async ({ assert }) => {
    // Arrange - valor que gera muitas casas decimais
    const grossSalary = 1500.0
    // Calculo progressivo:
    //   Faixa 1: 1412.00 * 7.5% = 105.90
    //   Faixa 2: (1500.00 - 1412.00) * 9.0% = 88.00 * 9% = 7.92
    //   Total: 105.90 + 7.92 = 113.82
    const expected = 113.82

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert
    assert.equal(result, expected)
    // Verifica que tem no maximo 2 casas decimais
    const parts = result.toString().split('.')
    if (parts.length > 1) {
      assert.isAtMost(parts[1].length, 2)
    }
  })

  test('deve tratar string numerica como input (PostgreSQL retorna decimals como string)', async ({
    assert,
  }) => {
    // Arrange - simula valor vindo do PostgreSQL como string
    const grossSalaryAsString = '3000.00' as any

    // Act
    const result = await (service as any).calculateINSS(grossSalaryAsString)

    // Assert - toNumber() no service deve converter corretamente
    assert.isNumber(result)
    assert.isAbove(result, 0)
  })
})

test.group('Calculo INSS - Fallback vs Tabela Dinamica', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve usar fallback quando nao ha tabela no banco', async ({ assert }) => {
    // Arrange - sem dados na tabela tax_tables para INSS
    // O metodo calculateINSS busca da tabela e, se vazia, usa fallback
    const grossSalary = 3000.0

    // Act
    const result = await (service as any).calculateINSS(grossSalary)

    // Assert - deve retornar valor valido (do fallback)
    assert.isNumber(result)
    assert.isAbove(result, 0)
    // Valor esperado pelo fallback: R$258.82
    assert.equal(result, 258.82)
  })

  test('calculateINSSFallback deve ser consistente com calculo manual', async ({ assert }) => {
    // Testa o metodo de fallback diretamente
    const testCases = [
      { salary: 1000, expected: 75.0 },
      { salary: 1412, expected: 105.9 },
      { salary: 2000, expected: 158.82 },
      { salary: 3000, expected: 258.82 },
      { salary: 5000, expected: 518.82 },
      { salary: 7786.02, expected: 908.86 },
      { salary: 10000, expected: 908.86 },
    ]

    for (const tc of testCases) {
      const result = (service as any).calculateINSSFallback(tc.salary)
      assert.equal(
        result,
        tc.expected,
        `Para salario R$${tc.salary}: esperado R$${tc.expected}, obtido R$${result}`
      )
    }
  })
})

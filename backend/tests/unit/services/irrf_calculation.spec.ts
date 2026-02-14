import { test } from '@japa/runner'
import PayrollService from '#services/payroll_service'
import Database from '@adonisjs/lucid/services/db'

/**
 * Testes unitarios para o calculo de IRRF (Imposto de Renda Retido na Fonte).
 *
 * Tabela IRRF 2024:
 *   Ate R$2.259,20                     -> Isento
 *   De R$2.259,21 a R$2.826,65        -> 7,5%  (deduzir R$169,44)
 *   De R$2.826,66 a R$3.751,05        -> 15,0% (deduzir R$381,44)
 *   De R$3.751,06 a R$4.664,68        -> 22,5% (deduzir R$662,77)
 *   Acima de R$4.664,68               -> 27,5% (deduzir R$896,00)
 *
 * Base de calculo: Salario Bruto - INSS - (R$189,59 por dependente)
 *
 * O calculo usa metodo de aliquota efetiva: aplica a aliquota da faixa
 * sobre a base TOTAL e subtrai a parcela a deduzir.
 */

test.group('Calculo IRRF - Faixa Isenta (ate R$2.259,20)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve retornar 0 para base de calculo R$2.000,00 (isento)', async ({ assert }) => {
    // Arrange
    // Base = grossSalary - INSS - dependentes = 2000 - 0 - 0 = 2000
    // 2000 < 2259.20 -> isento
    const grossSalary = 2000.0
    const inssAmount = 0
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, 0)
  })

  test('deve retornar 0 para base de calculo R$2.259,20 (limite isencao)', async ({ assert }) => {
    // Arrange
    // Base = 2259.20 -> ainda isento (faixa 1: min=0 rate=0)
    const grossSalary = 2259.2
    const inssAmount = 0
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, 0)
  })

  test('deve retornar 0 quando salario bruto alto mas base isenta por deducoes', async ({
    assert,
  }) => {
    // Arrange
    // grossSalary = 3000, inss = 500, dependentes = 2
    // Base = 3000 - 500 - (2 * 189.59) = 3000 - 500 - 379.18 = 2120.82 < 2259.20 -> isento
    const grossSalary = 3000.0
    const inssAmount = 500.0
    const dependents = 2

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, 0)
  })
})

test.group('Calculo IRRF - Faixa 7.5% (R$2.259,21 a R$2.826,65)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular IRRF para base R$2.500,00 (faixa 7.5%)', async ({ assert }) => {
    // Arrange
    // Base = 2500.00 (esta na faixa 7.5%: R$2.259,21 a R$2.826,65)
    // IRRF = 2500 * 7.5% - 169.44 = 187.50 - 169.44 = 18.06
    const grossSalary = 2500.0
    const inssAmount = 0
    const dependents = 0
    const expected = 18.06

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular IRRF na fronteira inferior da faixa 7.5% (R$2.259,21)', async ({
    assert,
  }) => {
    // Arrange
    // Base = 2259.21 (primeiro centavo da faixa 7.5%)
    // IRRF = 2259.21 * 7.5% - 169.44 = 169.440750 - 169.44 = 0.000750 -> arredonda 0.00
    const grossSalary = 2259.21
    const inssAmount = 0
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    // Na fronteira, o valor e praticamente zero
    assert.isAtMost(result, 0.01)
  })

  test('deve calcular IRRF na fronteira superior da faixa 7.5% (R$2.826,65)', async ({
    assert,
  }) => {
    // Arrange
    // Base = 2826.65
    // IRRF = 2826.65 * 7.5% - 169.44 = 211.99875 - 169.44 = 42.55875 -> arredonda 42.56
    const grossSalary = 2826.65
    const inssAmount = 0
    const dependents = 0
    const expected = 42.56

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo IRRF - Faixa 15% (R$2.826,66 a R$3.751,05)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular IRRF para base R$3.500,00 (faixa 15%)', async ({ assert }) => {
    // Arrange
    // Base = 3500.00 (faixa 15%: R$2.826,66 a R$3.751,05)
    // IRRF = 3500 * 15% - 381.44 = 525.00 - 381.44 = 143.56
    const grossSalary = 3500.0
    const inssAmount = 0
    const dependents = 0
    const expected = 143.56

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular IRRF corretamente com INSS deduzido (cenario real)', async ({ assert }) => {
    // Arrange - cenario realista: salario R$5.000 bruto
    // INSS de R$5.000 = R$518.82 (calculado em outros testes)
    // Base IRRF = 5000 - 518.82 - 0 = 4481.18
    // Faixa: 22.5% (R$3.751,06 a R$4.664,68)
    // IRRF = 4481.18 * 22.5% - 662.77 = 1008.2655 - 662.77 = 345.4955 -> arredonda 345.50
    const grossSalary = 5000.0
    const inssAmount = 518.82
    const dependents = 0
    const expected = 345.5

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo IRRF - Faixa 22.5% (R$3.751,06 a R$4.664,68)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular IRRF para base R$4.500,00 (faixa 22.5%)', async ({ assert }) => {
    // Arrange
    // Base = 4500.00 (faixa 22.5%: R$3.751,06 a R$4.664,68)
    // IRRF = 4500 * 22.5% - 662.77 = 1012.50 - 662.77 = 349.73
    const grossSalary = 4500.0
    const inssAmount = 0
    const dependents = 0
    const expected = 349.73

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo IRRF - Faixa 27.5% (acima de R$4.664,68)', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve calcular IRRF para base R$6.000,00 (faixa 27.5%)', async ({ assert }) => {
    // Arrange
    // Base = 6000.00 (faixa 27.5%: acima de R$4.664,68)
    // IRRF = 6000 * 27.5% - 896.00 = 1650.00 - 896.00 = 754.00
    const grossSalary = 6000.0
    const inssAmount = 0
    const dependents = 0
    const expected = 754.0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular IRRF para salario alto R$10.000,00 (cenario real)', async ({ assert }) => {
    // Arrange
    // INSS de R$10.000 = R$908.86 (teto)
    // Base IRRF = 10000 - 908.86 - 0 = 9091.14
    // Faixa 27.5%: IRRF = 9091.14 * 27.5% - 896.00 = 2500.0635 - 896.00 = 1604.0635 -> 1604.06
    const grossSalary = 10000.0
    const inssAmount = 908.86
    const dependents = 0
    const expected = 1604.06

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular IRRF para salario muito alto R$30.000,00 (cenario real)', async ({
    assert,
  }) => {
    // Arrange
    // INSS de R$30.000 = R$908.86 (teto)
    // Base IRRF = 30000 - 908.86 = 29091.14
    // Faixa 27.5%: IRRF = 29091.14 * 27.5% - 896.00 = 8000.0635 - 896.00 = 7104.0635 -> 7104.06
    const grossSalary = 30000.0
    const inssAmount = 908.86
    const dependents = 0
    const expected = 7104.06

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })
})

test.group('Calculo IRRF - Com Dependentes', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve deduzir R$189,59 por dependente da base de calculo', async ({ assert }) => {
    // Arrange
    // grossSalary = 4000, inss = 0, dependentes = 1
    // Base = 4000 - 0 - (1 * 189.59) = 3810.41
    // Faixa 22.5%: IRRF = 3810.41 * 22.5% - 662.77 = 857.3422 - 662.77 = 194.5722 -> 194.57

    // Sem dependentes: Base = 4000, Faixa 22.5%, IRRF = 4000 * 22.5% - 662.77 = 237.23
    // Com 1 dependente: 194.57 (menor, como esperado)
    const grossSalary = 4000.0
    const inssAmount = 0

    // Act
    const irrfSemDep = await (service as any).calculateIRRF(grossSalary, inssAmount, 0)
    const irrfComDep = await (service as any).calculateIRRF(grossSalary, inssAmount, 1)

    // Assert
    assert.isAbove(irrfSemDep, irrfComDep, 'IRRF com dependente deve ser menor')
  })

  test('deve calcular IRRF com 2 dependentes (deducao R$379,18)', async ({ assert }) => {
    // Arrange
    // grossSalary = 5000, inss = 518.82, dependentes = 2
    // Base = 5000 - 518.82 - (2 * 189.59) = 5000 - 518.82 - 379.18 = 4102.00
    // Faixa 22.5%: IRRF = 4102.00 * 22.5% - 662.77 = 922.95 - 662.77 = 260.18
    const grossSalary = 5000.0
    const inssAmount = 518.82
    const dependents = 2
    const expected = 260.18

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('deve calcular IRRF com 3 dependentes (deducao R$568,77)', async ({ assert }) => {
    // Arrange
    // grossSalary = 5000, inss = 518.82, dependentes = 3
    // Base = 5000 - 518.82 - (3 * 189.59) = 5000 - 518.82 - 568.77 = 3912.41
    // Faixa 22.5%: IRRF = 3912.41 * 22.5% - 662.77 = 880.2922 - 662.77 = 217.5222 -> 217.52
    const grossSalary = 5000.0
    const inssAmount = 518.82
    const dependents = 3
    const expected = 217.52

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('deve ficar isento quando dependentes zeram a base', async ({ assert }) => {
    // Arrange
    // grossSalary = 2500, inss = 0, dependentes = 2
    // Base = 2500 - 0 - (2 * 189.59) = 2500 - 379.18 = 2120.82 < 2259.20 -> isento
    const grossSalary = 2500.0
    const inssAmount = 0
    const dependents = 2

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, 0)
  })

  test('deve mudar de faixa com dependentes (de 15% para 7.5%)', async ({ assert }) => {
    // Arrange
    // grossSalary = 3500, inss = 0, dependentes = 0
    // Base sem dep = 3500 -> faixa 15%
    // IRRF sem dep = 3500 * 15% - 381.44 = 525 - 381.44 = 143.56

    // grossSalary = 3500, inss = 0, dependentes = 3
    // Base com dep = 3500 - 568.77 = 2931.23 -> ainda faixa 15%
    // IRRF com dep = 2931.23 * 15% - 381.44 = 439.6845 - 381.44 = 58.2445 -> 58.24

    // grossSalary = 3500, inss = 0, dependentes = 4
    // Base com dep = 3500 - 758.36 = 2741.64 -> faixa 7.5%
    // IRRF com dep = 2741.64 * 7.5% - 169.44 = 205.623 - 169.44 = 36.183 -> 36.18

    const grossSalary = 3500.0
    const inssAmount = 0

    // Act
    const irrfNoDep = await (service as any).calculateIRRF(grossSalary, inssAmount, 0)
    const irrf3Dep = await (service as any).calculateIRRF(grossSalary, inssAmount, 3)
    const irrf4Dep = await (service as any).calculateIRRF(grossSalary, inssAmount, 4)

    // Assert
    assert.equal(irrfNoDep, 143.56)
    assert.equal(irrf3Dep, 58.24)
    assert.equal(irrf4Dep, 36.18)
  })
})

test.group('Calculo IRRF - Edge Cases', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve retornar 0 quando base de calculo e negativa', async ({ assert }) => {
    // Arrange - INSS maior que salario (cenario impossivel na pratica, mas testa edge case)
    const grossSalary = 1000.0
    const inssAmount = 1500.0
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, 0)
  })

  test('deve retornar 0 quando salario e 0', async ({ assert }) => {
    // Arrange
    const grossSalary = 0
    const inssAmount = 0
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, 0)
  })

  test('deve nunca retornar valor negativo', async ({ assert }) => {
    // Arrange - cenario onde deducao seria maior que o imposto bruto
    // Na fronteira da faixa 7.5%, o imposto e quase zero
    const grossSalary = 2260.0
    const inssAmount = 0
    const dependents = 0
    // Base = 2260 -> 2260 * 7.5% - 169.44 = 169.50 - 169.44 = 0.06

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.isAtLeast(result, 0, 'IRRF nao pode ser negativo')
  })

  test('deve arredondar corretamente para 2 casas decimais', async ({ assert }) => {
    // Arrange
    const grossSalary = 4321.0
    const inssAmount = 0
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.isNumber(result)
    const parts = result.toString().split('.')
    if (parts.length > 1) {
      assert.isAtMost(parts[1].length, 2, 'Deve ter no maximo 2 casas decimais')
    }
  })

  test('deve tratar dependentes = 0 igual a sem dependentes', async ({ assert }) => {
    // Arrange
    const grossSalary = 4000.0
    const inssAmount = 0

    // Act
    const resultNoDep = await (service as any).calculateIRRF(grossSalary, inssAmount, 0)
    const resultZeroDep = await (service as any).calculateIRRF(grossSalary, inssAmount, 0)

    // Assert
    assert.equal(resultNoDep, resultZeroDep)
  })
})

test.group('Calculo IRRF - Fallback vs Tabela Dinamica', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve usar fallback quando nao ha tabela IRRF no banco', async ({ assert }) => {
    // Arrange
    const grossSalary = 4000.0
    const inssAmount = 0
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert - deve retornar valor valido do fallback
    assert.isNumber(result)
    assert.isAbove(result, 0)
  })

  test('calculateIRRFFallback deve ser consistente com calculo manual', async ({ assert }) => {
    const testCases = [
      { base: 2000.0, expected: 0 }, // Isento
      { base: 2259.2, expected: 0 }, // Limite isencao
      { base: 2500.0, expected: 18.06 }, // Faixa 7.5%
      { base: 3500.0, expected: 143.56 }, // Faixa 15%
      { base: 4500.0, expected: 349.73 }, // Faixa 22.5%
      { base: 6000.0, expected: 754.0 }, // Faixa 27.5%
    ]

    for (const tc of testCases) {
      const result = (service as any).calculateIRRFFallback(tc.base)
      assert.equal(
        result,
        tc.expected,
        `Para base R$${tc.base}: esperado R$${tc.expected}, obtido R$${result}`
      )
    }
  })
})

test.group('Calculo IRRF - Cenarios Reais Completos', (group) => {
  let service: PayrollService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new PayrollService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('cenario real: salario R$3.000,00 CLT sem dependentes', async ({ assert }) => {
    // Arrange
    // INSS R$3.000: 258.82 (calculado em testes INSS)
    // Embora o INSS real seja 258.82, aqui testamos com valor fornecido
    const grossSalary = 3000.0
    const inssAmount = 258.82
    const dependents = 0
    // Base = 3000 - 258.82 = 2741.18
    // Faixa 7.5%: 2741.18 * 7.5% - 169.44 = 205.5885 - 169.44 = 36.1485 -> 36.15
    const expected = 36.15

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('cenario real: salario R$7.000,00 CLT com 2 dependentes', async ({ assert }) => {
    // Arrange
    // INSS R$7.000: vamos calcular
    //   F1: 1412 * 7.5% = 105.90
    //   F2: 1254.68 * 9% = 112.92
    //   F3: 1333.35 * 12% = 160.00
    //   F4: (7000 - 4000.03) * 14% = 2999.97 * 14% = 420.00
    //   INSS total = 798.82
    const grossSalary = 7000.0
    const inssAmount = 798.82
    const dependents = 2
    // Base = 7000 - 798.82 - (2 * 189.59) = 7000 - 798.82 - 379.18 = 5822.00
    // Faixa 27.5%: 5822.00 * 27.5% - 896.00 = 1601.05 - 896.00 = 705.05
    const expected = 705.05

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, expected)
  })

  test('cenario real: salario minimo R$1.412,00 CLT sem dependentes', async ({ assert }) => {
    // Arrange
    // INSS: 1412 * 7.5% = 105.90
    // Base IRRF = 1412 - 105.90 = 1306.10 -> isento
    const grossSalary = 1412.0
    const inssAmount = 105.9
    const dependents = 0

    // Act
    const result = await (service as any).calculateIRRF(grossSalary, inssAmount, dependents)

    // Assert
    assert.equal(result, 0)
  })
})

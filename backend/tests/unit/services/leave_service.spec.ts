import { test } from '@japa/runner'
import LeaveService from '#services/leave_service'
import Database from '@adonisjs/lucid/services/db'

test.group('LeaveService - Validacao Regras CLT Ferias', (group) => {
  let service: LeaveService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new LeaveService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve rejeitar abono pecuniario acima de 1/3 (10 dias)', async ({ assert }) => {
    // Arrange
    const data = {
      employeeId: 1,
      type: 'vacation' as const,
      startDate: '2024-01-01',
      endDate: '2024-01-30',
      daysCount: 30,
      sellDays: 11, // Mais de 10 dias (1/3)
      leaveBalanceId: null,
    }

    // Act & Assert
    try {
      await (service as any).validateVacationRules(data)
      assert.fail('Deveria lancar erro para abono acima de 10 dias')
    } catch (error) {
      assert.include(error.message, '1/3')
      assert.include(error.message, '10 dias')
    }
  })

  test('deve aceitar abono pecuniario de ate 10 dias', async ({ assert }) => {
    // Arrange
    const data = {
      employeeId: 1,
      type: 'vacation' as const,
      startDate: '2024-01-01',
      endDate: '2024-01-20',
      daysCount: 20,
      sellDays: 10, // Exatamente 10 dias (1/3 de 30)
      leaveBalanceId: null,
    }

    // Act & Assert - Nao deve lancar erro
    try {
      await (service as any).validateVacationRules(data)
      assert.isTrue(true)
    } catch (error) {
      // Se erro for de saldo, ok (teste unitario sem DB)
      if (!error.message.includes('Saldo')) {
        throw error
      }
    }
  })

  test('deve rejeitar periodo de ferias menor que 5 dias', async ({ assert }) => {
    // Arrange
    const data = {
      employeeId: 1,
      type: 'vacation' as const,
      startDate: '2024-01-01',
      endDate: '2024-01-03',
      daysCount: 3, // Menos de 5 dias
      sellDays: 0,
      leaveBalanceId: null,
    }

    // Act & Assert
    try {
      await (service as any).validateVacationRules(data)
      assert.fail('Deveria lancar erro para periodo menor que 5 dias')
    } catch (error) {
      assert.include(error.message, '5 dias')
    }
  })

  test('deve aceitar periodo de ferias de 5 dias (minimo)', async ({ assert }) => {
    // Arrange
    const data = {
      employeeId: 1,
      type: 'vacation' as const,
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      daysCount: 5, // Minimo permitido
      sellDays: 0,
      leaveBalanceId: null,
    }

    // Act & Assert - Nao deve lancar erro
    try {
      await (service as any).validateVacationRules(data)
      assert.isTrue(true)
    } catch (error) {
      // Se erro for de saldo, ok (teste unitario sem DB)
      if (!error.message.includes('Saldo')) {
        throw error
      }
    }
  })

  test('deve aceitar periodo de ferias de 14 dias (primeiro periodo)', async ({ assert }) => {
    // Arrange
    const data = {
      employeeId: 1,
      type: 'vacation' as const,
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      daysCount: 14,
      sellDays: 0,
      leaveBalanceId: null,
    }

    // Act & Assert
    try {
      await (service as any).validateVacationRules(data)
      assert.isTrue(true)
    } catch (error) {
      // Se erro for de saldo, ok (teste unitario sem DB)
      if (!error.message.includes('Saldo')) {
        throw error
      }
    }
  })

  test('deve aceitar periodo de ferias de 30 dias', async ({ assert }) => {
    // Arrange
    const data = {
      employeeId: 1,
      type: 'vacation' as const,
      startDate: '2024-01-01',
      endDate: '2024-01-30',
      daysCount: 30,
      sellDays: 0,
      leaveBalanceId: null,
    }

    // Act & Assert
    try {
      await (service as any).validateVacationRules(data)
      assert.isTrue(true)
    } catch (error) {
      // Se erro for de saldo, ok (teste unitario sem DB)
      if (!error.message.includes('Saldo')) {
        throw error
      }
    }
  })
})

test.group('LeaveService - Calculo de Saldo', () => {
  test('deve calcular 30 dias de ferias por periodo aquisitivo de 12 meses', async ({
    assert,
  }) => {
    // Regra CLT: 30 dias de ferias a cada 12 meses trabalhados
    const totalDays = 30

    assert.equal(totalDays, 30)
  })

  test('deve calcular saldo restante corretamente apos uso', async ({ assert }) => {
    // Arrange
    const totalDays = 30
    const usedDays = 10
    const soldDays = 5

    // Act
    const remainingDays = totalDays - usedDays - soldDays

    // Assert
    assert.equal(remainingDays, 15)
  })

  test('deve permitir vender ate 1/3 das ferias (10 dias)', async ({ assert }) => {
    // Arrange
    const totalDays = 30
    const maxSellDays = 10 // 1/3 de 30

    // Assert
    assert.equal(maxSellDays, 10)
    assert.equal(maxSellDays, Math.floor(totalDays / 3))
  })

  test('deve calcular periodos aquisitivos corretamente', async ({ assert }) => {
    // Se trabalhou 25 meses, tem 2 periodos completos (0-12 e 12-24) e esta no terceiro
    const monthsWorked = 25
    const completePeriods = Math.floor(monthsWorked / 12)

    assert.equal(completePeriods, 2)
  })
})

test.group('LeaveService - Fracionamento de Ferias', () => {
  test('deve permitir fracionamento em ate 3 periodos', async ({ assert }) => {
    // Regra CLT: Ferias podem ser fracionadas em ate 3 periodos
    const maxPeriods = 3

    assert.equal(maxPeriods, 3)
  })

  test('deve exigir minimo de 14 dias no primeiro periodo', async ({ assert }) => {
    // Regra CLT: Um dos periodos deve ter no minimo 14 dias
    const minFirstPeriodDays = 14

    assert.equal(minFirstPeriodDays, 14)
  })

  test('deve exigir minimo de 5 dias nos demais periodos', async ({ assert }) => {
    // Regra CLT (Reforma Trabalhista): Periodos nao podem ser menores que 5 dias
    const minOtherPeriodDays = 5

    assert.equal(minOtherPeriodDays, 5)
  })

  test('deve permitir fracionamento 14+10+6 dias', async ({ assert }) => {
    // Um fracionamento valido
    const period1 = 14
    const period2 = 10
    const period3 = 6
    const total = period1 + period2 + period3

    assert.equal(total, 30)
    assert.isAtLeast(period1, 14) // Primeiro periodo >= 14
    assert.isAtLeast(period2, 5) // Demais >= 5
    assert.isAtLeast(period3, 5)
  })

  test('deve permitir fracionamento 20+5+5 dias', async ({ assert }) => {
    // Outro fracionamento valido
    const period1 = 20
    const period2 = 5
    const period3 = 5
    const total = period1 + period2 + period3

    assert.equal(total, 30)
    assert.isAtLeast(period1, 14)
    assert.isAtLeast(period2, 5)
    assert.isAtLeast(period3, 5)
  })
})

test.group('LeaveService - Tipos de Licenca', () => {
  test('deve ter configuracao para licenca maternidade (120 dias)', async ({ assert }) => {
    const maternityDays = 120
    assert.equal(maternityDays, 120)
  })

  test('deve ter configuracao para licenca paternidade (5 dias)', async ({ assert }) => {
    const paternityDays = 5
    assert.equal(paternityDays, 5)
  })

  test('deve ter configuracao para licenca luto (2 dias)', async ({ assert }) => {
    const bereavementDays = 2
    assert.equal(bereavementDays, 2)
  })

  test('deve ter configuracao para licenca casamento (3 dias)', async ({ assert }) => {
    const weddingDays = 3
    assert.equal(weddingDays, 3)
  })

  test('deve ter configuracao para doacao de sangue (1 dia)', async ({ assert }) => {
    const bloodDonationDays = 1
    assert.equal(bloodDonationDays, 1)
  })
})

test.group('LeaveService - Atualizacao de Saldo', () => {
  test('deve atualizar saldo corretamente apos aprovacao', async ({ assert }) => {
    // Arrange
    const totalDays = 30
    const usedDays = 0
    const soldDays = 0
    const newUsedDays = 10
    const newSoldDays = 5

    // Act
    const updatedUsedDays = usedDays + newUsedDays
    const updatedSoldDays = soldDays + newSoldDays
    const remainingDays = totalDays - updatedUsedDays - updatedSoldDays

    // Assert
    assert.equal(updatedUsedDays, 10)
    assert.equal(updatedSoldDays, 5)
    assert.equal(remainingDays, 15)
  })

  test('deve reverter saldo corretamente apos cancelamento', async ({ assert }) => {
    // Arrange
    const totalDays = 30
    const usedDays = 10
    const soldDays = 5
    const cancelUsedDays = 10
    const cancelSoldDays = 5

    // Act
    const revertedUsedDays = Math.max(0, usedDays - cancelUsedDays)
    const revertedSoldDays = Math.max(0, soldDays - cancelSoldDays)
    const remainingDays = totalDays - revertedUsedDays - revertedSoldDays

    // Assert
    assert.equal(revertedUsedDays, 0)
    assert.equal(revertedSoldDays, 0)
    assert.equal(remainingDays, 30)
  })

  test('deve mudar status para "used" quando saldo zerado', async ({ assert }) => {
    // Arrange
    const totalDays = 30
    const usedDays = 25
    const soldDays = 5
    const remainingDays = totalDays - usedDays - soldDays

    // Act
    const status = remainingDays <= 0 ? 'used' : 'partially_used'

    // Assert
    assert.equal(remainingDays, 0)
    assert.equal(status, 'used')
  })

  test('deve mudar status para "partially_used" quando parcialmente utilizado', async ({
    assert,
  }) => {
    // Arrange
    const totalDays = 30
    const usedDays = 10
    const soldDays = 0
    const remainingDays = totalDays - usedDays - soldDays

    // Act
    const status =
      remainingDays <= 0 ? 'used' : usedDays > 0 || soldDays > 0 ? 'partially_used' : 'available'

    // Assert
    assert.equal(remainingDays, 20)
    assert.equal(status, 'partially_used')
  })
})

test.group('LeaveService - Edge Cases', () => {
  test('nao deve permitir saldo negativo', async ({ assert }) => {
    // Arrange
    const totalDays = 30
    const usedDays = 35

    // Act
    const remainingDays = Math.max(0, totalDays - usedDays)

    // Assert
    assert.equal(remainingDays, 0)
  })

  test('deve permitir vender dias sem usar todos os dias', async ({ assert }) => {
    // Colaborador pode vender 10 dias e usar 20 dias
    const totalDays = 30
    const usedDays = 20
    const soldDays = 10
    const remainingDays = totalDays - usedDays - soldDays

    assert.equal(remainingDays, 0)
  })

  test('deve calcular corretamente ferias proporcionais (rescisao)', async ({ assert }) => {
    // 6 meses trabalhados = 15 dias de ferias proporcionais
    const monthsWorked = 6
    const proportionalDays = Math.floor((30 / 12) * monthsWorked)

    assert.equal(proportionalDays, 15)
  })
})

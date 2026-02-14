import { test } from '@japa/runner'
import {
  createLeaveValidator,
  approveRejectLeaveValidator,
  listLeaveValidator,
  updateLeaveConfigValidator,
  listLeaveBalanceValidator,
} from '#validators/leave_validator'

test.group('LeaveValidator - createLeaveValidator', () => {
  test('deve validar solicitacao completa de ferias', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
      isPaid: true,
      sellDays: 5,
      notes: 'Viagem de ferias',
    }

    const validated = await createLeaveValidator.validate(data)

    assert.equal(validated.employeeId, 1)
    assert.equal(validated.type, 'vacation')
    assert.equal(validated.daysCount, 15)
    assert.isTrue(validated.isPaid)
  })

  test('deve exigir employeeId', async ({ assert }) => {
    const data = {
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve exigir type', async ({ assert }) => {
    const data = {
      employeeId: 1,
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve exigir startDate', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      endDate: '2024-07-15',
      daysCount: 15,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve exigir endDate', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      daysCount: 15,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve exigir daysCount', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve aceitar type vacation', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'vacation')
  })

  test('deve aceitar type medical', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'medical',
      startDate: '2024-07-01',
      endDate: '2024-07-03',
      daysCount: 3,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'medical')
  })

  test('deve aceitar type maternity', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'maternity',
      startDate: '2024-07-01',
      endDate: '2024-10-28',
      daysCount: 120,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'maternity')
  })

  test('deve aceitar type paternity', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'paternity',
      startDate: '2024-07-01',
      endDate: '2024-07-05',
      daysCount: 5,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'paternity')
  })

  test('deve aceitar type bereavement', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'bereavement',
      startDate: '2024-07-01',
      endDate: '2024-07-03',
      daysCount: 3,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'bereavement')
  })

  test('deve aceitar type wedding', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'wedding',
      startDate: '2024-07-01',
      endDate: '2024-07-03',
      daysCount: 3,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'wedding')
  })

  test('deve aceitar type blood_donation', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'blood_donation',
      startDate: '2024-07-01',
      endDate: '2024-07-01',
      daysCount: 1,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'blood_donation')
  })

  test('deve aceitar type military', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'military',
      startDate: '2024-07-01',
      endDate: '2024-07-02',
      daysCount: 2,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'military')
  })

  test('deve aceitar type other', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'other',
      startDate: '2024-07-01',
      endDate: '2024-07-05',
      daysCount: 5,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.type, 'other')
  })

  test('deve rejeitar type invalido', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'sick_leave',
      startDate: '2024-07-01',
      endDate: '2024-07-05',
      daysCount: 5,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve exigir daysCount positivo', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 0,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve rejeitar daysCount negativo', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: -5,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve aceitar sellDays zero', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
      sellDays: 0,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.equal(validated.sellDays, 0)
  })

  test('deve rejeitar sellDays negativo', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
      sellDays: -5,
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve validar notes com tamanho maximo', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
      notes: 'A'.repeat(1000),
    }

    const validated = await createLeaveValidator.validate(data)
    assert.lengthOf(validated.notes!, 1000)
  })

  test('deve rejeitar notes muito longo', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
      notes: 'A'.repeat(1001),
    }

    await assert.rejects(async () => await createLeaveValidator.validate(data))
  })

  test('deve aceitar isPaid como opcional', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.property(validated, 'employeeId')
  })

  test('deve aceitar leaveBalanceId null', async ({ assert }) => {
    const data = {
      employeeId: 1,
      type: 'vacation',
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      daysCount: 15,
      leaveBalanceId: null,
    }

    const validated = await createLeaveValidator.validate(data)
    assert.isNull(validated.leaveBalanceId)
  })
})

test.group('LeaveValidator - approveRejectLeaveValidator', () => {
  test('deve validar aprovacao sem motivo', async ({ assert }) => {
    const data = {}

    const validated = await approveRejectLeaveValidator.validate(data)
    assert.isObject(validated)
  })

  test('deve validar rejeicao com motivo', async ({ assert }) => {
    const data = {
      rejectionReason: 'Periodo de ferias ja utilizado',
    }

    const validated = await approveRejectLeaveValidator.validate(data)
    assert.equal(validated.rejectionReason, 'Periodo de ferias ja utilizado')
  })

  test('deve validar rejectionReason com tamanho maximo', async ({ assert }) => {
    const data = {
      rejectionReason: 'A'.repeat(500),
    }

    const validated = await approveRejectLeaveValidator.validate(data)
    assert.lengthOf(validated.rejectionReason!, 500)
  })

  test('deve rejeitar rejectionReason muito longo', async ({ assert }) => {
    const data = {
      rejectionReason: 'A'.repeat(501),
    }

    await assert.rejects(async () => await approveRejectLeaveValidator.validate(data))
  })

  test('deve aceitar rejectionReason null', async ({ assert }) => {
    const data = {
      rejectionReason: null,
    }

    const validated = await approveRejectLeaveValidator.validate(data)
    assert.isNull(validated.rejectionReason)
  })
})

test.group('LeaveValidator - listLeaveValidator', () => {
  test('deve validar filtros completos de listagem', async ({ assert }) => {
    const data = {
      page: 1,
      limit: 50,
      employeeId: 5,
      type: 'vacation',
      status: 'approved',
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.page, 1)
    assert.equal(validated.limit, 50)
    assert.equal(validated.employeeId, 5)
    assert.equal(validated.type, 'vacation')
    assert.equal(validated.status, 'approved')
  })

  test('deve aceitar limit ate 100', async ({ assert }) => {
    const data = {
      limit: 100,
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.limit, 100)
  })

  test('deve rejeitar limit acima de 100', async ({ assert }) => {
    const data = {
      limit: 101,
    }

    await assert.rejects(async () => await listLeaveValidator.validate(data))
  })

  test('deve validar status pending', async ({ assert }) => {
    const data = {
      status: 'pending',
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.status, 'pending')
  })

  test('deve validar status approved', async ({ assert }) => {
    const data = {
      status: 'approved',
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.status, 'approved')
  })

  test('deve validar status rejected', async ({ assert }) => {
    const data = {
      status: 'rejected',
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.status, 'rejected')
  })

  test('deve validar status cancelled', async ({ assert }) => {
    const data = {
      status: 'cancelled',
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.status, 'cancelled')
  })

  test('deve validar status in_progress', async ({ assert }) => {
    const data = {
      status: 'in_progress',
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.status, 'in_progress')
  })

  test('deve validar status completed', async ({ assert }) => {
    const data = {
      status: 'completed',
    }

    const validated = await listLeaveValidator.validate(data)
    assert.equal(validated.status, 'completed')
  })

  test('deve rejeitar status invalido', async ({ assert }) => {
    const data = {
      status: 'expired',
    }

    await assert.rejects(async () => await listLeaveValidator.validate(data))
  })

  test('deve permitir listagem sem filtros', async ({ assert }) => {
    const data = {}

    const validated = await listLeaveValidator.validate(data)
    assert.isObject(validated)
  })
})

test.group('LeaveValidator - updateLeaveConfigValidator', () => {
  test('deve validar atualizacao completa de config', async ({ assert }) => {
    const data = {
      defaultDays: 30,
      requiresApproval: true,
      requiresDocument: false,
      isPaid: true,
      isActive: true,
    }

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.equal(validated.defaultDays, 30)
    assert.isTrue(validated.requiresApproval)
    assert.isFalse(validated.requiresDocument)
  })

  test('deve aceitar defaultDays positivo', async ({ assert }) => {
    const data = {
      defaultDays: 15,
    }

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.equal(validated.defaultDays, 15)
  })

  test('deve rejeitar defaultDays zero ou negativo', async ({ assert }) => {
    const data = {
      defaultDays: 0,
    }

    await assert.rejects(async () => await updateLeaveConfigValidator.validate(data))
  })

  test('deve validar requiresApproval boolean', async ({ assert }) => {
    const data = {
      requiresApproval: false,
    }

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.isFalse(validated.requiresApproval)
  })

  test('deve validar requiresDocument boolean', async ({ assert }) => {
    const data = {
      requiresDocument: true,
    }

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.isTrue(validated.requiresDocument)
  })

  test('deve validar isPaid boolean', async ({ assert }) => {
    const data = {
      isPaid: false,
    }

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.isFalse(validated.isPaid)
  })

  test('deve validar isActive boolean', async ({ assert }) => {
    const data = {
      isActive: false,
    }

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.isFalse(validated.isActive)
  })

  test('deve permitir update parcial', async ({ assert }) => {
    const data = {
      defaultDays: 20,
    }

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.equal(validated.defaultDays, 20)
  })

  test('deve permitir update sem campos', async ({ assert }) => {
    const data = {}

    const validated = await updateLeaveConfigValidator.validate(data)
    assert.isObject(validated)
  })
})

test.group('LeaveValidator - listLeaveBalanceValidator', () => {
  test('deve validar com employeeId', async ({ assert }) => {
    const data = {
      employeeId: 10,
    }

    const validated = await listLeaveBalanceValidator.validate(data)
    assert.equal(validated.employeeId, 10)
  })

  test('deve exigir employeeId positivo', async ({ assert }) => {
    const data = {
      employeeId: -1,
    }

    await assert.rejects(async () => await listLeaveBalanceValidator.validate(data))
  })

  test('deve permitir listagem sem employeeId', async ({ assert }) => {
    const data = {}

    const validated = await listLeaveBalanceValidator.validate(data)
    assert.isObject(validated)
  })
})

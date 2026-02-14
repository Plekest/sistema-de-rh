import { test } from '@japa/runner'
import {
  createTrainingValidator,
  updateTrainingValidator,
  listTrainingValidator,
  enrollValidator,
  updateEnrollmentValidator,
} from '#validators/training_validator'

test.group('TrainingValidator - createTrainingValidator', () => {
  test('deve validar treinamento completo com todos os campos', async ({ assert }) => {
    const data = {
      title: 'Treinamento de Seguranca do Trabalho',
      description: 'Treinamento obrigatorio sobre normas de seguranca',
      type: 'presential',
      category: 'Seguranca',
      instructor: 'João Silva',
      provider: 'SESI',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 40,
      maxParticipants: 30,
      location: 'Sala de Treinamento - Matriz',
      status: 'planned',
      isMandatory: true,
      notes: 'Trazer EPI completo',
    }

    const validated = await createTrainingValidator.validate(data)

    assert.equal(validated.title, 'Treinamento de Seguranca do Trabalho')
    assert.equal(validated.type, 'presential')
    assert.equal(validated.durationHours, 40)
    assert.isTrue(validated.isMandatory)
  })

  test('deve exigir title', async ({ assert }) => {
    const data = {
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve exigir type', async ({ assert }) => {
    const data = {
      title: 'Treinamento de Excel',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve aceitar type online', async ({ assert }) => {
    const data = {
      title: 'Treinamento Online',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.type, 'online')
  })

  test('deve aceitar type presential', async ({ assert }) => {
    const data = {
      title: 'Treinamento Presencial',
      type: 'presential',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.type, 'presential')
  })

  test('deve aceitar type hybrid', async ({ assert }) => {
    const data = {
      title: 'Treinamento Hibrido',
      type: 'hybrid',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.type, 'hybrid')
  })

  test('deve rejeitar type invalido', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'remote',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve exigir startDate', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      endDate: '2024-03-05',
      durationHours: 20,
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve exigir endDate', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      durationHours: 20,
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve exigir durationHours', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve exigir durationHours positivo', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 0,
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve rejeitar durationHours negativo', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: -5,
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve aceitar maxParticipants null', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      maxParticipants: null,
    }

    const validated = await createTrainingValidator.validate(data)
    assert.isNull(validated.maxParticipants)
  })

  test('deve aceitar maxParticipants positivo', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      maxParticipants: 50,
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.maxParticipants, 50)
  })

  test('deve aceitar category opcional', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      category: 'Tecnologia',
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.category, 'Tecnologia')
  })

  test('deve aceitar isMandatory boolean', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      isMandatory: true,
    }

    const validated = await createTrainingValidator.validate(data)
    assert.isTrue(validated.isMandatory)
  })

  test('deve validar notes com tamanho maximo (1000 chars)', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      notes: 'A'.repeat(1000),
    }

    const validated = await createTrainingValidator.validate(data)
    assert.lengthOf(validated.notes!, 1000)
  })

  test('deve rejeitar notes muito longo (1001 chars)', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      notes: 'A'.repeat(1001),
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve aceitar description com tamanho maximo (5000 chars)', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      description: 'A'.repeat(5000),
    }

    const validated = await createTrainingValidator.validate(data)
    assert.lengthOf(validated.description!, 5000)
  })

  test('deve rejeitar description muito longo (5001 chars)', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      description: 'A'.repeat(5001),
    }

    await assert.rejects(async () => await createTrainingValidator.validate(data))
  })

  test('deve aceitar status planned', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      status: 'planned',
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.status, 'planned')
  })

  test('deve aceitar instructor opcional', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      instructor: 'Maria Silva',
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.instructor, 'Maria Silva')
  })

  test('deve aceitar provider opcional', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'online',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      provider: 'SENAI',
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.provider, 'SENAI')
  })

  test('deve aceitar location opcional', async ({ assert }) => {
    const data = {
      title: 'Treinamento',
      type: 'presential',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      durationHours: 20,
      location: 'Auditorio Central',
    }

    const validated = await createTrainingValidator.validate(data)
    assert.equal(validated.location, 'Auditorio Central')
  })
})

test.group('TrainingValidator - updateTrainingValidator', () => {
  test('deve aceitar update parcial', async ({ assert }) => {
    const data = {
      title: 'Novo Titulo',
    }

    const validated = await updateTrainingValidator.validate(data)
    assert.equal(validated.title, 'Novo Titulo')
  })

  test('deve aceitar update sem campos', async ({ assert }) => {
    const data = {}

    const validated = await updateTrainingValidator.validate(data)
    assert.isObject(validated)
  })

  test('deve validar status planned', async ({ assert }) => {
    const data = {
      status: 'planned',
    }

    const validated = await updateTrainingValidator.validate(data)
    assert.equal(validated.status, 'planned')
  })

  test('deve validar status in_progress', async ({ assert }) => {
    const data = {
      status: 'in_progress',
    }

    const validated = await updateTrainingValidator.validate(data)
    assert.equal(validated.status, 'in_progress')
  })

  test('deve validar status completed', async ({ assert }) => {
    const data = {
      status: 'completed',
    }

    const validated = await updateTrainingValidator.validate(data)
    assert.equal(validated.status, 'completed')
  })

  test('deve validar status cancelled', async ({ assert }) => {
    const data = {
      status: 'cancelled',
    }

    const validated = await updateTrainingValidator.validate(data)
    assert.equal(validated.status, 'cancelled')
  })

  test('deve rejeitar status invalido', async ({ assert }) => {
    const data = {
      status: 'expired',
    }

    await assert.rejects(async () => await updateTrainingValidator.validate(data))
  })

  test('deve aceitar update de type', async ({ assert }) => {
    const data = {
      type: 'hybrid',
    }

    const validated = await updateTrainingValidator.validate(data)
    assert.equal(validated.type, 'hybrid')
  })

  test('deve aceitar update de durationHours', async ({ assert }) => {
    const data = {
      durationHours: 40,
    }

    const validated = await updateTrainingValidator.validate(data)
    assert.equal(validated.durationHours, 40)
  })

  test('deve rejeitar durationHours zero em update', async ({ assert }) => {
    const data = {
      durationHours: 0,
    }

    await assert.rejects(async () => await updateTrainingValidator.validate(data))
  })
})

test.group('TrainingValidator - listTrainingValidator', () => {
  test('deve validar filtros completos', async ({ assert }) => {
    const data = {
      page: 2,
      limit: 50,
      status: 'in_progress',
      type: 'online',
      category: 'Tecnologia',
    }

    const validated = await listTrainingValidator.validate(data)
    assert.equal(validated.page, 2)
    assert.equal(validated.limit, 50)
    assert.equal(validated.status, 'in_progress')
    assert.equal(validated.type, 'online')
    assert.equal(validated.category, 'Tecnologia')
  })

  test('deve aceitar limit ate 100', async ({ assert }) => {
    const data = {
      limit: 100,
    }

    const validated = await listTrainingValidator.validate(data)
    assert.equal(validated.limit, 100)
  })

  test('deve rejeitar limit acima de 100', async ({ assert }) => {
    const data = {
      limit: 101,
    }

    await assert.rejects(async () => await listTrainingValidator.validate(data))
  })

  test('deve permitir listagem sem filtros', async ({ assert }) => {
    const data = {}

    const validated = await listTrainingValidator.validate(data)
    assert.isObject(validated)
  })

  test('deve validar filtro por status', async ({ assert }) => {
    const data = {
      status: 'completed',
    }

    const validated = await listTrainingValidator.validate(data)
    assert.equal(validated.status, 'completed')
  })

  test('deve validar filtro por type', async ({ assert }) => {
    const data = {
      type: 'presential',
    }

    const validated = await listTrainingValidator.validate(data)
    assert.equal(validated.type, 'presential')
  })

  test('deve validar filtro por category', async ({ assert }) => {
    const data = {
      category: 'Seguranca',
    }

    const validated = await listTrainingValidator.validate(data)
    assert.equal(validated.category, 'Seguranca')
  })
})

test.group('TrainingValidator - enrollValidator', () => {
  test('deve exigir employeeId', async ({ assert }) => {
    const data = {}

    await assert.rejects(async () => await enrollValidator.validate(data))
  })

  test('deve exigir employeeId positivo', async ({ assert }) => {
    const data = {
      employeeId: -1,
    }

    await assert.rejects(async () => await enrollValidator.validate(data))
  })

  test('deve aceitar employeeId valido', async ({ assert }) => {
    const data = {
      employeeId: 10,
    }

    const validated = await enrollValidator.validate(data)
    assert.equal(validated.employeeId, 10)
  })
})

test.group('TrainingValidator - updateEnrollmentValidator', () => {
  test('deve aceitar status enrolled', async ({ assert }) => {
    const data = {
      status: 'enrolled',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.status, 'enrolled')
  })

  test('deve aceitar status in_progress', async ({ assert }) => {
    const data = {
      status: 'in_progress',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.status, 'in_progress')
  })

  test('deve aceitar status completed', async ({ assert }) => {
    const data = {
      status: 'completed',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.status, 'completed')
  })

  test('deve aceitar status cancelled', async ({ assert }) => {
    const data = {
      status: 'cancelled',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.status, 'cancelled')
  })

  test('deve aceitar status no_show', async ({ assert }) => {
    const data = {
      status: 'no_show',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.status, 'no_show')
  })

  test('deve rejeitar status invalido', async ({ assert }) => {
    const data = {
      status: 'pending',
    }

    await assert.rejects(async () => await updateEnrollmentValidator.validate(data))
  })

  test('deve aceitar score entre 0 e 100', async ({ assert }) => {
    const data = {
      score: 85,
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.score, 85)
  })

  test('deve aceitar score 0', async ({ assert }) => {
    const data = {
      score: 0,
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.score, 0)
  })

  test('deve aceitar score 100', async ({ assert }) => {
    const data = {
      score: 100,
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.score, 100)
  })

  test('deve rejeitar score negativo', async ({ assert }) => {
    const data = {
      score: -1,
    }

    await assert.rejects(async () => await updateEnrollmentValidator.validate(data))
  })

  test('deve rejeitar score acima de 100', async ({ assert }) => {
    const data = {
      score: 101,
    }

    await assert.rejects(async () => await updateEnrollmentValidator.validate(data))
  })

  test('deve aceitar feedbackRating entre 1 e 5', async ({ assert }) => {
    const data = {
      feedbackRating: 4,
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.feedbackRating, 4)
  })

  test('deve aceitar feedbackRating 1', async ({ assert }) => {
    const data = {
      feedbackRating: 1,
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.feedbackRating, 1)
  })

  test('deve aceitar feedbackRating 5', async ({ assert }) => {
    const data = {
      feedbackRating: 5,
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.feedbackRating, 5)
  })

  test('deve rejeitar feedbackRating 0', async ({ assert }) => {
    const data = {
      feedbackRating: 0,
    }

    await assert.rejects(async () => await updateEnrollmentValidator.validate(data))
  })

  test('deve rejeitar feedbackRating 6', async ({ assert }) => {
    const data = {
      feedbackRating: 6,
    }

    await assert.rejects(async () => await updateEnrollmentValidator.validate(data))
  })

  test('deve aceitar feedback texto', async ({ assert }) => {
    const data = {
      feedback: 'Excelente treinamento, muito produtivo',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.feedback, 'Excelente treinamento, muito produtivo')
  })

  test('deve aceitar feedback com tamanho maximo (2000 chars)', async ({ assert }) => {
    const data = {
      feedback: 'A'.repeat(2000),
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.lengthOf(validated.feedback!, 2000)
  })

  test('deve rejeitar feedback muito longo (2001 chars)', async ({ assert }) => {
    const data = {
      feedback: 'A'.repeat(2001),
    }

    await assert.rejects(async () => await updateEnrollmentValidator.validate(data))
  })

  test('deve aceitar notes opcional', async ({ assert }) => {
    const data = {
      notes: 'Colaborador ausente no primeiro dia',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.notes, 'Colaborador ausente no primeiro dia')
  })

  test('deve aceitar certificateUrl valida', async ({ assert }) => {
    const data = {
      certificateUrl: 'https://example.com/certificate/12345.pdf',
    }

    const validated = await updateEnrollmentValidator.validate(data)
    assert.equal(validated.certificateUrl, 'https://example.com/certificate/12345.pdf')
  })

  test('deve aceitar update sem campos', async ({ assert }) => {
    const data = {}

    const validated = await updateEnrollmentValidator.validate(data)
    assert.isObject(validated)
  })
})

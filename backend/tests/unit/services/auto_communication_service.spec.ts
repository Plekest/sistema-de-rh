import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import AutoCommunicationService from '#services/auto_communication_service'
import AutomatedCommunication from '#models/automated_communication'
import CommunicationLog from '#models/communication_log'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

test.group('AutoCommunicationService - CRUD', (group) => {
  let service: AutoCommunicationService
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new AutoCommunicationService()

    user = await User.create({
      fullName: 'Admin',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })
  })

  test('deve criar comunicação automática', async ({ assert }) => {
    const comm = await service.create(
      {
        name: 'Aniversariantes',
        trigger_type: 'birthday',
        trigger_days_before: 0,
        message_template: 'Parabéns {{name}}!',
        is_active: true,
      },
      user.id
    )

    assert.equal(comm.name, 'Aniversariantes')
    assert.equal(comm.triggerType, 'birthday')
    assert.isTrue(comm.isActive)
  })

  test('deve listar comunicações', async ({ assert }) => {
    await service.create(
      {
        name: `Comm 1 ${Date.now()}`,
        trigger_type: 'birthday',
        message_template: 'Test',
      },
      user.id
    )

    await service.create(
      {
        name: `Comm 2 ${Date.now()}`,
        trigger_type: 'work_anniversary',
        message_template: 'Test',
      },
      user.id
    )

    const communications = await service.list()

    assert.isAtLeast(communications.length, 2)
  })

  test('deve atualizar comunicação', async ({ assert }) => {
    const comm = await service.create(
      {
        name: 'Original',
        trigger_type: 'birthday',
        message_template: 'Original message',
      },
      user.id
    )

    const updated = await service.update(
      comm.id,
      {
        name: 'Atualizada',
        message_template: 'Updated message',
      },
      user.id
    )

    assert.equal(updated.name, 'Atualizada')
    assert.equal(updated.messageTemplate, 'Updated message')
  })

  test('deve deletar comunicação', async ({ assert }) => {
    const comm = await service.create(
      {
        name: 'Para Deletar',
        trigger_type: 'birthday',
        message_template: 'Test',
      },
      user.id
    )

    await service.delete(comm.id, user.id)

    const deleted = await AutomatedCommunication.find(comm.id)

    assert.isNull(deleted)
  })

  test('deve toggle ativo/inativo', async ({ assert }) => {
    const comm = await service.create(
      {
        name: 'Toggle Test',
        trigger_type: 'birthday',
        message_template: 'Test',
        is_active: true,
      },
      user.id
    )

    assert.isTrue(comm.isActive)

    const toggled = await service.toggle(comm.id, user.id)

    assert.isFalse(toggled.isActive)

    const toggledAgain = await service.toggle(comm.id, user.id)

    assert.isTrue(toggledAgain.isActive)
  })
})

test.group('AutoCommunicationService - Execução', (group) => {
  let service: AutoCommunicationService
  let user: User
  let employee: Employee
  let department: Department

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new AutoCommunicationService()

    user = await User.create({
      fullName: 'RH Manager',
      email: `rh.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'manager',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'João da Silva',
      email: `joao.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ years: 2 }),
      birthDate: DateTime.now(),
      status: 'active',
    })
  })

  test('deve encontrar employees com aniversário hoje', async ({ assert }) => {
    const comm = await service.create(
      {
        name: 'Birthday',
        trigger_type: 'birthday',
        trigger_days_before: 0,
        message_template: 'Happy birthday {{name}}!',
        is_active: true,
      },
      user.id
    )

    const results = await service.execute(comm.id, user.id)

    assert.isArray(results)
    assert.isAtLeast(results.length, 1)
    assert.isTrue(results[0].success)
  })

  test('deve encontrar employees com aniversário de empresa', async ({ assert }) => {
    const emp = await Employee.create({
      userId: user.id,
      fullName: 'Anniversary Employee',
      email: `anniv.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const comm = await service.create(
      {
        name: 'Work Anniversary',
        trigger_type: 'work_anniversary',
        trigger_days_before: 0,
        message_template: 'Parabéns {{name}} por {{tenure_years}} anos!',
        is_active: true,
      },
      user.id
    )

    const results = await service.execute(comm.id, user.id)

    assert.isArray(results)
  })

  test('deve gerar notificação para cada match', async ({ assert }) => {
    const comm = await service.create(
      {
        name: 'Birthday Notification',
        trigger_type: 'birthday',
        trigger_days_before: 0,
        message_template: 'Feliz aniversário!',
        is_active: true,
      },
      user.id
    )

    const results = await service.execute(comm.id, user.id)

    assert.isAtLeast(results.length, 1)
    assert.isTrue(results[0].success)
    assert.property(results[0], 'sent')
  })

  test('deve registrar log de envio', async ({ assert }) => {
    const comm = await service.create(
      {
        name: 'Birthday Log Test',
        trigger_type: 'birthday',
        trigger_days_before: 0,
        message_template: 'Parabéns!',
        is_active: true,
      },
      user.id
    )

    await service.execute(comm.id, user.id)

    const logs = await CommunicationLog.query().where('communication_id', comm.id)

    assert.isAtLeast(logs.length, 1)
  })

  test('deve processar template com variáveis do employee', async ({ assert }) => {
    const template = 'Olá {{full_name}}, seu email é {{email}}'
    const processed = service.processTemplate(template, employee)

    assert.include(processed, employee.fullName)
    assert.include(processed, employee.email)
  })

  test('deve substituir {{employee.fullName}} corretamente', async ({ assert }) => {
    const template = 'Olá {{full_name}}!'
    const processed = service.processTemplate(template, employee)

    assert.include(processed, 'João da Silva')
  })

  test('deve ignorar comunicações inativas', async ({ assert }) => {
    const inactiveComm = await service.create(
      {
        name: 'Inactive',
        trigger_type: 'birthday',
        trigger_days_before: 0,
        message_template: 'Test',
        is_active: false,
      },
      user.id
    )

    // Executar todas as comunicações ativas
    const results = await service.execute(undefined, user.id)

    // A comunicação inativa não deve estar nos resultados
    const inactiveResult = results.find((r) => r.communicationId === inactiveComm.id)

    assert.isUndefined(inactiveResult)
  })
})

test.group('AutoCommunicationService - Template', (group) => {
  let service: AutoCommunicationService
  let user: User
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new AutoCommunicationService()

    user = await User.create({
      fullName: 'Admin',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    const department = await Department.create({
      name: `Dept ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Pos ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Maria Oliveira Santos',
      email: `maria.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.fromISO('2020-03-15'),
      birthDate: DateTime.fromISO('1990-07-20'),
      status: 'active',
    })
  })

  test('deve processar template com múltiplas variáveis', async ({ assert }) => {
    const template =
      'Olá {{name}}, {{full_name}}! Seu email: {{email}}. Aniversário: {{birth_date}}'
    const processed = service.processTemplate(template, employee)

    assert.include(processed, 'Maria') // {{name}} = primeiro nome
    assert.include(processed, 'Maria Oliveira Santos') // {{full_name}}
    assert.include(processed, employee.email)
  })

  test('deve manter texto sem variáveis inalterado', async ({ assert }) => {
    const template = 'Este é um texto sem variáveis.'
    const processed = service.processTemplate(template, employee)

    assert.equal(processed, template)
  })

  test('deve tratar variável inexistente gracefully', async ({ assert }) => {
    const template = 'Olá {{unknown_variable}}!'
    const processed = service.processTemplate(template, employee)

    // Variável não reconhecida deve ficar intacta
    assert.include(processed, '{{unknown_variable}}')
  })
})

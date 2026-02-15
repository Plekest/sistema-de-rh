import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import NotificationService from '#services/notification_service'
import User from '#models/user'
import { DateTime } from 'luxon'

test.group('NotificationService', (group) => {
  let service: NotificationService
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()

    // Criar usuario de teste uma vez para todo o group
    user = await User.create({
      fullName: 'Test User Notifications',
      email: `test-notifications-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
      isActive: true,
    })
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new NotificationService()
  })

  test('deve criar notificacao', async ({ assert }) => {
    const notification = await service.create(user.id, {
      type: 'leave_approved',
      title: 'Ferias aprovadas',
      message: 'Suas ferias foram aprovadas',
      metadata: { leaveId: 1 },
    })

    assert.isDefined(notification.id)
    assert.equal(notification.userId, user.id)
    assert.equal(notification.type, 'leave_approved')
    assert.equal(notification.title, 'Ferias aprovadas')
    assert.isFalse(notification.isRead)
  })

  test('deve listar notificacoes do usuario', async ({ assert }) => {
    // Criar algumas notificacoes
    await service.create(user.id, {
      type: 'leave_approved',
      title: 'Notificacao 1',
      message: 'Mensagem 1',
    })

    await service.create(user.id, {
      type: 'document_uploaded',
      title: 'Notificacao 2',
      message: 'Mensagem 2',
    })

    const result = await service.list(user.id, { page: 1, limit: 10 })

    assert.isAtLeast(result.length, 2)
    assert.equal(result[0].userId, user.id)
  })

  test('deve filtrar notificacoes nao lidas', async ({ assert }) => {
    // Criar notificacao lida
    const read = await service.create(user.id, {
      type: 'leave_approved',
      title: 'Lida',
      message: 'Mensagem lida',
    })
    read.isRead = true
    read.readAt = DateTime.now()
    await read.save()

    // Criar notificacao nao lida
    await service.create(user.id, {
      type: 'document_uploaded',
      title: 'Nao lida',
      message: 'Mensagem nao lida',
    })

    const unreadResult = await service.list(user.id, { isRead: false })
    const readResult = await service.list(user.id, { isRead: true })

    assert.isAtLeast(unreadResult.length, 1)
    assert.isAtLeast(readResult.length, 1)
    unreadResult.forEach(n => assert.isFalse(n.isRead))
    readResult.forEach(n => assert.isTrue(n.isRead))
  })

  test('deve marcar notificacao como lida', async ({ assert }) => {
    const notification = await service.create(user.id, {
      type: 'leave_approved',
      title: 'Teste',
      message: 'Teste',
    })

    assert.isFalse(notification.isRead)
    assert.isNull(notification.readAt)

    const updated = await service.markAsRead(notification.id, user.id)

    assert.isTrue(updated.isRead)
    assert.isNotNull(updated.readAt)
  })

  test('nao deve marcar notificacao como lida se ja estiver lida', async ({ assert }) => {
    const notification = await service.create(user.id, {
      type: 'leave_approved',
      title: 'Teste',
      message: 'Teste',
    })

    // Marca primeira vez
    const first = await service.markAsRead(notification.id, user.id)
    const firstReadAt = first.readAt

    // Marca segunda vez
    const second = await service.markAsRead(notification.id, user.id)

    // Data de leitura deve ser a mesma
    assert.equal(second.readAt?.toISO(), firstReadAt?.toISO())
  })

  test('deve marcar todas as notificacoes como lidas', async ({ assert }) => {
    // Criar varias notificacoes
    await service.create(user.id, {
      type: 'leave_approved',
      title: 'N1',
      message: 'M1',
    })

    await service.create(user.id, {
      type: 'document_uploaded',
      title: 'N2',
      message: 'M2',
    })

    await service.create(user.id, {
      type: 'general',
      title: 'N3',
      message: 'M3',
    })

    const result = await service.markAllAsRead(user.id)

    assert.isAtLeast(Number(result.affected), 3)

    // Verificar que todas estao lidas
    const unread = await service.list(user.id, { isRead: false })
    assert.equal(unread.length, 0)
  })

  test('deve retornar contagem de nao lidas', async ({ assert }) => {
    // Criar notificacoes
    await service.create(user.id, {
      type: 'leave_approved',
      title: 'N1',
      message: 'M1',
    })

    await service.create(user.id, {
      type: 'document_uploaded',
      title: 'N2',
      message: 'M2',
    })

    const count = await service.getUnreadCount(user.id)
    assert.isAtLeast(count, 2)

    // Marca uma como lida
    const notifications = await service.list(user.id)
    await service.markAsRead(notifications[0].id, user.id)

    const newCount = await service.getUnreadCount(user.id)
    assert.equal(newCount, count - 1)
  })

  test('deve buscar notificacao por ID', async ({ assert }) => {
    const created = await service.create(user.id, {
      type: 'leave_approved',
      title: 'Teste',
      message: 'Mensagem',
      metadata: { key: 'value' },
    })

    const found = await service.findById(created.id, user.id)

    assert.equal(found.id, created.id)
    assert.equal(found.title, 'Teste')
    assert.deepEqual(found.metadata, { key: 'value' })
  })

  test('deve filtrar por tipo de notificacao', async ({ assert }) => {
    await service.create(user.id, {
      type: 'leave_approved',
      title: 'Ferias',
      message: 'Teste',
    })

    await service.create(user.id, {
      type: 'document_uploaded',
      title: 'Documento',
      message: 'Teste',
    })

    const leaveNotifications = await service.list(user.id, { type: 'leave_approved' })
    const docNotifications = await service.list(user.id, { type: 'document_uploaded' })

    assert.isAtLeast(leaveNotifications.length, 1)
    assert.isAtLeast(docNotifications.length, 1)
    leaveNotifications.forEach(n => assert.equal(n.type, 'leave_approved'))
    docNotifications.forEach(n => assert.equal(n.type, 'document_uploaded'))
  })

  test('deve falhar ao buscar notificacao de outro usuario', async ({ assert }) => {
    const otherUser = await User.create({
      fullName: 'Other User',
      email: `other-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
      isActive: true,
    })

    const notification = await service.create(otherUser.id, {
      type: 'leave_approved',
      title: 'Teste',
      message: 'Teste',
    })

    await assert.rejects(
      () => service.findById(notification.id, user.id),
      'Row not found'
    )
  })
})

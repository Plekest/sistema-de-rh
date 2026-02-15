import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import UserService from '#services/user_service'
import User from '#models/user'

test.group('UserService', (group) => {
  let service: UserService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new UserService()
  })

  test('deve criar usuario', async ({ assert }) => {
    const user = await service.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    assert.isDefined(user.id)
    assert.equal(user.fullName, 'Test User')
    assert.equal(user.role, 'employee')
    assert.isTrue(user.isActive)
  })

  test('deve falhar ao criar usuario com email duplicado', async ({ assert }) => {
    const email = `duplicate-${Date.now()}@example.com`

    await service.create({
      fullName: 'User 1',
      email,
      password: 'password123',
      role: 'employee',
    })

    await assert.rejects(
      () => service.create({
        fullName: 'User 2',
        email,
        password: 'password456',
        role: 'employee',
      }),
      'E-mail ja cadastrado'
    )
  })

  test('deve listar usuarios', async ({ assert }) => {
    await service.create({
      fullName: 'User 1',
      email: `user1-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    await service.create({
      fullName: 'User 2',
      email: `user2-${Date.now()}@example.com`,
      password: 'password123',
      role: 'manager',
    })

    const result = await service.list({ page: 1, limit: 10 })

    assert.isAtLeast(result.length, 2)
  })

  test('deve filtrar usuarios por role', async ({ assert }) => {
    await service.create({
      fullName: 'Admin User',
      email: `admin-${Date.now()}@example.com`,
      password: 'password123',
      role: 'admin',
    })

    await service.create({
      fullName: 'Employee User',
      email: `employee-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    const adminResult = await service.list({ role: 'admin' })
    const employeeResult = await service.list({ role: 'employee' })

    assert.isAtLeast(adminResult.length, 1)
    assert.isAtLeast(employeeResult.length, 1)
    adminResult.forEach(u => assert.equal(u.role, 'admin'))
    employeeResult.forEach(u => assert.equal(u.role, 'employee'))
  })

  test('deve filtrar usuarios por isActive', async ({ assert }) => {
    await service.create({
      fullName: 'Active User',
      email: `active-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    const inactive = await service.create({
      fullName: 'Inactive User',
      email: `inactive-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    await service.update(inactive.id, { isActive: false })

    const activeResult = await service.list({ isActive: true })
    const inactiveResult = await service.list({ isActive: false })

    assert.isAtLeast(activeResult.length, 1)
    assert.isAtLeast(inactiveResult.length, 1)
    activeResult.forEach(u => assert.isTrue(u.isActive))
    inactiveResult.forEach(u => assert.isFalse(u.isActive))
  })

  test('deve buscar por texto em fullName e email', async ({ assert }) => {
    await service.create({
      fullName: 'John Doe',
      email: `john-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    const resultByName = await service.list({ search: 'John' })
    const resultByEmail = await service.list({ search: 'john' })

    assert.isAtLeast(resultByName.length, 1)
    assert.isAtLeast(resultByEmail.length, 1)
  })

  test('deve buscar usuario por ID', async ({ assert }) => {
    const created = await service.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    const found = await service.findById(created.id)

    assert.equal(found.id, created.id)
    assert.equal(found.email, created.email)
  })

  test('deve atualizar fullName', async ({ assert }) => {
    const user = await service.create({
      fullName: 'Old Name',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    const updated = await service.update(user.id, {
      fullName: 'New Name',
    })

    assert.equal(updated.fullName, 'New Name')
  })

  test('deve atualizar email', async ({ assert }) => {
    const user = await service.create({
      fullName: 'Test User',
      email: `old-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    const newEmail = `new-${Date.now()}@example.com`
    const updated = await service.update(user.id, {
      email: newEmail,
    })

    assert.equal(updated.email, newEmail)
  })

  test('deve falhar ao atualizar para email duplicado', async ({ assert }) => {
    const email1 = `user1-${Date.now()}@example.com`
    const email2 = `user2-${Date.now()}@example.com`

    const user1 = await service.create({
      fullName: 'User 1',
      email: email1,
      password: 'password123',
      role: 'employee',
    })

    await service.create({
      fullName: 'User 2',
      email: email2,
      password: 'password123',
      role: 'employee',
    })

    await assert.rejects(
      () => service.update(user1.id, { email: email2 }),
      'E-mail ja cadastrado'
    )
  })

  test('deve atualizar role', async ({ assert }) => {
    const user = await service.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    const updated = await service.update(user.id, {
      role: 'manager',
    })

    assert.equal(updated.role, 'manager')
  })

  test('deve atualizar senha', async () => {
    const user = await service.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'oldpassword',
      role: 'employee',
    })

    await service.update(user.id, {
      password: 'newpassword',
    })

    // Verifica que pode fazer login com a nova senha
    const updated = await User.findOrFail(user.id)
    await User.verifyCredentials(updated.email, 'newpassword')
  })

  test('deve desativar usuario ao deletar', async ({ assert }) => {
    const user = await service.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee',
    })

    assert.isTrue(user.isActive)

    const deleted = await service.delete(user.id)

    assert.isFalse(deleted.isActive)

    // Verifica que ainda existe no banco
    const found = await User.find(user.id)
    assert.isNotNull(found)
  })

  test('deve resetar senha', async () => {
    const user = await service.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'oldpassword',
      role: 'employee',
    })

    await service.resetPassword(user.id, 'newpassword123')

    // Verifica que pode fazer login com a nova senha
    const updated = await User.findOrFail(user.id)
    await User.verifyCredentials(updated.email, 'newpassword123')
  })

  test('deve manter email ao atualizar sem alterar', async ({ assert }) => {
    const email = `test-${Date.now()}@example.com`
    const user = await service.create({
      fullName: 'Test User',
      email,
      password: 'password123',
      role: 'employee',
    })

    const updated = await service.update(user.id, {
      fullName: 'Updated Name',
    })

    assert.equal(updated.email, email)
  })

  test('deve permitir atualizar com o mesmo email', async ({ assert }) => {
    const email = `test-${Date.now()}@example.com`
    const user = await service.create({
      fullName: 'Test User',
      email,
      password: 'password123',
      role: 'employee',
    })

    const updated = await service.update(user.id, {
      email, // Mesmo email
      fullName: 'Updated Name',
    })

    assert.equal(updated.email, email)
  })
})

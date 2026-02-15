import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import DepartmentService from '#services/department_service'
import Department from '#models/department'

test.group('DepartmentService', (group) => {
  let service: DepartmentService

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new DepartmentService()
  })

  test('deve criar departamento', async ({ assert }) => {
    const dept = await service.create({ name: 'Tecnologia' })

    assert.isDefined(dept.id)
    assert.equal(dept.name, 'Tecnologia')
  })

  test('deve falhar ao criar departamento com nome duplicado', async ({ assert }) => {
    await service.create({ name: 'TI' })

    await assert.rejects(
      () => service.create({ name: 'TI' }),
      'Ja existe um departamento com este nome'
    )
  })

  test('deve listar departamentos ordenados por nome', async ({ assert }) => {
    const timestamp = Date.now()
    await service.create({ name: `Vendas ${timestamp}` })
    await service.create({ name: `Financeiro ${timestamp}` })
    await service.create({ name: `RH ${timestamp}` })

    const list = await service.list()

    assert.isAtLeast(list.length, 3)

    // Verifica ordenacao
    const names = list.map(d => d.name)
    const sorted = [...names].sort()
    assert.deepEqual(names, sorted)
  })

  test('deve buscar departamento por ID', async ({ assert }) => {
    const created = await service.create({ name: `Marketing ${Date.now()}` })
    const found = await service.findById(created.id)

    assert.equal(found.id, created.id)
    assert.equal(found.name, created.name)
  })

  test('deve falhar ao buscar departamento inexistente', async ({ assert }) => {
    await assert.rejects(
      () => service.findById(99999),
      'Row not found'
    )
  })

  test('deve atualizar departamento', async ({ assert }) => {
    const timestamp = Date.now()
    const dept = await service.create({ name: `TI ${timestamp}` })

    const updated = await service.update(dept.id, { name: `Tecnologia da Informacao ${timestamp}` })

    assert.equal(updated.id, dept.id)
    assert.equal(updated.name, `Tecnologia da Informacao ${timestamp}`)
  })

  test('deve falhar ao atualizar para nome duplicado', async ({ assert }) => {
    const timestamp = Date.now()
    const dept1 = await service.create({ name: `TI ${timestamp}` })
    await service.create({ name: `RH ${timestamp}` })

    await assert.rejects(
      () => service.update(dept1.id, { name: `RH ${timestamp}` }),
      'Ja existe um departamento com este nome'
    )
  })

  test('deve permitir atualizar mantendo o mesmo nome', async ({ assert }) => {
    const name = `Financeiro ${Date.now()}`
    const dept = await service.create({ name })

    // Atualizar com o mesmo nome nao deve dar erro
    const updated = await service.update(dept.id, { name })

    assert.equal(updated.name, name)
  })

  test('deve deletar departamento', async ({ assert }) => {
    const dept = await service.create({ name: 'Temporario' })

    await service.delete(dept.id)

    // Verifica que nao existe mais
    const found = await Department.find(dept.id)
    assert.isNull(found)
  })

  test('deve falhar ao deletar departamento inexistente', async ({ assert }) => {
    await assert.rejects(
      () => service.delete(99999),
      'Row not found'
    )
  })

  test('deve carregar positions ao buscar por ID', async ({ assert }) => {
    const dept = await service.create({ name: `TI ${Date.now()}` })
    const found = await service.findById(dept.id)

    // Verifica que positions foi carregado (mesmo que vazio)
    assert.isDefined(found.positions)
    assert.isArray(found.positions)
  })
})

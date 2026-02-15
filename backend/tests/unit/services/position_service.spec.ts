import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import PositionService from '#services/position_service'
import DepartmentService from '#services/department_service'
import Position from '#models/position'

test.group('PositionService', (group) => {
  let service: PositionService
  let departmentService: DepartmentService
  let departmentId: number

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new PositionService()
    departmentService = new DepartmentService()

    // Criar departamento padrao para os testes
    const dept = await departmentService.create({ name: `Dept ${Date.now()}` })
    departmentId = dept.id
  })

  test('deve criar cargo sem departamento', async ({ assert }) => {
    const position = await service.create({ title: 'Analista', departmentId: null as any })

    assert.isDefined(position.id)
    assert.equal(position.title, 'Analista')
    assert.isNull(position.departmentId)
  })

  test('deve criar cargo com departamento', async ({ assert }) => {
    const position = await service.create({
      title: 'Desenvolvedor',
      departmentId,
    })

    assert.isDefined(position.id)
    assert.equal(position.title, 'Desenvolvedor')
    assert.equal(position.departmentId, departmentId)
    assert.isDefined(position.department)
  })

  test('deve listar cargos ordenados por titulo', async ({ assert }) => {
    await service.create({ title: 'Senior', departmentId })
    await service.create({ title: 'Junior', departmentId })
    await service.create({ title: 'Pleno', departmentId })

    const list = await service.list()

    assert.isAtLeast(list.length, 3)

    // Verifica ordenacao
    const titles = list.map(p => p.title)
    const sorted = [...titles].sort()
    assert.deepEqual(titles, sorted)
  })

  test('deve carregar departamento ao listar', async ({ assert }) => {
    await service.create({ title: 'Gerente', departmentId })

    const list = await service.list()

    const withDept = list.find(p => p.departmentId === departmentId)
    assert.isDefined(withDept)
    assert.isDefined(withDept!.department)
  })

  test('deve buscar cargo por ID', async ({ assert }) => {
    const created = await service.create({ title: 'Coordenador', departmentId })
    const found = await service.findById(created.id)

    assert.equal(found.id, created.id)
    assert.equal(found.title, 'Coordenador')
  })

  test('deve carregar departamento ao buscar por ID', async ({ assert }) => {
    const created = await service.create({
      title: 'Diretor',
      departmentId,
    })

    const found = await service.findById(created.id)

    assert.isDefined(found.department)
    assert.equal(found.department?.id, departmentId)
  })

  test('deve falhar ao buscar cargo inexistente', async ({ assert }) => {
    await assert.rejects(
      () => service.findById(99999),
      'Row not found'
    )
  })

  test('deve atualizar titulo do cargo', async ({ assert }) => {
    const position = await service.create({ title: 'Dev', departmentId })

    const updated = await service.update(position.id, {
      title: 'Desenvolvedor Full Stack',
    })

    assert.equal(updated.id, position.id)
    assert.equal(updated.title, 'Desenvolvedor Full Stack')
  })

  test('deve atualizar departamento do cargo', async ({ assert }) => {
    const otherDept = await departmentService.create({ name: `Other ${Date.now()}` })

    const position = await service.create({
      title: 'Analista',
      departmentId,
    })

    const updated = await service.update(position.id, {
      departmentId: otherDept.id,
    })

    assert.equal(updated.departmentId, otherDept.id)
    assert.equal(updated.department?.id, otherDept.id)
  })

  test('deve remover departamento do cargo', async ({ assert }) => {
    const position = await service.create({
      title: 'Consultor',
      departmentId,
    })

    const updated = await service.update(position.id, {
      departmentId: null,
    })

    assert.isNull(updated.departmentId)
  })

  test('deve deletar cargo', async ({ assert }) => {
    const position = await service.create({ title: 'Temporario', departmentId })

    await service.delete(position.id)

    const found = await Position.find(position.id)
    assert.isNull(found)
  })

  test('deve falhar ao deletar cargo inexistente', async ({ assert }) => {
    await assert.rejects(
      () => service.delete(99999),
      'Row not found'
    )
  })
})

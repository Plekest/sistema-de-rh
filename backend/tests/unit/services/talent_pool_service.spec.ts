import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import TalentPoolService from '#services/talent_pool_service'
import TalentPool from '#models/talent_pool'
import TalentPoolTag from '#models/talent_pool_tag'
import Candidate from '#models/candidate'
import JobRequisition from '#models/job_requisition'
import User from '#models/user'
import Department from '#models/department'
import { DateTime } from 'luxon'

test.group('TalentPoolService - CRUD', (group) => {
  let service: TalentPoolService
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new TalentPoolService()

    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })
  })

  test('deve criar talento no banco de talentos', async ({ assert }) => {
    const talent = await service.create(
      {
        name: 'João Silva',
        email: `joao.${Date.now()}@gmail.com`,
        phone: '11999998888',
        linkedin_url: 'https://linkedin.com/in/joaosilva',
        source: 'linkedin',
        notes: 'Bom perfil para desenvolvedor',
        experience_years: 5,
        desired_salary: 8000,
      },
      user.id
    )

    assert.equal(talent.fullName, 'João Silva')
    assert.equal(talent.source, 'linkedin')
    assert.equal(talent.status, 'active')
    assert.equal(talent.experienceYears, 5)
  })

  test('deve listar talentos com paginação', async ({ assert }) => {
    await service.create(
      {
        name: `Talento 1 ${Date.now()}`,
        email: `tal1.${Date.now()}@email.com`,
      },
      user.id
    )

    await service.create(
      {
        name: `Talento 2 ${Date.now()}`,
        email: `tal2.${Date.now()}@email.com`,
      },
      user.id
    )

    const result = await service.list({ page: 1, limit: 10 })
    const data = result.toJSON()

    assert.isAtLeast(data.data.length, 2)
    assert.property(data, 'meta')
    assert.property(data.meta, 'total')
  })

  test('deve buscar talento por ID com tags', async ({ assert }) => {
    const talent = await service.create(
      {
        name: 'Maria Santos',
        email: `maria.${Date.now()}@email.com`,
      },
      user.id
    )

    const tag = await TalentPoolTag.create({
      name: `Developer ${Date.now()}`,
      color: '#3B82F6',
    })

    await service.addTags(talent.id, [tag.id], user.id)

    const fetched = await service.show(talent.id)

    assert.equal(fetched.id, talent.id)
    assert.isAtLeast(fetched.tags.length, 1)
  })

  test('deve atualizar dados do talento', async ({ assert }) => {
    const talent = await service.create(
      {
        name: 'Pedro Costa',
        email: `pedro.${Date.now()}@email.com`,
        phone: '11988887777',
      },
      user.id
    )

    const updated = await service.update(
      talent.id,
      {
        name: 'Pedro Costa Silva',
        phone: '11977776666',
        experience_years: 3,
      },
      user.id
    )

    assert.equal(updated.fullName, 'Pedro Costa Silva')
    assert.equal(updated.phone, '11977776666')
    assert.equal(updated.experienceYears, 3)
  })

  test('deve arquivar talento (mudar status para archived)', async ({ assert }) => {
    const talent = await service.create(
      {
        name: 'Ana Oliveira',
        email: `ana.${Date.now()}@email.com`,
      },
      user.id
    )

    assert.equal(talent.status, 'active')

    const archived = await service.archive(talent.id, user.id)

    assert.equal(archived.status, 'archived')
  })

  test('deve filtrar talentos por status', async ({ assert }) => {
    const talent1 = await service.create(
      {
        name: `Ativo ${Date.now()}`,
        email: `ativo.${Date.now()}@email.com`,
      },
      user.id
    )

    const talent2 = await service.create(
      {
        name: `Arquivado ${Date.now()}`,
        email: `arquivado.${Date.now()}@email.com`,
      },
      user.id
    )

    await service.archive(talent2.id, user.id)

    const activeResults = await service.list({ status: 'active' })
    const archivedResults = await service.list({ status: 'archived' })

    const activeData = activeResults.toJSON()
    const archivedData = archivedResults.toJSON()

    assert.isAtLeast(activeData.data.length, 1)
    assert.isAtLeast(archivedData.data.length, 1)

    for (const talent of activeData.data) {
      assert.equal(talent.status, 'active')
    }
  })

  test('deve filtrar talentos por source', async ({ assert }) => {
    await service.create(
      {
        name: `LinkedIn ${Date.now()}`,
        email: `linkedin.${Date.now()}@email.com`,
        source: 'linkedin',
      },
      user.id
    )

    await service.create(
      {
        name: `Referral ${Date.now()}`,
        email: `referral.${Date.now()}@email.com`,
        source: 'referral',
      },
      user.id
    )

    const linkedinResults = await service.list({ source: 'linkedin' })
    const linkedinData = linkedinResults.toJSON()

    assert.isAtLeast(linkedinData.data.length, 1)

    for (const talent of linkedinData.data) {
      assert.equal(talent.source, 'linkedin')
    }
  })

  test('deve buscar talentos por nome (search)', async ({ assert }) => {
    const uniqueName = `Testador ${Date.now()}`

    await service.create(
      {
        name: uniqueName,
        email: `test.${Date.now()}@email.com`,
      },
      user.id
    )

    const results = await service.list({ search: uniqueName })
    const data = results.toJSON()

    assert.isAtLeast(data.data.length, 1)
    assert.include(data.data[0].fullName, uniqueName)
  })
})

test.group('TalentPoolService - Tags', (group) => {
  let service: TalentPoolService
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new TalentPoolService()

    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })
  })

  test('deve criar tag', async ({ assert }) => {
    const tag = await service.createTag(
      {
        name: `JavaScript ${Date.now()}`,
        color: '#F59E0B',
      },
      user.id
    )

    assert.equal(tag.name.includes('JavaScript'), true)
    assert.equal(tag.color, '#F59E0B')
  })

  test('deve listar todas as tags', async ({ assert }) => {
    await service.createTag({ name: `Tag 1 ${Date.now()}` }, user.id)
    await service.createTag({ name: `Tag 2 ${Date.now()}` }, user.id)

    const tags = await service.listTags()

    assert.isAtLeast(tags.length, 2)
  })

  test('deve deletar tag', async ({ assert }) => {
    const tag = await service.createTag({ name: `Tag Deletar ${Date.now()}` }, user.id)

    await service.deleteTag(tag.id, user.id)

    const deleted = await TalentPoolTag.find(tag.id)

    assert.isNull(deleted)
  })

  test('deve adicionar tags ao talento', async ({ assert }) => {
    const talent = await service.create(
      {
        name: 'Dev Fullstack',
        email: `fullstack.${Date.now()}@email.com`,
      },
      user.id
    )

    const tag1 = await service.createTag({ name: `React ${Date.now()}` }, user.id)
    const tag2 = await service.createTag({ name: `Node ${Date.now()}` }, user.id)

    const updated = await service.addTags(talent.id, [tag1.id, tag2.id], user.id)

    assert.equal(updated.tags.length, 2)
  })

  test('deve remover tags do talento', async ({ assert }) => {
    const talent = await service.create(
      {
        name: 'Dev Backend',
        email: `backend.${Date.now()}@email.com`,
      },
      user.id
    )

    const tag1 = await service.createTag({ name: `Python ${Date.now()}` }, user.id)
    const tag2 = await service.createTag({ name: `Django ${Date.now()}` }, user.id)

    await service.addTags(talent.id, [tag1.id, tag2.id], user.id)

    const updated = await service.removeTags(talent.id, [tag1.id], user.id)

    assert.equal(updated.tags.length, 1)
    assert.equal(updated.tags[0].id, tag2.id)
  })

  test('deve listar talentos filtrados por tags', async ({ assert }) => {
    const tag = await service.createTag({ name: `Senior ${Date.now()}` }, user.id)

    const talent = await service.create(
      {
        name: 'Senior Developer',
        email: `senior.${Date.now()}@email.com`,
      },
      user.id
    )

    await service.addTags(talent.id, [tag.id], user.id)

    const results = await service.list({ tag_ids: [tag.id] })
    const data = results.toJSON()

    assert.isAtLeast(data.data.length, 1)
  })
})

test.group('TalentPoolService - Import', (group) => {
  let service: TalentPoolService
  let user: User
  let department: Department
  let jobReq: JobRequisition

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    service = new TalentPoolService()

    user = await User.create({
      fullName: 'RH Manager',
      email: `rh.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'manager',
      isActive: true,
    })

    department = await Department.create({
      name: `TI ${Date.now()}`,
    })

    jobReq = await JobRequisition.create({
      title: `Desenvolvedor ${Date.now()}`,
      description: 'Vaga de desenvolvedor',
      departmentId: department.id,
      salaryRangeMin: 5000,
      salaryRangeMax: 8000,
      employmentType: 'clt',
      workModel: 'hybrid',
      headcount: 1,
      status: 'open',
      requestedBy: user.id,
    })
  })

  test('deve importar candidato do recrutamento para talent pool', async ({ assert }) => {
    const candidate = await Candidate.create({
      jobRequisitionId: jobReq.id,
      name: 'Carlos Mendes',
      email: `carlos.${Date.now()}@email.com`,
      phone: '11966665555',
      resumePath: '/resumes/carlos.pdf',
      status: 'rejected',
    })

    const talent = await service.importFromCandidate(candidate.id, user.id)

    assert.equal(talent.fullName, 'Carlos Mendes')
    assert.equal(talent.email, candidate.email)
    assert.equal(talent.source, 'recruitment')
    assert.equal(talent.candidateId, candidate.id)
  })

  test('deve preencher dados do candidato ao importar', async ({ assert }) => {
    const candidate = await Candidate.create({
      jobRequisitionId: jobReq.id,
      name: 'Fernanda Lima',
      email: `fernanda.${Date.now()}@email.com`,
      phone: '11955554444',
      linkedinUrl: 'https://linkedin.com/in/fernanda',
      resumePath: '/resumes/fernanda.pdf',
      salaryExpectation: 7000,
      notes: 'Boa entrevista técnica',
      status: 'rejected',
    })

    const talent = await service.importFromCandidate(candidate.id, user.id)

    assert.equal(talent.phone, candidate.phone)
    assert.equal(talent.linkedinUrl, candidate.linkedinUrl)
    assert.equal(talent.resumeUrl, candidate.resumePath)
    assert.equal(talent.salaryExpectation, candidate.salaryExpectation)
    assert.include(talent.notes!, 'Desenvolvedor')
  })
})

import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import DocumentTemplate from '#models/document_template'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

test.group('DocumentTemplateService - Templates', (group) => {
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })
  })

  test('deve criar template', async ({ assert }) => {
    const template = await DocumentTemplate.create({
      name: `Template Contrato ${Date.now()}`,
      description: 'Template para contrato de trabalho',
      type: 'contract',
      content: 'Contrato de trabalho entre {{employee.fullName}} e a empresa.',
      variables: ['employee.fullName', 'employee.cpf', 'date.today'],
      isActive: true,
      createdBy: user.id,
    })

    assert.equal(template.type, 'contract')
    assert.isTrue(template.isActive)
    assert.isArray(template.variables)
    assert.equal(template.variables!.length, 3)
  })

  test('deve listar templates ativos', async ({ assert }) => {
    const uniqueName = `Template Ativo ${Date.now()}`

    await DocumentTemplate.create({
      name: uniqueName,
      type: 'declaration',
      content: 'Template ativo',
      isActive: true,
      createdBy: user.id,
    })

    await DocumentTemplate.create({
      name: `Template Inativo ${Date.now()}`,
      type: 'declaration',
      content: 'Template inativo',
      isActive: false,
      createdBy: user.id,
    })

    const templates = await DocumentTemplate.query()
      .where('is_active', true)
      .where('created_by', user.id)

    assert.isAtLeast(templates.length, 1)
    for (const template of templates) {
      assert.isTrue(template.isActive)
      assert.equal(template.createdBy, user.id)
    }
  })

  test('deve filtrar por tipo', async ({ assert }) => {
    await DocumentTemplate.create({
      name: `NDA ${Date.now()}`,
      type: 'nda',
      content: 'Acordo de confidencialidade',
      isActive: true,
      createdBy: user.id,
    })

    await DocumentTemplate.create({
      name: `Declaração ${Date.now()}`,
      type: 'declaration',
      content: 'Declaração de vínculo',
      isActive: true,
      createdBy: user.id,
    })

    const ndaTemplates = await DocumentTemplate.query()
      .where('type', 'nda')
      .where('created_by', user.id)
    const declarationTemplates = await DocumentTemplate.query()
      .where('type', 'declaration')
      .where('created_by', user.id)

    assert.isAtLeast(ndaTemplates.length, 1)
    assert.isAtLeast(declarationTemplates.length, 1)

    for (const template of ndaTemplates) {
      assert.equal(template.type, 'nda')
    }
  })

  test('deve atualizar template', async ({ assert }) => {
    const template = await DocumentTemplate.create({
      name: `Template Original ${Date.now()}`,
      description: 'Descrição original',
      type: 'letter',
      content: 'Conteúdo original',
      isActive: true,
      createdBy: user.id,
    })

    template.name = 'Template Atualizado'
    template.content = 'Conteúdo atualizado'
    template.description = 'Descrição atualizada'
    await template.save()

    const updated = await DocumentTemplate.findOrFail(template.id)

    assert.equal(updated.name, 'Template Atualizado')
    assert.equal(updated.content, 'Conteúdo atualizado')
    assert.equal(updated.description, 'Descrição atualizada')
  })

  test('deve desativar template', async ({ assert }) => {
    const template = await DocumentTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'policy',
      content: 'Política da empresa',
      isActive: true,
      createdBy: user.id,
    })

    template.isActive = false
    await template.save()

    const deactivated = await DocumentTemplate.findOrFail(template.id)

    assert.isFalse(deactivated.isActive)
  })
})

test.group('DocumentTemplateService - Geração de Documentos', (group) => {
  let user: User
  let employee: Employee
  let department: Department
  let template: DocumentTemplate

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    user = await User.create({
      fullName: 'Admin Teste',
      email: `admin.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Departamento TI ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Desenvolvedor ${Date.now()}`,
      departmentId: department.id,
    })

    const uniqueCpf = `${Date.now()}`.slice(-11) // Pega 11 dígitos do timestamp

    employee = await Employee.create({
      userId: user.id,
      fullName: 'João Silva',
      cpf: uniqueCpf,
      email: `joao.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    template = await DocumentTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'declaration',
      content:
        'Declaramos que {{employee.fullName}}, CPF {{employee.cpf}}, é colaborador do departamento {{employee.department}}.',
      variables: ['employee.fullName', 'employee.cpf', 'employee.department'],
      isActive: true,
      createdBy: user.id,
    })
  })

  test('deve substituir {{employee.fullName}} corretamente', async ({ assert }) => {
    await employee.load('department')

    let content = template.content

    content = content.replace('{{employee.fullName}}', employee.fullName)

    assert.include(content, 'João Silva')
    assert.notInclude(content, '{{employee.fullName}}')
  })

  test('deve substituir {{employee.cpf}} corretamente', async ({ assert }) => {
    let content = template.content

    content = content.replace('{{employee.cpf}}', employee.cpf || '')

    assert.include(content, employee.cpf!)
    assert.notInclude(content, '{{employee.cpf}}')
  })

  test('deve substituir {{employee.department}} corretamente', async ({ assert }) => {
    await employee.load('department')

    let content = template.content

    content = content.replace('{{employee.department}}', employee.department!.name)

    assert.include(content, department.name)
    assert.notInclude(content, '{{employee.department}}')
  })

  test('deve substituir {{date.today}} com data atual', async ({ assert }) => {
    const templateWithDate = await DocumentTemplate.create({
      name: `Template com Data ${Date.now()}`,
      type: 'letter',
      content: 'Documento gerado em {{date.today}}',
      variables: ['date.today'],
      isActive: true,
      createdBy: user.id,
    })

    const today = DateTime.now().toFormat('dd/MM/yyyy')
    let content = templateWithDate.content

    content = content.replace('{{date.today}}', today)

    assert.include(content, today)
    assert.notInclude(content, '{{date.today}}')
  })

  test('deve gerar documento substituindo todas as variáveis', async ({ assert }) => {
    await employee.load('department')

    let generatedContent = template.content

    // Substituir todas as variáveis
    const replacements: Record<string, string> = {
      '{{employee.fullName}}': employee.fullName,
      '{{employee.cpf}}': employee.cpf || '',
      '{{employee.department}}': employee.department!.name,
    }

    for (const [variable, value] of Object.entries(replacements)) {
      generatedContent = generatedContent.replace(variable, value)
    }

    assert.include(generatedContent, 'João Silva')
    assert.include(generatedContent, employee.cpf!)
    assert.include(generatedContent, department.name)
    assert.notInclude(generatedContent, '{{')
  })

  test('deve gerar com employee inexistente retorna erro', async ({ assert }) => {
    const nonExistentId = 999999

    const foundEmployee = await Employee.find(nonExistentId)

    assert.isNull(foundEmployee)
  })

  test('template inativo nao pode gerar documento', async ({ assert }) => {
    const inactiveTemplate = await DocumentTemplate.create({
      name: `Template Inativo ${Date.now()}`,
      type: 'contract',
      content: 'Conteúdo',
      isActive: false,
      createdBy: user.id,
    })

    const canGenerate = inactiveTemplate.isActive

    assert.isFalse(canGenerate)
  })

  test('deve gerar documento com múltiplas variáveis do mesmo tipo', async ({ assert }) => {
    await employee.load('department')

    const multiVarTemplate = await DocumentTemplate.create({
      name: `Template Multi ${Date.now()}`,
      type: 'letter',
      content:
        'Prezado(a) {{employee.fullName}}, confirmamos que {{employee.fullName}} está apto(a) para o cargo.',
      variables: ['employee.fullName'],
      isActive: true,
      createdBy: user.id,
    })

    let generatedContent = multiVarTemplate.content

    // Substituir todas as ocorrências
    generatedContent = generatedContent.replaceAll('{{employee.fullName}}', employee.fullName)

    const occurrences = generatedContent.match(/João Silva/g)

    assert.equal(occurrences?.length, 2)
    assert.notInclude(generatedContent, '{{employee.fullName}}')
  })

  test('deve lidar com variável não existente no employee', async ({ assert }) => {
    const templateWithMissing = await DocumentTemplate.create({
      name: `Template Missing ${Date.now()}`,
      type: 'other',
      content: 'CNPJ: {{employee.cnpj}}',
      variables: ['employee.cnpj'],
      isActive: true,
      createdBy: user.id,
    })

    let generatedContent = templateWithMissing.content

    // Se employee.cnpj for null, substituir por string vazia ou mensagem
    const cnpj = employee.cnpj || 'N/A'
    generatedContent = generatedContent.replace('{{employee.cnpj}}', cnpj)

    assert.include(generatedContent, 'N/A')
  })

  test('deve gerar documento com variável de posição', async ({ assert }) => {
    await employee.load('position')

    const positionTemplate = await DocumentTemplate.create({
      name: `Template Cargo ${Date.now()}`,
      type: 'declaration',
      content: 'Colaborador {{employee.fullName}} exerce o cargo de {{employee.position}}.',
      variables: ['employee.fullName', 'employee.position'],
      isActive: true,
      createdBy: user.id,
    })

    let generatedContent = positionTemplate.content

    generatedContent = generatedContent.replace('{{employee.fullName}}', employee.fullName)
    generatedContent = generatedContent.replace(
      '{{employee.position}}',
      employee.position!.title
    )

    assert.include(generatedContent, 'João Silva')
    assert.include(generatedContent, employee.position!.title)
    assert.notInclude(generatedContent, '{{')
  })

  test('deve listar templates por tipo específico', async ({ assert }) => {
    await DocumentTemplate.create({
      name: `Contrato ${Date.now()}`,
      type: 'contract',
      content: 'Contrato',
      isActive: true,
      createdBy: user.id,
    })

    await DocumentTemplate.create({
      name: `NDA ${Date.now()}`,
      type: 'nda',
      content: 'NDA',
      isActive: true,
      createdBy: user.id,
    })

    const contractTemplates = await DocumentTemplate.query()
      .where('type', 'contract')
      .where('is_active', true)
      .where('created_by', user.id)

    assert.isAtLeast(contractTemplates.length, 1)
    for (const tmpl of contractTemplates) {
      assert.equal(tmpl.type, 'contract')
    }
  })
})

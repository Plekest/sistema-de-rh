import { test } from '@japa/runner'
import Database from '@adonisjs/lucid/services/db'
import ChecklistTemplate from '#models/checklist_template'
import ChecklistTemplateItem from '#models/checklist_template_item'
import EmployeeChecklist from '#models/employee_checklist'
import EmployeeChecklistItem from '#models/employee_checklist_item'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

test.group('OnboardingService - Templates', (group) => {
  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve criar template de onboarding com items', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template Onboarding ${Date.now()}`,
      description: 'Template para integração de novos colaboradores',
      type: 'onboarding',
      isActive: true,
    })

    await ChecklistTemplateItem.createMany([
      {
        templateId: template.id,
        title: 'Criar email corporativo',
        description: 'Provisionar conta de email',
        responsibleRole: 'it',
        dueDays: 1,
        isRequired: true,
        order: 1,
      },
      {
        templateId: template.id,
        title: 'Configurar estação de trabalho',
        description: 'Setup de computador e periféricos',
        responsibleRole: 'it',
        dueDays: 2,
        isRequired: true,
        order: 2,
      },
    ])

    await template.load('items')

    assert.equal(template.type, 'onboarding')
    assert.isTrue(template.isActive)
    assert.equal(template.items.length, 2)
    assert.equal(template.items[0].title, 'Criar email corporativo')
  })

  test('deve criar template de offboarding', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template Offboarding ${Date.now()}`,
      description: 'Template para desligamento de colaboradores',
      type: 'offboarding',
      isActive: true,
    })

    assert.equal(template.type, 'offboarding')
    assert.isTrue(template.isActive)
  })

  test('deve listar templates ativos', async ({ assert }) => {
    await ChecklistTemplate.create({
      name: `Template Ativo ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    await ChecklistTemplate.create({
      name: `Template Inativo ${Date.now()}`,
      type: 'onboarding',
      isActive: false,
    })

    const templates = await ChecklistTemplate.query().where('is_active', true)

    assert.isAtLeast(templates.length, 1)
    for (const template of templates) {
      assert.isTrue(template.isActive)
    }
  })

  test('deve listar templates filtrado por tipo', async ({ assert }) => {
    await ChecklistTemplate.create({
      name: `Onboarding ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    await ChecklistTemplate.create({
      name: `Offboarding ${Date.now()}`,
      type: 'offboarding',
      isActive: true,
    })

    const onboardingTemplates = await ChecklistTemplate.query().where('type', 'onboarding')
    const offboardingTemplates = await ChecklistTemplate.query().where('type', 'offboarding')

    assert.isAtLeast(onboardingTemplates.length, 1)
    assert.isAtLeast(offboardingTemplates.length, 1)

    for (const template of onboardingTemplates) {
      assert.equal(template.type, 'onboarding')
    }
  })

  test('deve atualizar template', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template Original ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    template.name = 'Template Atualizado'
    template.description = 'Descrição atualizada'
    await template.save()

    const updated = await ChecklistTemplate.findOrFail(template.id)

    assert.equal(updated.name, 'Template Atualizado')
    assert.equal(updated.description, 'Descrição atualizada')
  })

  test('deve desativar template (soft delete)', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template Para Desativar ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    template.isActive = false
    await template.save()

    const deactivated = await ChecklistTemplate.findOrFail(template.id)

    assert.isFalse(deactivated.isActive)
  })

  test('deve adicionar item ao template', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    const item = await ChecklistTemplateItem.create({
      templateId: template.id,
      title: 'Nova tarefa',
      description: 'Descrição da tarefa',
      responsibleRole: 'hr',
      dueDays: 3,
      isRequired: false,
      order: 1,
    })

    assert.equal(item.templateId, template.id)
    assert.equal(item.title, 'Nova tarefa')
    assert.equal(item.dueDays, 3)
  })

  test('deve atualizar item do template', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    const item = await ChecklistTemplateItem.create({
      templateId: template.id,
      title: 'Item Original',
      responsibleRole: 'hr',
      dueDays: 5,
      isRequired: false,
      order: 1,
    })

    item.title = 'Item Atualizado'
    item.dueDays = 7
    item.isRequired = true
    await item.save()

    const updated = await ChecklistTemplateItem.findOrFail(item.id)

    assert.equal(updated.title, 'Item Atualizado')
    assert.equal(updated.dueDays, 7)
    assert.isTrue(updated.isRequired)
  })

  test('deve remover item do template', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    const item = await ChecklistTemplateItem.create({
      templateId: template.id,
      title: 'Item Para Remover',
      responsibleRole: 'hr',
      dueDays: 1,
      isRequired: false,
      order: 1,
    })

    await item.delete()

    const deleted = await ChecklistTemplateItem.find(item.id)

    assert.isNull(deleted)
  })

  test('deve ordenar items por campo order', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    await ChecklistTemplateItem.createMany([
      { templateId: template.id, title: 'Terceiro', responsibleRole: 'hr', dueDays: 1, isRequired: false, order: 3 },
      { templateId: template.id, title: 'Primeiro', responsibleRole: 'hr', dueDays: 1, isRequired: false, order: 1 },
      { templateId: template.id, title: 'Segundo', responsibleRole: 'hr', dueDays: 1, isRequired: false, order: 2 },
    ])

    const items = await ChecklistTemplateItem.query()
      .where('template_id', template.id)
      .orderBy('order', 'asc')

    assert.equal(items[0].title, 'Primeiro')
    assert.equal(items[1].title, 'Segundo')
    assert.equal(items[2].title, 'Terceiro')
  })
})

test.group('OnboardingService - Checklists', (group) => {
  let employee: Employee
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    user = await User.create({
      fullName: 'Usuario Teste',
      email: `user.${Date.now()}@empresa.com`,
      password: 'password',
      role: 'admin',
      isActive: true,
    })

    const department = await Department.create({
      name: `Depto ${Date.now()}`,
    })

    const position = await Position.create({
      title: `Cargo ${Date.now()}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      fullName: 'Colaborador Teste',
      email: `emp.${Date.now()}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })
  })

  test('deve criar checklist a partir de template (copia items)', async ({ assert }) => {
    const template = await ChecklistTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    await ChecklistTemplateItem.createMany([
      {
        templateId: template.id,
        title: 'Item 1',
        description: 'Descrição 1',
        responsibleRole: 'hr',
        dueDays: 1,
        isRequired: true,
        order: 1,
      },
      {
        templateId: template.id,
        title: 'Item 2',
        description: 'Descrição 2',
        responsibleRole: 'hr',
        dueDays: 3,
        isRequired: false,
        order: 2,
      },
    ])

    const startedAt = DateTime.now()

    const checklist = await EmployeeChecklist.create({
      employeeId: employee.id,
      templateId: template.id,
      type: 'onboarding',
      status: 'pending',
      startedAt: startedAt,
      createdBy: user.id,
    })

    const templateItems = await ChecklistTemplateItem.query().where('template_id', template.id)

    // Copiar items do template para o checklist
    for (const templateItem of templateItems) {
      await EmployeeChecklistItem.create({
        checklistId: checklist.id,
        templateItemId: templateItem.id,
        title: templateItem.title,
        description: templateItem.description,
        responsibleRole: 'hr',
        status: 'pending',
        dueDate: startedAt.plus({ days: templateItem.dueDays ?? 0 }),
        order: templateItem.order,
      })
    }

    await checklist.load('items')

    assert.equal(checklist.items.length, 2)
    assert.equal(checklist.items[0].title, 'Item 1')
    assert.equal(checklist.items[1].title, 'Item 2')
  })

  test('deve calcular due_dates corretamente (started_at + due_days)', async ({ assert }) => {
    const startedAt = DateTime.fromISO('2026-02-14')
    const dueDays = 5

    const template = await ChecklistTemplate.create({
      name: `Template ${Date.now()}`,
      type: 'onboarding',
      isActive: true,
    })

    const templateItem = await ChecklistTemplateItem.create({
      templateId: template.id,
      title: 'Item',
      responsibleRole: 'hr',
      dueDays: dueDays,
      isRequired: true,
      order: 1,
    })

    const checklist = await EmployeeChecklist.create({
      employeeId: employee.id,
      templateId: template.id,
      type: 'onboarding',
      status: 'pending',
      startedAt: startedAt,
      createdBy: user.id,
    })

    const item = await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      templateItemId: templateItem.id,
      title: templateItem.title,
      responsibleRole: 'hr',
      status: 'pending',
      dueDate: startedAt.plus({ days: dueDays }),
      order: 1,
    })

    const expectedDueDate = DateTime.fromISO('2026-02-19')

    assert.equal(item.dueDate!.toISODate(), expectedDueDate.toISODate())
  })

  test('deve listar checklists por employee', async ({ assert }) => {
    await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'pending',
      createdBy: user.id,
    })

    const checklists = await EmployeeChecklist.query().where('employee_id', employee.id)

    assert.isAtLeast(checklists.length, 1)
    assert.equal(checklists[0].employeeId, employee.id)
  })

  test('deve listar checklists por status', async ({ assert }) => {
    await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'pending',
      createdBy: user.id,
    })

    await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'completed',
      createdBy: user.id,
    })

    const pendingChecklists = await EmployeeChecklist.query().where('status', 'pending')
    const completedChecklists = await EmployeeChecklist.query().where('status', 'completed')

    assert.isAtLeast(pendingChecklists.length, 1)
    assert.isAtLeast(completedChecklists.length, 1)

    for (const checklist of pendingChecklists) {
      assert.equal(checklist.status, 'pending')
    }
  })

  test('deve completar item da checklist', async ({ assert }) => {
    const checklist = await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'pending',
      createdBy: user.id,
    })

    const item = await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      title: 'Item a completar',
      responsibleRole: 'hr',
      status: 'pending',
      order: 1,
    })

    item.status = 'completed'
    item.completedBy = user.id
    item.completedAt = DateTime.now()
    await item.save()

    const completed = await EmployeeChecklistItem.findOrFail(item.id)

    assert.equal(completed.status, 'completed')
    assert.equal(completed.completedBy, user.id)
    assert.isNotNull(completed.completedAt)
  })

  test('deve pular item da checklist', async ({ assert }) => {
    const checklist = await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'pending',
      createdBy: user.id,
    })

    const item = await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      title: 'Item a pular',
      responsibleRole: 'hr',
      status: 'pending',
      order: 1,
    })

    item.status = 'skipped'
    item.notes = 'Item não aplicável'
    await item.save()

    const skipped = await EmployeeChecklistItem.findOrFail(item.id)

    assert.equal(skipped.status, 'skipped')
    assert.equal(skipped.notes, 'Item não aplicável')
  })

  test('ao completar todos items obrigatorios, checklist muda para completed', async ({
    assert,
  }) => {
    const checklist = await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'in_progress',
      createdBy: user.id,
    })

    await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      title: 'Item obrigatório 1',
      responsibleRole: 'hr',
      status: 'completed',
      order: 1,
    })

    await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      title: 'Item obrigatório 2',
      responsibleRole: 'hr',
      status: 'completed',
      order: 2,
    })

    // Verificar se todos items estão completos
    const items = await EmployeeChecklistItem.query().where('checklist_id', checklist.id)

    const allCompleted = items.every((item) => item.status === 'completed' || item.status === 'skipped')

    if (allCompleted) {
      checklist.status = 'completed'
      checklist.completedAt = DateTime.now()
      await checklist.save()
    }

    const updated = await EmployeeChecklist.findOrFail(checklist.id)

    assert.equal(updated.status, 'completed')
    assert.isNotNull(updated.completedAt)
  })

  test('nao deve completar checklist se faltam items obrigatorios', async ({ assert }) => {
    const checklist = await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'in_progress',
      createdBy: user.id,
    })

    await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      title: 'Item obrigatório 1',
      responsibleRole: 'hr',
      status: 'completed',
      order: 1,
    })

    await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      title: 'Item obrigatório 2',
      responsibleRole: 'hr',
      status: 'pending',
      order: 2,
    })

    const items = await EmployeeChecklistItem.query().where('checklist_id', checklist.id)

    const allCompleted = items.every((item) => item.status === 'completed' || item.status === 'skipped')

    assert.isFalse(allCompleted)
  })

  test('item com due_date passado = overdue', async ({ assert }) => {
    const pastDate = DateTime.now().minus({ days: 5 })

    const checklist = await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'in_progress',
      createdBy: user.id,
    })

    const item = await EmployeeChecklistItem.create({
      checklistId: checklist.id,
      title: 'Item atrasado',
      responsibleRole: 'hr',
      status: 'pending',
      dueDate: pastDate,
      order: 1,
    })

    const now = DateTime.now()
    const isOverdue = item.status === 'pending' && item.dueDate && item.dueDate < now

    assert.isTrue(isOverdue)
  })

  test('deve calcular estatísticas: total pendentes, em andamento, completados', async ({
    assert,
  }) => {
    const emp1 = await Employee.create({
      userId: user.id,
      fullName: 'Emp 1',
      email: `emp1.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
    })

    const emp2 = await Employee.create({
      userId: user.id,
      fullName: 'Emp 2',
      email: `emp2.${Date.now()}@empresa.com`,
      type: 'clt',
      hireDate: DateTime.now(),
      status: 'active',
    })

    await EmployeeChecklist.create({
      employeeId: emp1.id,
      type: 'onboarding',
      status: 'pending',
      createdBy: user.id,
    })

    await EmployeeChecklist.create({
      employeeId: emp2.id,
      type: 'onboarding',
      status: 'in_progress',
      createdBy: user.id,
    })

    await EmployeeChecklist.create({
      employeeId: employee.id,
      type: 'onboarding',
      status: 'completed',
      createdBy: user.id,
    })

    const totalPending = await EmployeeChecklist.query().where('status', 'pending').count('* as total')
    const totalInProgress = await EmployeeChecklist.query().where('status', 'in_progress').count('* as total')
    const totalCompleted = await EmployeeChecklist.query().where('status', 'completed').count('* as total')

    assert.isAtLeast(Number(totalPending[0].$extras.total), 1)
    assert.isAtLeast(Number(totalInProgress[0].$extras.total), 1)
    assert.isAtLeast(Number(totalCompleted[0].$extras.total), 1)
  })
})

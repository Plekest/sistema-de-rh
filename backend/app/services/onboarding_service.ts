import ChecklistTemplate from '#models/checklist_template'
import ChecklistTemplateItem from '#models/checklist_template_item'
import EmployeeChecklist from '#models/employee_checklist'
import EmployeeChecklistItem from '#models/employee_checklist_item'
import Employee from '#models/employee'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'

interface ListTemplatesFilters {
  page?: number
  limit?: number
  type?: 'onboarding' | 'offboarding'
  isActive?: boolean
}

interface CreateTemplateData {
  name: string
  description?: string | null
  type: 'onboarding' | 'offboarding'
  isActive?: boolean
}

interface CreateTemplateItemData {
  title: string
  description?: string | null
  responsibleRole: 'hr' | 'manager' | 'it' | 'employee' | 'other'
  dueDays?: number | null
  isRequired?: boolean
  order?: number
}

interface CreateChecklistData {
  employeeId: number
  templateId: number
  startedAt?: string
}

interface ListChecklistsFilters {
  page?: number
  limit?: number
  employeeId?: number
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  type?: 'onboarding' | 'offboarding'
}

export default class OnboardingService {
  // ==================== TEMPLATES ====================

  async listTemplates(filters: ListTemplatesFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = ChecklistTemplate.query().preload('creator').orderBy('name', 'asc')

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.isActive !== undefined) {
      query.where('isActive', filters.isActive)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async createTemplate(data: CreateTemplateData, currentUserId?: number) {
    const template = await ChecklistTemplate.create({
      name: data.name,
      description: data.description || null,
      type: data.type,
      isActive: data.isActive ?? true,
      createdBy: currentUserId || null,
    })

    await template.load('creator')

    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'onboarding_template',
      resourceId: template.id,
      description: `Template de ${data.type} criado: ${template.name}`,
      newValues: { name: template.name, type: template.type },
    })

    return template
  }

  async showTemplate(id: number) {
    const template = await ChecklistTemplate.query()
      .where('id', id)
      .preload('creator')
      .preload('items', (query) => query.orderBy('order', 'asc'))
      .firstOrFail()

    return template
  }

  async updateTemplate(id: number, data: Partial<CreateTemplateData>, currentUserId?: number) {
    const template = await ChecklistTemplate.findOrFail(id)

    template.merge(data)
    await template.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'onboarding_template',
      resourceId: template.id,
      description: `Template atualizado: ${template.name}`,
      newValues: data,
    })

    return template
  }

  async deleteTemplate(id: number, currentUserId?: number) {
    const template = await ChecklistTemplate.findOrFail(id)
    template.isActive = false
    await template.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'delete',
      resourceType: 'onboarding_template',
      resourceId: template.id,
      description: `Template desativado: ${template.name}`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    })

    return template
  }

  // ==================== TEMPLATE ITEMS ====================

  async addItem(templateId: number, data: CreateTemplateItemData, currentUserId?: number) {
    const template = await ChecklistTemplate.findOrFail(templateId)

    // Se order nao informado, pega o proximo
    let order = data.order ?? 0
    if (order === 0) {
      const lastItem = await ChecklistTemplateItem.query()
        .where('templateId', templateId)
        .orderBy('order', 'desc')
        .first()
      order = lastItem ? lastItem.order + 1 : 1
    }

    const item = await ChecklistTemplateItem.create({
      templateId,
      title: data.title,
      description: data.description || null,
      responsibleRole: data.responsibleRole,
      dueDays: data.dueDays ?? null,
      isRequired: data.isRequired ?? true,
      order,
    })

    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'onboarding_template_item',
      resourceId: item.id,
      description: `Item adicionado ao template ${template.name}: ${item.title}`,
      newValues: { title: item.title },
    })

    return item
  }

  async updateItem(
    templateId: number,
    itemId: number,
    data: Partial<CreateTemplateItemData>,
    currentUserId?: number
  ) {
    const item = await ChecklistTemplateItem.query()
      .where('id', itemId)
      .where('templateId', templateId)
      .firstOrFail()

    item.merge(data)
    await item.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'onboarding_template_item',
      resourceId: item.id,
      description: `Item atualizado: ${item.title}`,
      newValues: data,
    })

    return item
  }

  async deleteItem(templateId: number, itemId: number, currentUserId?: number) {
    const item = await ChecklistTemplateItem.query()
      .where('id', itemId)
      .where('templateId', templateId)
      .firstOrFail()

    await item.delete()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'delete',
      resourceType: 'onboarding_template_item',
      resourceId: item.id,
      description: `Item removido: ${item.title}`,
    })

    return item
  }

  // ==================== CHECKLISTS (INSTANCIAS) ====================

  async createChecklist(data: CreateChecklistData, currentUserId?: number) {
    const employee = await Employee.findOrFail(data.employeeId)
    const template = await ChecklistTemplate.query()
      .where('id', data.templateId)
      .preload('items', (query) => query.orderBy('order', 'asc'))
      .firstOrFail()

    if (!template.isActive) {
      throw new Error('Template inativo nao pode ser usado')
    }

    // Cria checklist
    const startedAt = data.startedAt ? DateTime.fromISO(data.startedAt) : DateTime.now()
    const checklist = await EmployeeChecklist.create({
      employeeId: data.employeeId,
      templateId: data.templateId,
      type: template.type,
      status: 'pending',
      startedAt,
      createdBy: currentUserId || null,
    })

    // Copia items do template para employee_checklist_items
    for (const templateItem of template.items) {
      let dueDate: DateTime | null = null
      if (templateItem.dueDays !== null) {
        dueDate = startedAt.plus({ days: templateItem.dueDays })
      }

      await EmployeeChecklistItem.create({
        checklistId: checklist.id,
        templateItemId: templateItem.id,
        title: templateItem.title,
        description: templateItem.description,
        responsibleRole: templateItem.responsibleRole,
        dueDate,
        status: 'pending',
        order: templateItem.order,
      })
    }

    await checklist.load('items')
    await checklist.load('employee')
    await checklist.load('template')

    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'employee_checklist',
      resourceId: checklist.id,
      description: `Checklist de ${template.type} criado para ${employee.fullName}`,
      newValues: { employeeId: employee.id, templateId: template.id },
    })

    return checklist
  }

  async listChecklists(filters: ListChecklistsFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = EmployeeChecklist.query()
      .preload('employee')
      .preload('template')
      .orderBy('createdAt', 'desc')

    if (filters.employeeId) {
      query.where('employeeId', filters.employeeId)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async showChecklist(id: number) {
    const checklist = await EmployeeChecklist.query()
      .where('id', id)
      .preload('employee')
      .preload('template')
      .preload('items', (query) => query.orderBy('order', 'asc').preload('completedByUser'))
      .firstOrFail()

    return checklist
  }

  async completeItem(checklistId: number, itemId: number, notes: string | null, currentUserId?: number) {
    const item = await EmployeeChecklistItem.query()
      .where('id', itemId)
      .where('checklistId', checklistId)
      .firstOrFail()

    if (item.status === 'completed') {
      throw new Error('Item ja foi completado')
    }

    item.status = 'completed'
    item.completedBy = currentUserId || null
    item.completedAt = DateTime.now()
    item.notes = notes || null
    await item.save()

    // Verifica se todos os items required foram completados
    await this.updateChecklistStatus(checklistId)

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'employee_checklist_item',
      resourceId: item.id,
      description: `Item marcado como completo: ${item.title}`,
      newValues: { status: 'completed' },
    })

    await item.load('completedByUser')
    return item
  }

  async skipItem(checklistId: number, itemId: number, notes: string | null, currentUserId?: number) {
    const item = await EmployeeChecklistItem.query()
      .where('id', itemId)
      .where('checklistId', checklistId)
      .firstOrFail()

    if (item.status === 'completed') {
      throw new Error('Item ja foi completado, nao pode ser pulado')
    }

    item.status = 'skipped'
    item.completedBy = currentUserId || null
    item.completedAt = DateTime.now()
    item.notes = notes || null
    await item.save()

    // Verifica se todos os items required foram completados
    await this.updateChecklistStatus(checklistId)

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'employee_checklist_item',
      resourceId: item.id,
      description: `Item pulado: ${item.title}`,
      newValues: { status: 'skipped' },
    })

    await item.load('completedByUser')
    return item
  }

  private async updateChecklistStatus(checklistId: number) {
    const checklist = await EmployeeChecklist.query()
      .where('id', checklistId)
      .preload('items')
      .firstOrFail()

    const items = checklist.items
    const totalItems = items.length
    const completedOrSkipped = items.filter(
      (i) => i.status === 'completed' || i.status === 'skipped'
    ).length
    const requiredCompleted = items
      .filter((i) => i.status === 'completed')
      .length

    if (completedOrSkipped > 0 && checklist.status === 'pending') {
      checklist.status = 'in_progress'
      await checklist.save()
    }

    if (completedOrSkipped === totalItems) {
      checklist.status = 'completed'
      checklist.completedAt = DateTime.now()
      await checklist.save()

      await AuditLogService.log({
        action: 'update',
        resourceType: 'employee_checklist',
        resourceId: checklist.id,
        description: `Checklist completado (${requiredCompleted}/${totalItems} items)`,
        newValues: { status: 'completed' },
      })
    }
  }

  async stats() {
    const pending = await EmployeeChecklist.query().where('status', 'pending').count('* as total')
    const inProgress = await EmployeeChecklist.query()
      .where('status', 'in_progress')
      .count('* as total')
    const completed = await EmployeeChecklist.query()
      .where('status', 'completed')
      .count('* as total')

    return {
      pending: Number(pending[0].$extras.total),
      inProgress: Number(inProgress[0].$extras.total),
      completed: Number(completed[0].$extras.total),
    }
  }
}

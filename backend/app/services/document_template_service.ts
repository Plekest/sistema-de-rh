import DocumentTemplate from '#models/document_template'
import Employee from '#models/employee'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'

interface ListTemplatesFilters {
  page?: number
  limit?: number
  type?: 'contract' | 'nda' | 'declaration' | 'letter' | 'policy' | 'other'
  isActive?: boolean
}

interface CreateTemplateData {
  name: string
  description?: string | null
  type: 'contract' | 'nda' | 'declaration' | 'letter' | 'policy' | 'other'
  content: string
  variables?: string[] | null
  isActive?: boolean
}

export default class DocumentTemplateService {
  async list(filters: ListTemplatesFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = DocumentTemplate.query().preload('creator').orderBy('name', 'asc')

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.isActive !== undefined) {
      query.where('isActive', filters.isActive)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async create(data: CreateTemplateData, currentUserId?: number) {
    const template = await DocumentTemplate.create({
      name: data.name,
      description: data.description || null,
      type: data.type,
      content: data.content,
      variables: data.variables || null,
      isActive: data.isActive ?? true,
      createdBy: currentUserId || null,
    })

    await template.load('creator')

    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'document_template',
      resourceId: template.id,
      description: `Template de documento criado: ${template.name}`,
      newValues: { name: template.name, type: template.type },
    })

    return template
  }

  async show(id: number) {
    const template = await DocumentTemplate.query()
      .where('id', id)
      .preload('creator')
      .firstOrFail()

    return template
  }

  async update(id: number, data: Partial<CreateTemplateData>, currentUserId?: number) {
    const template = await DocumentTemplate.findOrFail(id)

    template.merge(data)
    await template.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'update',
      resourceType: 'document_template',
      resourceId: template.id,
      description: `Template de documento atualizado: ${template.name}`,
      newValues: data,
    })

    return template
  }

  async delete(id: number, currentUserId?: number) {
    const template = await DocumentTemplate.findOrFail(id)
    template.isActive = false
    await template.save()

    await AuditLogService.log({
      userId: currentUserId,
      action: 'delete',
      resourceType: 'document_template',
      resourceId: template.id,
      description: `Template de documento desativado: ${template.name}`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    })

    return template
  }

  async generate(templateId: number, employeeId: number, currentUserId?: number) {
    const template = await DocumentTemplate.findOrFail(templateId)

    if (!template.isActive) {
      throw new Error('Template esta desativado')
    }

    const employee = await Employee.query()
      .where('id', employeeId)
      .preload('department')
      .preload('position')
      .firstOrFail()

    // Substituir variaveis no conteudo
    let renderedContent = template.content

    // Variaveis do employee
    const variables: Record<string, string> = {
      '{{employee.fullName}}': employee.fullName,
      '{{employee.cpf}}': employee.cpf || '',
      '{{employee.cnpj}}': employee.cnpj || '',
      '{{employee.rg}}': employee.rg || '',
      '{{employee.email}}': employee.email,
      '{{employee.phone}}': employee.phone || '',
      '{{employee.registrationNumber}}': employee.registrationNumber || '',
      '{{employee.position}}': employee.position?.title || '',
      '{{employee.department}}': employee.department?.name || '',
      '{{employee.hireDate}}': employee.hireDate ? this.formatDate(employee.hireDate) : '',
      '{{employee.salary}}': employee.salary
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            employee.salary
          )
        : '',
      '{{employee.addressStreet}}': employee.addressStreet || '',
      '{{employee.addressNumber}}': employee.addressNumber || '',
      '{{employee.addressComplement}}': employee.addressComplement || '',
      '{{employee.addressNeighborhood}}': employee.addressNeighborhood || '',
      '{{employee.addressCity}}': employee.addressCity || '',
      '{{employee.addressState}}': employee.addressState || '',
      '{{employee.addressZip}}': employee.addressZip || '',
    }

    // Variaveis da empresa (hardcoded por enquanto)
    variables['{{company.name}}'] = 'Empresa XYZ'
    variables['{{company.cnpj}}'] = '00.000.000/0001-00'
    variables['{{company.address}}'] = 'Rua Exemplo, 123 - Sao Paulo/SP'

    // Variaveis de data
    const now = DateTime.now()
    variables['{{date.today}}'] = now.toFormat('dd/MM/yyyy')
    variables['{{date.todayExtended}}'] = this.formatDateExtended(now)
    variables['{{date.year}}'] = now.toFormat('yyyy')
    variables['{{date.month}}'] = now.toFormat('MM')
    variables['{{date.day}}'] = now.toFormat('dd')

    // Substituir todas as variaveis
    for (const [placeholder, value] of Object.entries(variables)) {
      renderedContent = renderedContent.split(placeholder).join(value)
    }

    await AuditLogService.log({
      userId: currentUserId,
      action: 'create',
      resourceType: 'generated_document',
      resourceId: template.id,
      description: `Documento gerado a partir do template ${template.name} para ${employee.fullName}`,
      newValues: { templateId: template.id, employeeId: employee.id },
    })

    return {
      template: {
        id: template.id,
        name: template.name,
        type: template.type,
      },
      employee: {
        id: employee.id,
        fullName: employee.fullName,
      },
      renderedContent,
      generatedAt: DateTime.now().toISO(),
    }
  }

  private formatDate(date: DateTime): string {
    return date.toFormat('dd/MM/yyyy')
  }

  private formatDateExtended(date: DateTime): string {
    const months = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ]

    const day = date.day
    const month = months[date.month - 1]
    const year = date.year

    return `${day} de ${month} de ${year}`
  }
}

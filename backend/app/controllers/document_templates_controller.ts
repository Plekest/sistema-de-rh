import type { HttpContext } from '@adonisjs/core/http'
import DocumentTemplateService from '#services/document_template_service'
import {
  createDocumentTemplateValidator,
  updateDocumentTemplateValidator,
  listDocumentTemplatesValidator,
} from '#validators/document_template_validator'

export default class DocumentTemplatesController {
  private service: DocumentTemplateService

  constructor() {
    this.service = new DocumentTemplateService()
  }

  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listDocumentTemplatesValidator)
      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar templates' })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createDocumentTemplateValidator)
      const currentUserId = auth.user?.id
      const template = await this.service.create(data, currentUserId)
      return response.created({ data: template })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar template' })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const template = await this.service.show(params.id)
      return response.ok({ data: template })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Template nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar template' })
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateDocumentTemplateValidator)
      const currentUserId = auth.user?.id
      const template = await this.service.update(params.id, data, currentUserId)
      return response.ok({ data: template })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Template nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar template' })
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const currentUserId = auth.user?.id
      await this.service.delete(params.id, currentUserId)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Template nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao deletar template' })
    }
  }

  async generate({ params, auth, response }: HttpContext) {
    try {
      const currentUserId = auth.user?.id
      const result = await this.service.generate(params.id, params.employeeId, currentUserId)
      return response.ok({ data: result })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Template ou colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao gerar documento' })
    }
  }
}

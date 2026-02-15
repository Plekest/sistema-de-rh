import type { HttpContext } from '@adonisjs/core/http'
import OnboardingService from '#services/onboarding_service'
import {
  createTemplateValidator,
  updateTemplateValidator,
  listTemplatesValidator,
  createTemplateItemValidator,
  updateTemplateItemValidator,
  createChecklistValidator,
  listChecklistsValidator,
  completeItemValidator,
  skipItemValidator,
} from '#validators/onboarding_validator'

export default class OnboardingController {
  private service: OnboardingService

  constructor() {
    this.service = new OnboardingService()
  }

  // ==================== TEMPLATES ====================

  async listTemplates({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listTemplatesValidator)
      const result = await this.service.listTemplates(filters)
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

  async createTemplate({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createTemplateValidator)
      const currentUserId = auth.user?.id
      const template = await this.service.createTemplate(data, currentUserId)
      return response.created({ data: template })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar template' })
    }
  }

  async showTemplate({ params, response }: HttpContext) {
    try {
      const template = await this.service.showTemplate(params.id)
      return response.ok({ data: template })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Template nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar template' })
    }
  }

  async updateTemplate({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateTemplateValidator)
      const currentUserId = auth.user?.id
      const template = await this.service.updateTemplate(params.id, data, currentUserId)
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

  async deleteTemplate({ params, auth, response }: HttpContext) {
    try {
      const currentUserId = auth.user?.id
      await this.service.deleteTemplate(params.id, currentUserId)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Template nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao deletar template' })
    }
  }

  // ==================== TEMPLATE ITEMS ====================

  async addItem({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createTemplateItemValidator)
      const currentUserId = auth.user?.id
      const item = await this.service.addItem(params.id, data, currentUserId)
      return response.created({ data: item })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Template nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao adicionar item' })
    }
  }

  async updateItem({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateTemplateItemValidator)
      const currentUserId = auth.user?.id
      const item = await this.service.updateItem(params.id, params.itemId, data, currentUserId)
      return response.ok({ data: item })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Item nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar item' })
    }
  }

  async deleteItem({ params, auth, response }: HttpContext) {
    try {
      const currentUserId = auth.user?.id
      await this.service.deleteItem(params.id, params.itemId, currentUserId)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Item nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao deletar item' })
    }
  }

  // ==================== CHECKLISTS ====================

  async createChecklist({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createChecklistValidator)
      const currentUserId = auth.user?.id
      const checklist = await this.service.createChecklist(data, currentUserId)
      return response.created({ data: checklist })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Employee ou Template nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar checklist' })
    }
  }

  async listChecklists({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listChecklistsValidator)
      const result = await this.service.listChecklists(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar checklists' })
    }
  }

  async showChecklist({ params, response }: HttpContext) {
    try {
      const checklist = await this.service.showChecklist(params.id)
      return response.ok({ data: checklist })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Checklist nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar checklist' })
    }
  }

  async completeItem({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(completeItemValidator)
      const currentUserId = auth.user?.id
      const item = await this.service.completeItem(
        params.id,
        params.itemId,
        data.notes || null,
        currentUserId
      )
      return response.ok({ data: item })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Item nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao completar item' })
    }
  }

  async skipItem({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(skipItemValidator)
      const currentUserId = auth.user?.id
      const item = await this.service.skipItem(
        params.id,
        params.itemId,
        data.notes || null,
        currentUserId
      )
      return response.ok({ data: item })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Item nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao pular item' })
    }
  }

  async stats({ response }: HttpContext) {
    try {
      const stats = await this.service.stats()
      return response.ok({ data: stats })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar estatisticas' })
    }
  }
}

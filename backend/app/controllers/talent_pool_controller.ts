import type { HttpContext } from '@adonisjs/core/http'
import TalentPoolService from '#services/talent_pool_service'
import {
  createTalentPoolValidator,
  updateTalentPoolValidator,
  createTagValidator,
  manageTagsValidator,
} from '#validators/talent_pool_validator'

export default class TalentPoolController {
  private service: TalentPoolService

  constructor() {
    this.service = new TalentPoolService()
  }

  async index({ request, response }: HttpContext) {
    try {
      const filters = {
        page: request.input('page'),
        limit: request.input('limit'),
        search: request.input('search'),
        status: request.input('status'),
        source: request.input('source'),
        tag_ids: request.input('tag_ids'),
      }

      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar talent pool' })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createTalentPoolValidator)
      const userId = auth.user?.id
      const talent = await this.service.create(data, userId)
      return response.created({ data: talent })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar talento' })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const talent = await this.service.show(params.id)
      return response.ok({ data: talent })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Talento não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar talento' })
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateTalentPoolValidator)
      const userId = auth.user?.id
      const talent = await this.service.update(params.id, data, userId)
      return response.ok({ data: talent })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Talento não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar talento' })
    }
  }

  async archive({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const talent = await this.service.archive(params.id, userId)
      return response.ok({ data: talent })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Talento não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao arquivar talento' })
    }
  }

  async importFromCandidate({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const talent = await this.service.importFromCandidate(params.candidateId, userId)
      return response.created({ data: talent })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Candidato não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao importar candidato' })
    }
  }

  async tags({ response }: HttpContext) {
    try {
      const tags = await this.service.listTags()
      return response.ok({ data: tags })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar tags' })
    }
  }

  async createTag({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createTagValidator)
      const userId = auth.user?.id
      const tag = await this.service.createTag(data, userId)
      return response.created({ data: tag })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar tag' })
    }
  }

  async deleteTag({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      await this.service.deleteTag(params.id, userId)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Tag não encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao deletar tag' })
    }
  }

  async addTags({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(manageTagsValidator)
      const userId = auth.user?.id
      const talent = await this.service.addTags(params.id, data.tag_ids, userId)
      return response.ok({ data: talent })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Talento não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao adicionar tags' })
    }
  }

  async removeTags({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(manageTagsValidator)
      const userId = auth.user?.id
      const talent = await this.service.removeTags(params.id, data.tag_ids, userId)
      return response.ok({ data: talent })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Talento não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover tags' })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import SearchService from '#services/search_service'
import vine from '@vinejs/vine'

const searchValidator = vine.compile(
  vine.object({
    q: vine.string().trim().minLength(2),
    type: vine.enum(['employees', 'departments', 'positions', 'all']).optional(),
  })
)

export default class SearchController {
  private service: SearchService

  constructor() {
    this.service = new SearchService()
  }

  async search({ request, response }: HttpContext) {
    try {
      const { q, type } = await request.validateUsing(searchValidator)
      const result = await this.service.search(q, type)
      return response.ok({ data: result })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao realizar busca' })
    }
  }
}

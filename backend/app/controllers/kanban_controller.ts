import type { HttpContext } from '@adonisjs/core/http'
import KanbanService from '#services/kanban_service'

export default class KanbanController {
  private service: KanbanService

  constructor() {
    this.service = new KanbanService()
  }

  async board({ params, response }: HttpContext) {
    try {
      const board = await this.service.getBoard(params.requisitionId)
      return response.ok({ data: board })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar board kanban' })
    }
  }

  async move({ request, auth, response }: HttpContext) {
    try {
      const candidateId = request.input('candidate_id')
      const toStageId = request.input('to_stage_id')
      const position = request.input('position')
      const userId = auth.user?.id

      if (!candidateId || !toStageId) {
        return response.badRequest({
          message: 'Parâmetros "candidate_id" e "to_stage_id" são obrigatórios',
        })
      }

      const candidate = await this.service.moveCandidate(candidateId, toStageId, position, userId)
      return response.ok({ data: candidate })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Candidato ou stage não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao mover candidato' })
    }
  }

  async stats({ params, response }: HttpContext) {
    try {
      const stats = await this.service.getBoardStats(params.requisitionId)
      return response.ok({ data: stats })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar estatísticas' })
    }
  }
}

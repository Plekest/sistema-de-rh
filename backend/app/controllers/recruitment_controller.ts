import type { HttpContext } from '@adonisjs/core/http'
import RecruitmentService from '#services/recruitment_service'
import {
  createJobRequisitionValidator,
  updateJobRequisitionValidator,
  listJobRequisitionsValidator,
  createCandidateValidator,
  updateCandidateValidator,
  moveCandidateValidator,
  rejectCandidateValidator,
  listCandidatesValidator,
  createInterviewValidator,
  updateInterviewValidator,
  completeInterviewValidator,
} from '#validators/recruitment_validator'

export default class RecruitmentController {
  private service: RecruitmentService

  constructor() {
    this.service = new RecruitmentService()
  }

  // ==========================================
  // Vagas (Job Requisitions)
  // ==========================================

  /**
   * Lista requisicoes de vaga
   * GET /api/v1/recruitment/requisitions
   */
  async requisitions({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listJobRequisitionsValidator)
      const result = await this.service.listRequisitions(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar requisicoes' })
    }
  }

  /**
   * Detalhe de requisicao
   * GET /api/v1/recruitment/requisitions/:id
   */
  async showRequisition({ params, response }: HttpContext) {
    try {
      const requisition = await this.service.getRequisition(params.id)
      return response.ok({ data: requisition })
    } catch {
      return response.notFound({ message: 'Requisicao nao encontrada' })
    }
  }

  /**
   * Cria nova requisicao
   * POST /api/v1/recruitment/requisitions
   */
  async createRequisition({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createJobRequisitionValidator)
      const userId = auth.user!.id
      const requisition = await this.service.createRequisition(data, userId)
      return response.created({ data: requisition })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar requisicao' })
    }
  }

  /**
   * Atualiza requisicao
   * PUT /api/v1/recruitment/requisitions/:id
   */
  async updateRequisition({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateJobRequisitionValidator)
      const requisition = await this.service.updateRequisition(params.id, data)
      return response.ok({ data: requisition })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Requisicao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar requisicao' })
    }
  }

  /**
   * Aprova requisicao
   * PATCH /api/v1/recruitment/requisitions/:id/approve
   */
  async approveRequisition({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user!.id
      const requisition = await this.service.approveRequisition(params.id, userId)
      return response.ok({ data: requisition })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Requisicao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao aprovar requisicao' })
    }
  }

  /**
   * Cancela requisicao
   * PATCH /api/v1/recruitment/requisitions/:id/cancel
   */
  async cancelRequisition({ params, response }: HttpContext) {
    try {
      const requisition = await this.service.cancelRequisition(params.id)
      return response.ok({ data: requisition })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Requisicao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao cancelar requisicao' })
    }
  }

  /**
   * Estatisticas de uma requisicao
   * GET /api/v1/recruitment/requisitions/:id/stats
   */
  async requisitionStats({ params, response }: HttpContext) {
    try {
      const stats = await this.service.getRequisitionStats(params.id)
      return response.ok({ data: stats })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Requisicao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar estatisticas' })
    }
  }

  // ==========================================
  // Etapas (Recruitment Stages)
  // ==========================================

  /**
   * Lista etapas de recrutamento
   * GET /api/v1/recruitment/stages
   */
  async stages({ response }: HttpContext) {
    try {
      const stages = await this.service.listStages()
      return response.ok({ data: stages })
    } catch {
      return response.badRequest({ message: 'Erro ao listar etapas' })
    }
  }

  // ==========================================
  // Candidatos (Candidates)
  // ==========================================

  /**
   * Lista candidatos
   * GET /api/v1/recruitment/candidates
   */
  async candidates({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listCandidatesValidator)
      const result = await this.service.listCandidates(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar candidatos' })
    }
  }

  /**
   * Detalhe de candidato
   * GET /api/v1/recruitment/candidates/:id
   */
  async showCandidate({ params, response }: HttpContext) {
    try {
      const candidate = await this.service.getCandidate(params.id)
      return response.ok({ data: candidate })
    } catch {
      return response.notFound({ message: 'Candidato nao encontrado' })
    }
  }

  /**
   * Cria novo candidato
   * POST /api/v1/recruitment/candidates
   */
  async createCandidate({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createCandidateValidator)
      const userId = auth.user!.id
      const candidate = await this.service.createCandidate(data, userId)
      return response.created({ data: candidate })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Vaga ou etapa nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar candidato' })
    }
  }

  /**
   * Atualiza candidato
   * PUT /api/v1/recruitment/candidates/:id
   */
  async updateCandidate({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateCandidateValidator)
      const candidate = await this.service.updateCandidate(params.id, data)
      return response.ok({ data: candidate })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Candidato nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar candidato' })
    }
  }

  /**
   * Move candidato para outra etapa
   * PATCH /api/v1/recruitment/candidates/:id/move
   */
  async moveCandidate({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(moveCandidateValidator)
      const userId = auth.user!.id
      const candidate = await this.service.moveToStage(
        params.id,
        data.stageId,
        userId,
        data.feedback,
        data.score
      )
      return response.ok({ data: candidate })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Candidato ou etapa nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao mover candidato' })
    }
  }

  /**
   * Contrata candidato
   * PATCH /api/v1/recruitment/candidates/:id/hire
   */
  async hireCandidate({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user!.id
      const candidate = await this.service.hireCandidate(params.id, userId)
      return response.ok({ data: candidate })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Candidato nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao contratar candidato' })
    }
  }

  /**
   * Rejeita candidato
   * PATCH /api/v1/recruitment/candidates/:id/reject
   */
  async rejectCandidate({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(rejectCandidateValidator)
      const userId = auth.user!.id
      const candidate = await this.service.rejectCandidate(params.id, userId, data.feedback)
      return response.ok({ data: candidate })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Candidato nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao rejeitar candidato' })
    }
  }

  // ==========================================
  // Entrevistas (Interviews)
  // ==========================================

  /**
   * Lista entrevistas de um candidato
   * GET /api/v1/recruitment/candidates/:candidateId/interviews
   */
  async interviews({ params, response }: HttpContext) {
    try {
      const interviews = await this.service.listInterviews(params.candidateId)
      return response.ok({ data: interviews })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Candidato nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar entrevistas' })
    }
  }

  /**
   * Lista todas as entrevistas com filtros
   * GET /api/v1/recruitment/interviews
   */
  async allInterviews({ request, response }: HttpContext) {
    try {
      const interviews = await this.service.listAllInterviews(request.qs())
      return response.ok({ data: interviews })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao listar entrevistas' })
    }
  }

  /**
   * Cria nova entrevista
   * POST /api/v1/recruitment/interviews
   */
  async createInterview({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createInterviewValidator)
      const interview = await this.service.createInterview(data)
      return response.created({ data: interview })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          message: 'Candidato, entrevistador ou etapa nao encontrada',
        })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar entrevista' })
    }
  }

  /**
   * Atualiza entrevista
   * PUT /api/v1/recruitment/interviews/:id
   */
  async updateInterview({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateInterviewValidator)
      const interview = await this.service.updateInterview(params.id, data)
      return response.ok({ data: interview })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Entrevista nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar entrevista' })
    }
  }

  /**
   * Completa entrevista com feedback
   * PATCH /api/v1/recruitment/interviews/:id/complete
   */
  async completeInterview({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(completeInterviewValidator)
      const interview = await this.service.completeInterview(params.id, data.feedback, data.score)
      return response.ok({ data: interview })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Entrevista nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao completar entrevista' })
    }
  }

  /**
   * Cancela entrevista
   * PATCH /api/v1/recruitment/interviews/:id/cancel
   */
  async cancelInterview({ params, response }: HttpContext) {
    try {
      const interview = await this.service.cancelInterview(params.id)
      return response.ok({ data: interview })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Entrevista nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao cancelar entrevista' })
    }
  }

  // ==========================================
  // Dashboard/Stats
  // ==========================================

  /**
   * Dashboard de recrutamento
   * GET /api/v1/recruitment/dashboard
   */
  async dashboard({ response }: HttpContext) {
    try {
      const stats = await this.service.getRecruitmentDashboard()
      return response.ok({ data: stats })
    } catch {
      return response.badRequest({ message: 'Erro ao buscar dashboard' })
    }
  }
}

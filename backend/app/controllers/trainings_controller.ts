import type { HttpContext } from '@adonisjs/core/http'
import TrainingService from '#services/training_service'
import {
  createTrainingValidator,
  updateTrainingValidator,
  listTrainingValidator,
  enrollValidator,
  bulkEnrollValidator,
  updateEnrollmentValidator,
} from '#validators/training_validator'

export default class TrainingsController {
  private service: TrainingService

  constructor() {
    this.service = new TrainingService()
  }

  /**
   * Lista treinamentos
   * GET /api/v1/trainings
   */
  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listTrainingValidator)
      const result = await this.service.list(filters)

      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar treinamentos' })
    }
  }

  /**
   * Detalhe de um treinamento
   * GET /api/v1/trainings/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const training = await this.service.show(params.id)
      return response.ok({ data: training })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Treinamento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar treinamento' })
    }
  }

  /**
   * Cria novo treinamento
   * POST /api/v1/trainings
   */
  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createTrainingValidator)
      const currentUserId = auth.user?.id
      const training = await this.service.create(data, currentUserId)

      return response.created({ data: training })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar treinamento' })
    }
  }

  /**
   * Atualiza um treinamento
   * PUT /api/v1/trainings/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateTrainingValidator)
      const training = await this.service.update(params.id, data)

      return response.ok({ data: training })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Treinamento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar treinamento' })
    }
  }

  /**
   * Exclui um treinamento (soft delete)
   * DELETE /api/v1/trainings/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const training = await this.service.delete(params.id)
      return response.ok({ data: training })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Treinamento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao excluir treinamento' })
    }
  }

  /**
   * Inscreve um colaborador em um treinamento
   * POST /api/v1/trainings/:id/enroll
   */
  async enroll({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(enrollValidator)
      const enrollment = await this.service.enroll(params.id, data.employeeId)

      return response.created({ data: enrollment })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Treinamento ou colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao inscrever colaborador' })
    }
  }

  /**
   * Inscreve varios colaboradores em um treinamento
   * POST /api/v1/trainings/:id/bulk-enroll
   */
  async bulkEnroll({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(bulkEnrollValidator)
      const result = await this.service.bulkEnroll(params.id, data.employeeIds)

      return response.created({ data: result })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Treinamento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao inscrever colaboradores' })
    }
  }

  /**
   * Atualiza dados de uma inscricao
   * PUT /api/v1/trainings/enrollments/:enrollmentId
   */
  async updateEnrollment({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateEnrollmentValidator)
      const enrollment = await this.service.updateEnrollment(params.enrollmentId, data)

      return response.ok({ data: enrollment })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Inscricao nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar inscricao' })
    }
  }

  /**
   * Lista treinamentos de um colaborador
   * GET /api/v1/trainings/employee/:employeeId
   */
  async employeeTrainings({ params, response }: HttpContext) {
    try {
      const trainings = await this.service.getEmployeeTrainings(params.employeeId)
      return response.ok({ data: trainings })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao listar treinamentos do colaborador',
      })
    }
  }

  /**
   * Retorna estatisticas gerais
   * GET /api/v1/trainings/stats
   */
  async stats({ response }: HttpContext) {
    try {
      const stats = await this.service.getStats()
      return response.ok({ data: stats })
    } catch {
      return response.badRequest({ message: 'Erro ao buscar estatisticas' })
    }
  }
}

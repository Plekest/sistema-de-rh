import type { HttpContext } from '@adonisjs/core/http'
import SurveyService from '#services/survey_service'
import Employee from '#models/employee'
import {
  createSurveyValidator,
  updateSurveyValidator,
  listSurveysValidator,
  respondSurveyValidator,
} from '#validators/survey_validator'

export default class SurveysController {
  private service: SurveyService

  constructor() {
    this.service = new SurveyService()
  }

  async index({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listSurveysValidator)
      const result = await this.service.list(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar pesquisas' })
    }
  }

  async store({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createSurveyValidator)
      const currentUserId = auth.user?.id
      const survey = await this.service.create(data, currentUserId)
      return response.created({ data: survey })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar pesquisa' })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const survey = await this.service.show(params.id)
      return response.ok({ data: survey })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Pesquisa nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar pesquisa' })
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateSurveyValidator)
      const currentUserId = auth.user?.id
      const survey = await this.service.update(params.id, data, currentUserId)
      return response.ok({ data: survey })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Pesquisa nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar pesquisa' })
    }
  }

  async activate({ params, auth, response }: HttpContext) {
    try {
      const currentUserId = auth.user?.id
      const survey = await this.service.activate(params.id, currentUserId)
      return response.ok({ data: survey })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Pesquisa nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao ativar pesquisa' })
    }
  }

  async close({ params, auth, response }: HttpContext) {
    try {
      const currentUserId = auth.user?.id
      const survey = await this.service.close(params.id, currentUserId)
      return response.ok({ data: survey })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Pesquisa nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao fechar pesquisa' })
    }
  }

  async results({ params, response }: HttpContext) {
    try {
      const results = await this.service.results(params.id)
      return response.ok({ data: results })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Pesquisa nao encontrada' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar resultados' })
    }
  }

  async respond({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(respondSurveyValidator)
      const user = auth.getUserOrFail()
      const currentUserId = user.id

      // Buscar employee pelo userId
      const employee = await Employee.query().where('userId', user.id).where('status', 'active').firstOrFail()

      const surveyResponse = await this.service.respond(
        params.id,
        employee.id,
        data,
        currentUserId
      )

      return response.created({ data: surveyResponse })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Pesquisa ou colaborador nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao responder pesquisa' })
    }
  }

  async pending({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      // Buscar employee pelo userId
      const employee = await Employee.query().where('userId', user.id).where('status', 'active').firstOrFail()

      const surveys = await this.service.pendingSurveys(employee.id)
      return response.ok({ data: surveys })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao buscar pesquisas pendentes',
      })
    }
  }
}

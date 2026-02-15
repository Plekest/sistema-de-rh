import type { HttpContext } from '@adonisjs/core/http'
import OccupationalHealthService from '#services/occupational_health_service'
import {
  createExamValidator,
  updateExamValidator,
  completeExamValidator,
  createCertificateValidator,
  listExamsValidator,
  listCertificatesValidator,
} from '#validators/occupational_health_validator'
import { DateTime } from 'luxon'

export default class OccupationalHealthController {
  private service: OccupationalHealthService

  constructor() {
    this.service = new OccupationalHealthService()
  }

  async listExams({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listExamsValidator)

      const result = await this.service.listExams(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar exames' })
    }
  }

  async createExam({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createExamValidator)
      const userId = auth.user?.id

      const exam = await this.service.createExam(
        {
          employee_id: data.employee_id,
          type: data.type,
          exam_date: DateTime.fromJSDate(data.exam_date),
          expiry_date: data.expiry_date ? DateTime.fromJSDate(data.expiry_date) : undefined,
          result: data.result || undefined,
          restrictions: data.restrictions,
          doctor_name: data.doctor_name,
          crm: data.crm,
          clinic_name: data.clinic_name,
          status: data.status,
          notes: data.notes,
        },
        userId
      )

      return response.created({ data: exam })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar exame' })
    }
  }

  async updateExam({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateExamValidator)
      const userId = auth.user?.id

      const exam = await this.service.updateExam(
        params.id,
        {
          type: data.type,
          exam_date: data.exam_date ? DateTime.fromJSDate(data.exam_date) : undefined,
          expiry_date: data.expiry_date ? DateTime.fromJSDate(data.expiry_date) : undefined,
          result: data.result || undefined,
          restrictions: data.restrictions,
          doctor_name: data.doctor_name,
          crm: data.crm,
          clinic_name: data.clinic_name,
          status: data.status,
          notes: data.notes,
        },
        userId
      )

      return response.ok({ data: exam })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Exame não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao atualizar exame' })
    }
  }

  async deleteExam({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      const exam = await this.service.deleteExam(params.id, userId)
      return response.ok({ data: exam })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Exame não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover exame' })
    }
  }

  async upcomingExams({ request, response }: HttpContext) {
    try {
      const days = request.input('days', 30)
      const exams = await this.service.getUpcomingExams(days)
      return response.ok({ data: exams })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar exames próximos' })
    }
  }

  async expiredExams({ response }: HttpContext) {
    try {
      const exams = await this.service.getExpiredExams()
      return response.ok({ data: exams })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao buscar exames vencidos' })
    }
  }

  async completeExam({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(completeExamValidator)
      const userId = auth.user?.id

      const exam = await this.service.completeExam(
        params.id,
        data.result,
        data.restrictions,
        data.doctor_name,
        data.crm,
        userId
      )

      return response.ok({ data: exam })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Exame não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao completar exame' })
    }
  }

  async listCertificates({ request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listCertificatesValidator)

      const result = await this.service.listCertificates(filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar atestados' })
    }
  }

  async createCertificate({ request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createCertificateValidator)
      const userId = auth.user?.id

      const certificate = await this.service.createCertificate(
        {
          employee_id: data.employee_id,
          start_date: DateTime.fromJSDate(data.start_date),
          end_date: DateTime.fromJSDate(data.end_date),
          days_count: data.days_count,
          cid_code: data.cid_code,
          cid_description: data.cid_description,
          doctor_name: data.doctor_name,
          crm: data.crm,
          notes: data.notes,
        },
        userId
      )

      return response.created({ data: certificate })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados inválidos', errors: error.messages })
      }
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao criar atestado' })
    }
  }

  async approveCertificate({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user!.id
      const certificate = await this.service.approveCertificate(params.id, userId)
      return response.ok({ data: certificate })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Atestado não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao aprovar atestado' })
    }
  }

  async rejectCertificate({ params, auth, response }: HttpContext) {
    try {
      const userId = auth.user!.id
      const certificate = await this.service.rejectCertificate(params.id, userId)
      return response.ok({ data: certificate })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Atestado não encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao rejeitar atestado' })
    }
  }

  async healthDashboard({ response }: HttpContext) {
    try {
      const dashboard = await this.service.getHealthDashboard()
      return response.ok({ data: dashboard })
    } catch (error) {
      return response.badRequest({ message: error.message || 'Erro ao gerar dashboard de saúde' })
    }
  }
}

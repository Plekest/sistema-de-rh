import type { HttpContext } from '@adonisjs/core/http'
import CalendarService from '#services/calendar_service'
import vine from '@vinejs/vine'

const calendarValidator = vine.compile(
  vine.object({
    month: vine.number().min(1).max(12),
    year: vine.number().min(2020).max(2100),
    department_id: vine.number().positive().optional(),
  })
)

export default class CalendarController {
  private service: CalendarService

  constructor() {
    this.service = new CalendarService()
  }

  async index({ request, response }: HttpContext) {
    try {
      const { month, year, department_id } = await request.validateUsing(calendarValidator)
      const result = await this.service.getMonthCalendar(month, year, department_id)
      return response.ok({ data: result })
    } catch (error) {
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar calendário' })
    }
  }
}

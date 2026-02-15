import api from '@/services/api'
import type { CalendarEvent, CalendarParams } from '../types'

/**
 * Servico de calendario - gerencia chamadas a API de eventos
 */
class CalendarService {
  /**
   * Busca eventos de um mes especifico
   */
  async getEvents(params: CalendarParams): Promise<CalendarEvent[]> {
    const response = await api.get<{ data: CalendarEvent[] }>('/calendar', { params })
    return response.data.data
  }
}

export default new CalendarService()

import { ref, computed, watch } from 'vue'
import calendarService from '../services/calendarService'
import type { CalendarEvent, CalendarDay } from '../types'

export function useTeamCalendar() {
  const currentDate = ref(new Date())
  const events = ref<CalendarEvent[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const selectedDepartmentId = ref<number | undefined>(undefined)

  const currentMonth = computed(() => currentDate.value.getMonth() + 1)
  const currentYear = computed(() => currentDate.value.getFullYear())

  const monthName = computed(() => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ]
    return months[currentDate.value.getMonth()]
  })

  /**
   * Gera array de dias do calendario (incluindo dias do mes anterior e proximo)
   */
  const calendarDays = computed<CalendarDay[]>(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()

    // Primeiro dia do mes
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay()

    // Ultimo dia do mes
    const lastDay = new Date(year, month + 1, 0)
    const lastDayOfMonth = lastDay.getDate()

    // Dias do mes anterior para preencher o inicio
    const prevMonthLastDay = new Date(year, month, 0).getDate()

    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Adiciona dias do mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date),
      })
    }

    // Adiciona dias do mes atual
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.getTime() === today.getTime()
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        events: getEventsForDate(date),
      })
    }

    // Adiciona dias do proximo mes para completar a grid
    const remainingDays = 42 - days.length // Grid 6x7
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date),
      })
    }

    return days
  })

  /**
   * Retorna eventos para uma data especifica
   */
  function getEventsForDate(date: Date): CalendarEvent[] {
    const dateStr = date.toISOString().split('T')[0]
    return events.value.filter((event) => {
      if (event.date === dateStr) return true
      // Para eventos com periodo (ferias)
      if (event.startDate && event.endDate) {
        const start = new Date(event.startDate)
        const end = new Date(event.endDate)
        return date >= start && date <= end
      }
      return false
    })
  }

  /**
   * Busca eventos do mes atual
   */
  async function loadEvents() {
    isLoading.value = true
    error.value = ''

    try {
      events.value = await calendarService.getEvents({
        month: currentMonth.value,
        year: currentYear.value,
        departmentId: selectedDepartmentId.value,
      })
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Erro ao carregar eventos'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Navega para o mes anterior
   */
  function previousMonth() {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1
    )
  }

  /**
   * Navega para o proximo mes
   */
  function nextMonth() {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1
    )
  }

  /**
   * Vai para o mes atual
   */
  function goToToday() {
    currentDate.value = new Date()
  }

  /**
   * Recarrega eventos quando mes/ano ou departamento mudar
   */
  watch([currentMonth, currentYear, selectedDepartmentId], () => {
    loadEvents()
  })

  return {
    currentDate,
    currentMonth,
    currentYear,
    monthName,
    calendarDays,
    events,
    isLoading,
    error,
    selectedDepartmentId,
    loadEvents,
    previousMonth,
    nextMonth,
    goToToday,
  }
}

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTeamCalendar } from '../composables/useTeamCalendar'
import employeeService from '@/modules/employees/services/employee.service'
import type { Department } from '@/modules/employees/types'
import type { CalendarEvent } from '../types'

const {
  monthName,
  currentYear,
  calendarDays,
  isLoading,
  error,
  selectedDepartmentId,
  loadEvents,
  previousMonth,
  nextMonth,
  goToToday,
} = useTeamCalendar()

const departments = ref<Department[]>([])
const selectedDay = ref<Date | null>(null)
const dayPopoverEvents = ref<CalendarEvent[]>([])

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const eventTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  leave: { label: 'Férias/Licença', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  birthday: { label: 'Aniversário', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  holiday: { label: 'Feriado', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
}

/**
 * Abre popover com eventos do dia
 */
function openDayPopover(date: Date, events: CalendarEvent[]) {
  if (events.length === 0) return
  selectedDay.value = date
  dayPopoverEvents.value = events
}

/**
 * Fecha popover
 */
function closeDayPopover() {
  selectedDay.value = null
  dayPopoverEvents.value = []
}

/**
 * Formata data para exibicao
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

onMounted(async () => {
  loadEvents()

  try {
    departments.value = await employeeService.getDepartments()
  } catch {
    // Silently fail - filtro e opcional
  }
})
</script>

<template>
  <div class="team-calendar-view">
    <!-- Header -->
    <div class="calendar-header">
      <div>
        <h1 class="calendar-title">Calendário da Equipe</h1>
        <p class="calendar-subtitle">Visualize férias, aniversários e feriados</p>
      </div>

      <div class="calendar-filters">
        <select
          v-model="selectedDepartmentId"
          class="department-filter"
          aria-label="Filtrar por departamento"
        >
          <option :value="undefined">Todos os departamentos</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando calendário...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadEvents">Tentar novamente</button>
    </div>

    <!-- Calendar -->
    <div v-else class="calendar-container">
      <!-- Navigation -->
      <div class="calendar-nav">
        <button class="nav-btn" @click="previousMonth" aria-label="Mês anterior">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="calendar-current">
          <span class="calendar-month">{{ monthName }} {{ currentYear }}</span>
          <button class="today-btn" @click="goToToday">Hoje</button>
        </div>

        <button class="nav-btn" @click="nextMonth" aria-label="Próximo mês">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Legend -->
      <div class="calendar-legend">
        <div v-for="(config, type) in eventTypeConfig" :key="type" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: config.color }"></span>
          <span class="legend-label">{{ config.label }}</span>
        </div>
      </div>

      <!-- Grid -->
      <div class="calendar-grid">
        <!-- Week days header -->
        <div v-for="day in weekDays" :key="day" class="calendar-weekday">
          {{ day }}
        </div>

        <!-- Days -->
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            today: day.isToday,
            'has-events': day.events.length > 0,
          }"
          @click="openDayPopover(day.date, day.events)"
        >
          <span class="day-number">{{ day.day }}</span>

          <!-- Event dots/badges -->
          <div v-if="day.events.length > 0" class="day-events">
            <span
              v-for="(event, idx) in day.events.slice(0, 3)"
              :key="idx"
              class="event-dot"
              :style="{ backgroundColor: eventTypeConfig[event.type]?.color }"
              :title="event.title"
            ></span>
            <span v-if="day.events.length > 3" class="event-more">
              +{{ day.events.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Popover -->
    <Teleport to="body">
      <Transition name="popover-fade">
        <div v-if="selectedDay" class="day-popover-overlay" @click="closeDayPopover">
          <div class="day-popover" @click.stop>
            <div class="popover-header">
              <h3>{{ formatDate(selectedDay) }}</h3>
              <button class="popover-close" @click="closeDayPopover" aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="popover-body">
              <div
                v-for="event in dayPopoverEvents"
                :key="event.id"
                class="popover-event"
              >
                <span
                  class="popover-event-dot"
                  :style="{ backgroundColor: eventTypeConfig[event.type]?.color }"
                ></span>
                <div class="popover-event-content">
                  <span class="popover-event-title">{{ event.title }}</span>
                  <span v-if="event.employeeName" class="popover-event-meta">
                    {{ event.employeeName }}
                    <template v-if="event.department"> • {{ event.department }}</template>
                  </span>
                  <span v-if="event.description" class="popover-event-description">
                    {{ event.description }}
                  </span>
                </div>
                <span
                  class="popover-event-type"
                  :style="{
                    color: eventTypeConfig[event.type]?.color,
                    backgroundColor: eventTypeConfig[event.type]?.bg,
                  }"
                >
                  {{ eventTypeConfig[event.type]?.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.team-calendar-view {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
}

/* Header */
.calendar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-12);
  gap: var(--space-8);
}

.calendar-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.calendar-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

.calendar-filters {
  display: flex;
  gap: var(--space-4);
}

.department-filter {
  padding: var(--space-4) var(--space-8);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.department-filter:hover {
  border-color: var(--color-border-hover);
}

.department-filter:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--input-focus-ring);
}

/* Loading & Error */
.loading-state,
.error-state {
  text-align: center;
  padding: var(--space-24);
  color: var(--color-text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
  margin: 0 auto var(--space-8);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: var(--color-danger);
}

.retry-btn {
  margin-top: var(--space-8);
  padding: var(--space-4) var(--space-12);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--color-primary-dark);
}

/* Calendar Container */
.calendar-container {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-12);
  box-shadow: var(--shadow-sm);
}

/* Navigation */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-10);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-bg-subtle);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.calendar-current {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.calendar-month {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.today-btn {
  padding: var(--space-3) var(--space-8);
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.today-btn:hover {
  background: var(--color-primary);
  color: white;
}

/* Legend */
.calendar-legend {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  margin-bottom: var(--space-10);
  padding-bottom: var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border-light);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
}

.legend-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

/* Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

.calendar-weekday {
  text-align: center;
  padding: var(--space-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.calendar-day {
  aspect-ratio: 1;
  border: var(--border-width) solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-bg-card);
  position: relative;
}

.calendar-day:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.today {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.calendar-day.today .day-number {
  background: var(--color-primary);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
}

.calendar-day.has-events {
  border-color: var(--color-border-hover);
}

.day-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  line-height: 1;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: auto;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.event-more {
  font-size: 10px;
  color: var(--color-text-placeholder);
  font-weight: var(--font-weight-semibold);
}

/* Day Popover */
.day-popover-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.day-popover {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-8) var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border);
}

.popover-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.popover-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.popover-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.popover-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-8) var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.popover-event {
  display: flex;
  align-items: flex-start;
  gap: var(--space-6);
  padding: var(--space-6);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-lg);
}

.popover-event-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  margin-top: var(--space-1);
  flex-shrink: 0;
}

.popover-event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.popover-event-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.popover-event-meta {
  font-size: var(--font-size-2xs);
  color: var(--color-text-muted);
}

.popover-event-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.popover-event-type {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-lg);
  white-space: nowrap;
}

/* Transitions */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity var(--transition-base);
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-title {
    font-size: var(--font-size-2xl);
  }

  .calendar-grid {
    gap: var(--space-1);
  }

  .calendar-day {
    padding: var(--space-2);
  }

  .day-number {
    font-size: var(--font-size-xs);
  }

  .event-dot {
    width: 4px;
    height: 4px;
  }

  .calendar-weekday {
    font-size: 10px;
    padding: var(--space-2);
  }
}

@media (max-width: 480px) {
  .calendar-container {
    padding: var(--space-6);
  }

  .calendar-month {
    font-size: var(--font-size-base);
  }

  .legend-item {
    font-size: 10px;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
  }
}
</style>

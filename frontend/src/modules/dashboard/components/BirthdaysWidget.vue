<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dashboardService from '../services/dashboard.service'
import type { BirthdayEmployee } from '../types'

defineProps<{
  compact?: boolean
}>()

const router = useRouter()
const birthdays = ref<BirthdayEmployee[]>([])
const isLoading = ref(true)
const error = ref('')

function getInitials(fullName: string): string {
  const names = fullName.split(' ')
  if (names.length >= 2) {
    return `${names[0]?.charAt(0) ?? ''}${names[names.length - 1]?.charAt(0) ?? ''}`.toUpperCase()
  }
  return fullName.substring(0, 2).toUpperCase()
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

function getDaysText(daysUntil: number): string {
  if (daysUntil === 0) return 'Hoje!'
  if (daysUntil === 1) return 'Amanhã'
  return `Em ${daysUntil} dias`
}

onMounted(async () => {
  try {
    birthdays.value = await dashboardService.getBirthdays(30)
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Erro ao carregar aniversariantes'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="birthdays-widget">
    <div class="widget-header">
      <h3>Aniversariantes do Mês</h3>
    </div>

    <div v-if="isLoading" class="widget-loading">
      <div class="spinner-small"></div>
    </div>

    <div v-else-if="error" class="widget-error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="birthdays.length === 0" class="widget-empty">
      <span>Nenhum aniversariante este mês</span>
    </div>

    <div v-else class="birthdays-list">
      <div
        v-for="birthday in birthdays.slice(0, compact ? 3 : 5)"
        :key="birthday.id"
        class="birthday-item"
        :class="{ today: birthday.isToday }"
        @click="router.push(`/employees/${birthday.id}`)"
        role="button"
        tabindex="0"
      >
        <div class="birthday-avatar" :class="{ today: birthday.isToday }">
          {{ getInitials(birthday.fullName) }}
        </div>

        <div class="birthday-info">
          <span class="birthday-name">{{ birthday.fullName }}</span>
          <span class="birthday-date">{{ formatDate(birthday.birthDate) }}</span>
        </div>

        <div class="birthday-badge" :class="{ today: birthday.isToday }">
          <svg
            v-if="birthday.isToday"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{{ getDaysText(birthday.daysUntil) }}</span>
        </div>
      </div>

      <button v-if="birthdays.length > 5 && !compact" class="view-all-btn">
        Ver todos ({{ birthdays.length }})
      </button>
    </div>
  </div>
</template>

<style scoped>
.birthdays-widget {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border-left: 4px solid var(--color-secondary);
}

.widget-header {
  padding: var(--space-8) var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border-light);
}

.widget-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.widget-loading,
.widget-error,
.widget-empty {
  padding: var(--space-12);
  text-align: center;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-secondary);
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.widget-error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.widget-empty {
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
}

.birthdays-list {
  padding: var(--space-6) var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.birthday-item {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.birthday-item:hover {
  background: var(--color-bg-hover);
}

.birthday-item.today {
  background: var(--color-secondary-light);
  border: var(--border-width) solid var(--color-secondary);
}

.birthday-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.birthday-avatar.today {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(118, 75, 162, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(118, 75, 162, 0);
  }
}

.birthday-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.birthday-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.birthday-date {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
}

.birthday-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  padding: var(--space-1) var(--space-4);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-xl);
  flex-shrink: 0;
}

.birthday-badge.today {
  background: var(--color-secondary);
  color: white;
}

.view-all-btn {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  text-align: center;
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
}

.view-all-btn:hover {
  background: var(--color-bg-hover);
}
</style>

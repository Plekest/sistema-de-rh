<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationsList } from '../composables/useNotificationsList'

const {
  notifications,
  loading,
  filter,
  pagination,
  unreadCount,
  hasNextPage,
  hasPrevPage,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  changeFilter,
  formatRelativeTime,
  nextPage,
  prevPage
} = useNotificationsList()

/**
 * Carrega notificacoes ao montar o componente
 */
onMounted(async () => {
  await fetchNotifications()
})

/**
 * Manipula marcacao de notificacao individual como lida
 */
async function handleMarkAsRead(id: number) {
  try {
    await markAsRead(id)
  } catch (error) {
    console.error('Erro ao marcar como lida:', error)
  }
}

/**
 * Manipula marcacao de todas as notificacoes como lidas
 */
async function handleMarkAllAsRead() {
  try {
    await markAllAsRead()
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error)
  }
}
</script>

<template>
  <div class="notifications-view">
    <!-- Header -->
    <div class="view-header">
      <div class="header-content">
        <h1 class="view-title">Notificacoes</h1>
        <button
          v-if="unreadCount > 0"
          class="btn-mark-all"
          @click="handleMarkAllAsRead"
          :disabled="loading"
        >
          Marcar todas como lidas
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <button
        class="filter-btn"
        :class="{ 'filter-btn-active': filter === 'all' }"
        @click="changeFilter('all')"
        :disabled="loading"
      >
        Todas ({{ pagination.total }})
      </button>
      <button
        class="filter-btn"
        :class="{ 'filter-btn-active': filter === 'unread' }"
        @click="changeFilter('unread')"
        :disabled="loading"
      >
        Nao lidas ({{ unreadCount }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && notifications.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p class="loading-text">Carregando notificacoes...</p>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="!loading && notifications.length === 0" class="empty-state">
      <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <p class="empty-text">Nenhuma notificacao</p>
      <p class="empty-description">
        {{ filter === 'unread' ? 'Voce nao possui notificacoes nao lidas no momento.' : 'Voce ainda nao possui notificacoes.' }}
      </p>
    </div>

    <!-- Lista de notificacoes -->
    <div v-else class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-card"
        :class="{ 'notification-unread': !notification.isRead }"
      >
        <!-- Indicador de nao lida -->
        <div v-if="!notification.isRead" class="unread-indicator"></div>

        <div class="notification-content">
          <!-- Titulo e hora -->
          <div class="notification-header">
            <h3 class="notification-title" :class="{ 'notification-title-unread': !notification.isRead }">
              {{ notification.title }}
            </h3>
            <span class="notification-time">{{ formatRelativeTime(notification.createdAt) }}</span>
          </div>

          <!-- Mensagem -->
          <p class="notification-message">{{ notification.message }}</p>

          <!-- Botao marcar como lida -->
          <button
            v-if="!notification.isRead"
            class="btn-mark-read"
            @click="handleMarkAsRead(notification.id)"
            :disabled="loading"
          >
            Marcar como lida
          </button>
        </div>
      </div>
    </div>

    <!-- Paginacao -->
    <div v-if="!loading && notifications.length > 0 && pagination.lastPage > 1" class="pagination">
      <button
        class="pagination-btn"
        @click="prevPage"
        :disabled="!hasPrevPage || loading"
      >
        Anterior
      </button>
      <span class="pagination-info">
        Pagina {{ pagination.page }} de {{ pagination.lastPage }}
      </span>
      <button
        class="pagination-btn"
        @click="nextPage"
        :disabled="!hasNextPage || loading"
      >
        Proxima
      </button>
    </div>
  </div>
</template>

<style scoped>
.notifications-view {
  max-width: var(--max-width-lg);
  margin: 0 auto;
}

/* Header */
.view-header {
  margin-bottom: var(--space-12);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
  flex-wrap: wrap;
}

.view-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.btn-mark-all {
  padding: var(--space-5) var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-mark-all:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.btn-mark-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Filtros */
.filters {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-10);
  padding-bottom: var(--space-8);
  border-bottom: var(--border-width) solid var(--color-border);
}

.filter-btn {
  padding: var(--space-4) var(--space-8);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.filter-btn:hover:not(:disabled) {
  color: var(--color-text-secondary);
  background-color: var(--color-bg-hover);
}

.filter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-btn-active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.filter-btn-active::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-24) var(--space-12);
  gap: var(--space-8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

/* Estado vazio */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-24) var(--space-12);
  text-align: center;
}

.empty-icon {
  color: var(--color-text-placeholder);
  margin-bottom: var(--space-8);
}

.empty-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4) 0;
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
  max-width: 400px;
}

/* Lista de notificacoes */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Card de notificacao */
.notification-card {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  position: relative;
  transition: all var(--transition-fast);
}

.notification-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.notification-unread {
  background-color: var(--color-bg-subtle);
}

/* Indicador de nao lida */
.unread-indicator {
  position: absolute;
  top: var(--space-10);
  left: var(--space-6);
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
}

.notification-content {
  padding-left: var(--space-8);
}

/* Header da notificacao */
.notification-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-8);
  margin-bottom: var(--space-4);
}

.notification-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0;
  flex: 1;
  line-height: var(--line-height-normal);
}

.notification-title-unread {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* Mensagem */
.notification-message {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--space-6) 0;
}

/* Botao marcar como lida */
.btn-mark-read {
  padding: var(--space-3) var(--space-6);
  background: none;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-mark-read:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.btn-mark-read:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Paginacao */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  margin-top: var(--space-12);
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
}

.pagination-btn {
  padding: var(--pagination-btn-padding-y) var(--pagination-btn-padding-x);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

/* Responsivo */
@media (max-width: 768px) {
  .view-title {
    font-size: var(--font-size-2xl);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-mark-all {
    width: 100%;
  }

  .notification-header {
    flex-direction: column;
    gap: var(--space-2);
  }

  .notification-time {
    align-self: flex-start;
  }

  .pagination {
    flex-direction: column;
  }

  .pagination-btn {
    width: 100%;
  }
}
</style>

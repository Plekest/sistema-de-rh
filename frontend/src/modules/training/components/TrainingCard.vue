<script setup lang="ts">
import type { Training } from '../types'
import StatusBadge from '@/components/common/StatusBadge.vue'

/**
 * Card individual de treinamento.
 *
 * Exibe informacoes principais e badges de status/tipo.
 * Emite eventos para acoes (ver, editar, inscrever, deletar).
 */

interface Props {
  training: Training
  isAdmin: boolean
  typeLabels: Record<string, string>
  statusLabels: Record<string, string>
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'view', id: number): void
  (e: 'edit', training: Training): void
  (e: 'enroll', id: number): void
  (e: 'delete', id: number): void
}>()

/**
 * Formata data para exibicao
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/**
 * Calcula vagas disponiveis
 */
function availableSlots(training: Training): string {
  if (!training.maxParticipants) return 'Ilimitado'
  const enrolled = training.enrollmentCount || 0
  const available = training.maxParticipants - enrolled
  return `${available} / ${training.maxParticipants}`
}
</script>

<template>
  <div class="training-card">
    <div class="card-header">
      <div class="card-title-row">
        <h3 class="card-title">{{ training.title }}</h3>
        <div class="card-badges">
          <span class="badge badge-type">{{ typeLabels[training.type] ?? '' }}</span>
          <StatusBadge :status="statusLabels[training.status] ?? ''" />
          <span v-if="training.isMandatory" class="badge badge-mandatory">Obrigatorio</span>
        </div>
      </div>
    </div>

    <div class="card-body">
      <p v-if="training.description" class="card-description">
        {{ training.description }}
      </p>

      <div class="card-meta">
        <div v-if="training.category" class="meta-item">
          <span class="meta-label">Categoria:</span>
          <span class="meta-value">{{ training.category }}</span>
        </div>
        <div v-if="training.instructor" class="meta-item">
          <span class="meta-label">Instrutor:</span>
          <span class="meta-value">{{ training.instructor }}</span>
        </div>
        <div v-if="training.provider" class="meta-item">
          <span class="meta-label">Fornecedor:</span>
          <span class="meta-value">{{ training.provider }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Periodo:</span>
          <span class="meta-value">{{ formatDate(training.startDate) }} - {{ formatDate(training.endDate) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Duracao:</span>
          <span class="meta-value">{{ training.durationHours }}h</span>
        </div>
        <div v-if="training.type === 'presential' || training.type === 'hybrid'" class="meta-item">
          <span class="meta-label">Local:</span>
          <span class="meta-value">{{ training.location || 'N/A' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Vagas disponiveis:</span>
          <span class="meta-value">{{ availableSlots(training) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Inscritos:</span>
          <span class="meta-value">{{ training.enrollmentCount || 0 }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button class="btn-secondary" @click="emit('view', training.id)">
        Ver Detalhes
      </button>
      <template v-if="isAdmin">
        <button class="btn-secondary" @click="emit('edit', training)">
          Editar
        </button>
        <button class="btn-primary" @click="emit('enroll', training.id)">
          Inscrever Colaboradores
        </button>
        <button class="btn-danger" @click="emit('delete', training.id)">
          Deletar
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.training-card {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
}

.training-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  padding: var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.card-badges {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.badge-type {
  background: var(--color-info-bg);
  color: var(--color-info-dark);
}

.badge-mandatory {
  background: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.card-body {
  padding: var(--space-10);
}

.card-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--space-8) 0;
}

.card-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-label {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.meta-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.card-footer {
  padding: var(--space-8) var(--space-10);
  background: var(--color-bg-subtle);
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border: none;
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: #fff;
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.btn-danger {
  background: var(--color-danger-lighter);
  color: var(--color-danger-dark);
}

.btn-danger:hover {
  background: var(--color-danger);
  color: #fff;
}

@media (max-width: 768px) {
  .card-title-row {
    flex-direction: column;
  }

  .card-meta {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
  }
}
</style>

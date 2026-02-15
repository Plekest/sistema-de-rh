<script setup lang="ts">
import type { Candidate } from '../types'

interface Props {
  candidate: Candidate
  isAdmin: boolean
  actionLoading: string | null
  candidateSourceLabels: Record<string, string>
  candidateStatusLabels: Record<string, string>
  statusBadgeClass: (status: string) => string
}

defineProps<Props>()

const emit = defineEmits<{
  move: [id: number]
  interview: [id: number]
  hire: [id: number]
  reject: [id: number]
}>()
</script>

<template>
  <div class="candidate-card">
    <div class="candidate-header">
      <div class="candidate-info">
        <h3 class="candidate-name">{{ candidate.name }}</h3>
        <span class="candidate-meta">
          {{ candidate.email }} | {{ candidateSourceLabels[candidate.source] }}
        </span>
        <span v-if="candidate.jobRequisition" class="candidate-job">
          Vaga: {{ candidate.jobRequisition.title }}
        </span>
      </div>
      <div class="candidate-status-info">
        <span class="badge" :class="statusBadgeClass(candidate.status)">
          {{ candidateStatusLabels[candidate.status] }}
        </span>
        <span v-if="candidate.currentStage" class="candidate-stage">
          Etapa: {{ candidate.currentStage.name }}
        </span>
      </div>
    </div>

    <div v-if="candidate.status === 'active' && isAdmin" class="candidate-actions">
      <button
        class="btn-action btn-approve"
        :disabled="actionLoading !== null"
        @click="emit('move', candidate.id)"
      >
        Mover Etapa
      </button>
      <button
        class="btn-action btn-approve"
        :disabled="actionLoading !== null"
        @click="emit('interview', candidate.id)"
      >
        Agendar Entrevista
      </button>
      <button
        class="btn-action btn-approve"
        :disabled="actionLoading !== null"
        @click="emit('hire', candidate.id)"
      >
        {{ actionLoading === 'hireCandidate' ? 'Contratando...' : 'Contratar' }}
      </button>
      <button
        class="btn-action btn-cancel"
        :disabled="actionLoading !== null"
        @click="emit('reject', candidate.id)"
      >
        {{ actionLoading === 'rejectCandidate' ? 'Rejeitando...' : 'Rejeitar' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.candidate-card {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-10);
  transition: background-color var(--transition-slow),
              border-color var(--transition-slow),
              box-shadow var(--transition-base);
}

.candidate-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.candidate-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.candidate-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  transition: color var(--transition-slow);
}

.candidate-meta,
.candidate-job {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  transition: color var(--transition-slow);
}

.candidate-status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.candidate-stage {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  transition: color var(--transition-slow);
}

.badge {
  display: inline-block;
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.candidate-actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.btn-action {
  padding: var(--space-2) var(--space-5);
  border: none;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  margin: 0;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-approve {
  background: var(--color-success-lighter);
  color: var(--color-success-dark);
}

.btn-approve:hover:not(:disabled) {
  background: var(--color-success-bg);
}

.btn-cancel {
  background: var(--color-bg-muted);
  color: var(--color-text-tertiary);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--color-border-hover);
}

@media (max-width: 768px) {
  .candidate-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .candidate-status-info {
    align-items: flex-start;
  }

  .candidate-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .btn-action {
    min-width: 44px;
    min-height: 44px;
    padding: var(--space-6) var(--space-8);
  }
}

@media (max-width: 480px) {
  .candidate-card {
    padding: var(--space-6);
  }
}
</style>

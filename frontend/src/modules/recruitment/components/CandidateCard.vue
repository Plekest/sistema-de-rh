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
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.candidate-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.candidate-name {
  font-size: 0.938rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.candidate-meta,
.candidate-job {
  font-size: 0.813rem;
  color: var(--color-text-muted);
}

.candidate-status-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.candidate-stage {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.candidate-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0.125rem;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-approve {
  background: var(--color-success-lighter);
  color: var(--color-success-dark);
}

.btn-approve:hover:not(:disabled) {
  background: var(--color-success);
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
    gap: 0.5rem;
  }

  .candidate-status-info {
    align-items: flex-start;
  }

  .candidate-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .candidate-card {
    padding: 0.75rem;
  }
}
</style>

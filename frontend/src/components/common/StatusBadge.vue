<script setup lang="ts">
/**
 * Componente de badge de status com variantes de cor
 *
 * Suporta mapeamento automatico de status comuns para variantes visuais,
 * ou variante explicita via prop.
 *
 * @example
 * <StatusBadge status="active" />
 * <StatusBadge status="Pendente" variant="warning" />
 */

interface Props {
  /** Texto do status a ser exibido */
  status: string
  /** Variante visual (se nao informada, usa mapeamento automatico) */
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  variant: undefined,
})

/**
 * Mapeamento automatico de valores de status para variantes visuais.
 * Cobre os status mais comuns usados no sistema de RH.
 */
const STATUS_VARIANT_MAP: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  // Status de colaborador
  active: 'success',
  ativo: 'success',
  inactive: 'warning',
  inativo: 'warning',
  terminated: 'danger',
  desligado: 'danger',

  // Status de ferias/licenca
  pending: 'warning',
  pendente: 'warning',
  approved: 'success',
  aprovado: 'success',
  rejected: 'danger',
  rejeitado: 'danger',
  in_progress: 'info',
  em_andamento: 'info',
  completed: 'neutral',
  concluido: 'neutral',
  cancelled: 'neutral',
  cancelado: 'neutral',

  // Status de recrutamento
  open: 'info',
  aberto: 'info',
  closed: 'neutral',
  fechado: 'neutral',
  hired: 'success',
  contratado: 'success',

  // Status de avaliacao
  draft: 'neutral',
  rascunho: 'neutral',
  submitted: 'info',
  enviado: 'info',

  // Tipos de contrato
  clt: 'info',
  pj: 'neutral',

  // Registro de ponto
  regular: 'info',
  overtime: 'warning',
  absence: 'danger',
  holiday: 'success',

  // Beneficios
  enabled: 'success',
  disabled: 'neutral',

  // Folha de pagamento
  processing: 'warning',
  processed: 'success',
  paid: 'success',
}

/**
 * Resolve a variante visual do badge
 */
function resolvedVariant(): string {
  if (props.variant) return props.variant
  const key = props.status.toLowerCase().replace(/\s+/g, '_')
  return STATUS_VARIANT_MAP[key] || 'neutral'
}
</script>

<template>
  <span class="status-badge" :class="`status-badge--${resolvedVariant()}`">
    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  line-height: var(--line-height-normal);
  white-space: nowrap;
  transition: background-color var(--transition-slow), color var(--transition-slow);
}

.status-badge--success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.status-badge--warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-darker);
}

.status-badge--danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger-dark);
}

.status-badge--info {
  background-color: var(--color-info-light);
  color: var(--color-primary);
}

.status-badge--neutral {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}
</style>

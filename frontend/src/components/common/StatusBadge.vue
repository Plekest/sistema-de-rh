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
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.status-badge--success {
  background-color: #f0fff4;
  color: #276749;
}

.status-badge--warning {
  background-color: #fffff0;
  color: #975a16;
}

.status-badge--danger {
  background-color: #fff5f5;
  color: #c53030;
}

.status-badge--info {
  background-color: #ebf4ff;
  color: #667eea;
}

.status-badge--neutral {
  background-color: #f7fafc;
  color: #718096;
}
</style>

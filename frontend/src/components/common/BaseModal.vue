<script setup lang="ts">
import AppModal from './AppModal.vue'

/**
 * Alias para AppModal com suporte a tamanho 'large' e 'medium'
 *
 * Converte 'large' -> 'lg' e 'medium' -> 'md' para compatibilidade
 * com componentes que usam nomenclatura diferente.
 */

interface Props {
  show: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

/**
 * Mapeia tamanhos alternativos para os tamanhos suportados pelo AppModal
 */
const normalizedSize = (() => {
  if (props.size === 'small') return 'sm'
  if (props.size === 'medium') return 'md'
  if (props.size === 'large') return 'lg'
  return props.size as 'sm' | 'md' | 'lg'
})()
</script>

<template>
  <AppModal :show="show" :title="title" :size="normalizedSize" @close="emit('close')">
    <template #header>
      <slot name="header" />
    </template>
    <slot />
    <template #footer>
      <slot name="footer" />
    </template>
  </AppModal>
</template>

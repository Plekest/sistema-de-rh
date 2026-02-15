<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = ref('View de resultados de pesquisa em desenvolvimento')
</script>

<template>
  <div class="placeholder-view">
    <h1>Resultados da Pesquisa</h1>
    <p>{{ message }}</p>
    <button class="btn btn-secondary" @click="router.back()">Voltar</button>
  </div>
</template>

<style scoped>
.placeholder-view {
  padding: var(--space-20);
  text-align: center;
}

.btn {
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  margin-top: var(--space-8);
}

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
}
</style>

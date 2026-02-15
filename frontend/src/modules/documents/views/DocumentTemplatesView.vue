<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Módulo de Templates de Documentos em desenvolvimento')
const templates = ref([
  { id: 1, name: 'Contrato de Trabalho CLT', type: 'contract', description: 'Template padrão para contratos CLT' },
  { id: 2, name: 'Contrato PJ', type: 'contract', description: 'Template para contratos de pessoa jurídica' },
  { id: 3, name: 'Termo de Rescisão', type: 'termination', description: 'Documento de rescisão de contrato' },
])
</script>

<template>
  <div class="templates-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Templates de Documentos</h1>
        <p class="page-subtitle">Gerencie templates de contratos e documentos</p>
      </div>
      <button class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Novo Template
      </button>
    </div>

    <div class="info-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      {{ message }}
    </div>

    <div class="templates-grid">
      <div v-for="template in templates" :key="template.id" class="template-card">
        <div class="card-header">
          <h3 class="card-title">{{ template.name }}</h3>
          <span class="badge">{{ template.type }}</span>
        </div>
        <p class="card-description">{{ template.description }}</p>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary">Editar</button>
          <button class="btn btn-sm btn-primary">Gerar Documento</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.templates-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-8);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-10);
  background-color: var(--color-info-light);
  border: var(--border-width) solid var(--color-info);
  border-radius: var(--radius-lg);
  color: var(--color-info-dark);
  font-size: var(--font-size-base);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-8);
}

.template-card {
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  transition: all var(--transition-fast);
}

.template-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.card-actions {
  display: flex;
  gap: var(--space-4);
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border-light);
}

.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
  white-space: nowrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  white-space: nowrap;
}

.btn-sm {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-sm);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>

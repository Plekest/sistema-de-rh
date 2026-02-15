<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Módulo de Organograma em desenvolvimento')
const departments = ref([
  {
    id: 1,
    name: 'TI',
    manager: { name: 'João Silva', position: 'Gerente de TI' },
    employees: [
      { name: 'Maria Santos', position: 'Desenvolvedora' },
      { name: 'Pedro Costa', position: 'Analista de Sistemas' },
    ],
  },
  {
    id: 2,
    name: 'RH',
    manager: { name: 'Ana Oliveira', position: 'Gerente de RH' },
    employees: [
      { name: 'Carlos Souza', position: 'Analista de RH' },
    ],
  },
])
</script>

<template>
  <div class="orgchart-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Organograma</h1>
        <p class="page-subtitle">Visualize a estrutura organizacional da empresa</p>
      </div>
    </div>

    <div class="info-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      {{ message }}
    </div>

    <div class="departments-grid">
      <div v-for="dept in departments" :key="dept.id" class="department-card">
        <div class="dept-header">
          <h3 class="dept-name">{{ dept.name }}</h3>
          <span class="badge">{{ dept.employees.length + 1 }} pessoas</span>
        </div>

        <div class="manager-card">
          <div class="avatar">{{ dept.manager.name.charAt(0) }}</div>
          <div class="manager-info">
            <h4 class="manager-name">{{ dept.manager.name }}</h4>
            <p class="manager-position">{{ dept.manager.position }}</p>
          </div>
        </div>

        <div class="employees-list">
          <div v-for="(emp, idx) in dept.employees" :key="idx" class="employee-item">
            <div class="avatar avatar-sm">{{ emp.name.charAt(0) }}</div>
            <div class="employee-info">
              <span class="employee-name">{{ emp.name }}</span>
              <span class="employee-position">{{ emp.position }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orgchart-view {
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

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-10);
}

.department-card {
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  transition: all var(--transition-fast);
}

.department-card:hover {
  box-shadow: var(--shadow-md);
}

.dept-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-6);
  border-bottom: 2px solid var(--color-border);
}

.dept-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.manager-card {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-6);
  background-color: var(--color-primary-light);
  border: var(--border-width) solid var(--color-primary);
  border-radius: var(--radius-lg);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-size-sm);
  background-color: var(--color-text-muted);
}

.manager-info,
.employee-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.manager-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.manager-position {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.employee-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.employee-item:hover {
  background-color: var(--color-bg-hover);
}

.employee-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.employee-position {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
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

@media (max-width: 768px) {
  .departments-grid {
    grid-template-columns: 1fr;
  }
}
</style>

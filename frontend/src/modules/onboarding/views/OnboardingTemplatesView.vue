<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useOnboarding } from '../composables/useOnboarding'
import TemplateForm from '../components/TemplateForm.vue'
import type { OnboardingTemplate, OnboardingTemplateItem } from '../types'

const {
  templates,
  selectedTemplate,
  templateItems,
  isLoading,
  error,
  successMessage,
  filterType,
  filterStatus,
  showTemplateForm,
  templateFormData,
  showItemForm,
  itemFormData,
  isAdmin,
  typeLabels,
  responsibleLabels,
  loadTemplates,
  selectTemplate,
  openTemplateForm,
  closeTemplateForm,
  saveTemplate,
  deleteTemplate,
  openItemForm,
  closeItemForm,
  saveItem,
  deleteItem,
  init,
} = useOnboarding()

const editingItem = ref<OnboardingTemplateItem | null>(null)

const filteredTemplates = computed(() => {
  let result = templates.value

  if (filterType.value) {
    result = result.filter((t) => t.type === filterType.value)
  }

  if (filterStatus.value === 'active') {
    result = result.filter((t) => t.isActive)
  } else if (filterStatus.value === 'inactive') {
    result = result.filter((t) => !t.isActive)
  }

  return result
})

function handleEditItem(item: OnboardingTemplateItem) {
  editingItem.value = item
  openItemForm(item)
}

async function handleSaveItem() {
  const success = await saveItem(editingItem.value || undefined)
  if (success) {
    editingItem.value = null
  }
}

function handleCloseItemForm() {
  editingItem.value = null
  closeItemForm()
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="templates-view">
    <!-- Cabecalho -->
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Templates de Onboarding</h1>
        <p class="page-subtitle">Gerencie templates de integração e desligamento</p>
      </div>
      <button v-if="isAdmin" class="btn btn-primary" @click="openTemplateForm()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Novo Template
      </button>
    </div>

    <!-- Mensagens -->
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Filtros -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Tipo</label>
        <select v-model="filterType" class="filter-select">
          <option value="">Todos</option>
          <option value="onboarding">Integração</option>
          <option value="offboarding">Desligamento</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Todos</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !selectedTemplate" class="loading">Carregando...</div>

    <!-- Layout principal -->
    <div v-else class="main-layout">
      <!-- Lista de templates -->
      <div class="templates-list">
        <div v-if="filteredTemplates.length === 0" class="empty-state">
          <p>Nenhum template encontrado</p>
        </div>

        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          :class="{ active: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-header">
            <div class="template-title-row">
              <h3 class="template-name">{{ template.name }}</h3>
              <span class="badge" :class="`badge-${template.type}`">
                {{ typeLabels[template.type] }}
              </span>
            </div>
            <span v-if="!template.isActive" class="badge badge-inactive">Inativo</span>
          </div>

          <p v-if="template.description" class="template-description">{{ template.description }}</p>

          <div class="template-meta">
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              {{ template.itemsCount || 0 }} items
            </span>
            <span class="meta-date">{{ new Date(template.createdAt).toLocaleDateString('pt-BR') }}</span>
          </div>

          <div v-if="isAdmin" class="template-actions" @click.stop>
            <button class="btn-icon" @click="openTemplateForm(template)" title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-danger" @click="deleteTemplate(template.id)" title="Excluir">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Detalhe do template -->
      <div v-if="selectedTemplate" class="template-detail">
        <div class="detail-header">
          <div>
            <h2 class="detail-title">{{ selectedTemplate.name }}</h2>
            <p v-if="selectedTemplate.description" class="detail-subtitle">
              {{ selectedTemplate.description }}
            </p>
          </div>
          <button v-if="isAdmin" class="btn btn-primary" @click="openItemForm()">
            Adicionar Item
          </button>
        </div>

        <div v-if="isLoading" class="loading">Carregando items...</div>

        <div v-else-if="templateItems.length === 0" class="empty-state">
          <p>Nenhum item cadastrado neste template</p>
        </div>

        <div v-else class="items-list">
          <div v-for="item in templateItems" :key="item.id" class="item-card">
            <div class="item-header">
              <h4 class="item-title">{{ item.title }}</h4>
              <div class="item-badges">
                <span class="badge badge-responsible">{{ responsibleLabels[item.responsible] }}</span>
                <span v-if="item.isRequired" class="badge badge-required">Obrigatório</span>
              </div>
            </div>

            <p v-if="item.description" class="item-description">{{ item.description }}</p>

            <div class="item-meta">
              <span class="meta-item">Prazo: {{ item.dueInDays }} dia(s)</span>
            </div>

            <div v-if="isAdmin" class="item-actions">
              <button class="btn-icon" @click="handleEditItem(item)" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon btn-danger" @click="deleteItem(item.id)" title="Excluir">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-selection">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <p>Selecione um template para ver os detalhes</p>
      </div>
    </div>

    <!-- Modal: Template Form -->
    <div v-if="showTemplateForm" class="modal-overlay" @click.self="closeTemplateForm">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ selectedTemplate?.id ? 'Editar Template' : 'Novo Template' }}
          </h3>
          <button class="modal-close" @click="closeTemplateForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <TemplateForm
            v-model="templateFormData"
            :loading="isLoading"
            :error="error"
            @submit="saveTemplate"
            @cancel="closeTemplateForm"
          />
        </div>
      </div>
    </div>

    <!-- Modal: Item Form -->
    <div v-if="showItemForm" class="modal-overlay" @click.self="handleCloseItemForm">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editingItem ? 'Editar Item' : 'Novo Item' }}
          </h3>
          <button class="modal-close" @click="handleCloseItemForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSaveItem" class="item-form">
            <div v-if="error" class="form-error">{{ error }}</div>

            <div class="form-group">
              <label class="form-label">Título *</label>
              <input v-model="itemFormData.title" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea v-model="itemFormData.description" class="form-textarea" rows="2"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Responsável *</label>
                <select v-model="itemFormData.responsible" class="form-select" required>
                  <option value="hr">RH</option>
                  <option value="manager">Gestor</option>
                  <option value="it">TI</option>
                  <option value="employee">Colaborador</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Prazo (dias) *</label>
                <input v-model.number="itemFormData.dueInDays" type="number" class="form-input" min="1" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input v-model="itemFormData.isRequired" type="checkbox" />
                <span>Item obrigatório</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="handleCloseItemForm" :disabled="isLoading">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Salvando...' : 'Salvar Item' }}
              </button>
            </div>
          </form>
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

/* Alertas */
.alert {
  padding: var(--alert-padding-y) var(--alert-padding-x);
  border-radius: var(--alert-border-radius);
  font-size: var(--alert-font-size);
}

.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success-darker);
  border: var(--border-width) solid var(--color-success);
}

.alert-error {
  background-color: var(--color-danger-light);
  color: var(--color-danger-darker);
  border: var(--border-width) solid var(--color-danger);
}

/* Filtros */
.filter-bar {
  display: flex;
  gap: var(--space-8);
  padding: var(--filter-bar-padding);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--filter-bar-border-radius);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 150px;
}

.filter-label {
  font-size: var(--filter-label-font-size);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-select {
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

/* Layout principal */
.main-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: var(--space-12);
  min-height: 500px;
}

/* Lista de templates */
.templates-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.template-card {
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.template-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.template-card.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.template-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.template-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.template-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.template-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4);
  line-height: var(--line-height-relaxed);
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border-light);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.template-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

/* Detalhe do template */
.template-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-8);
  padding-bottom: var(--space-8);
  border-bottom: var(--border-width) solid var(--color-border);
}

.detail-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.detail-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.item-card {
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.item-card:hover {
  box-shadow: var(--shadow-sm);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.item-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.item-badges {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

.item-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4);
  line-height: var(--line-height-relaxed);
}

.item-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.item-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border-light);
}

/* Badges */
.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.badge-onboarding {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-offboarding {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.badge-inactive {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
}

.badge-responsible {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.badge-required {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-dark);
}

/* Botoes */
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  border: var(--border-width) solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.btn-icon.btn-danger:hover {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

/* Estados */
.loading,
.empty-state,
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}

.no-selection {
  flex-direction: column;
  gap: var(--space-8);
}

.no-selection svg {
  color: var(--color-text-placeholder);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--palette-overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-12);
}

.modal {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-10) var(--space-12);
  border-bottom: var(--border-width) solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-12);
  overflow-y: auto;
}

/* Formularios */
.item-form,
.template-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.form-error {
  padding: var(--space-6) var(--space-8);
  background-color: var(--color-danger-light);
  border: var(--border-width) solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger-dark);
  font-size: var(--font-size-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-width) solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-input);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--input-focus-ring);
}

.form-textarea {
  resize: vertical;
  font-family: var(--font-family);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
}

.form-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

/* Responsividade */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .template-detail {
    border-top: var(--border-width) solid var(--color-border);
    padding-top: var(--space-12);
  }
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-bar {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

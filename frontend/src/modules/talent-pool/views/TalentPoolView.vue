<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import talentPoolService from '../services/talentPoolService'
import type { TalentPoolEntry, TalentPoolTag, CreateTalentPoolEntryData } from '../types'
import { TALENT_POOL_SOURCE_LABELS, TALENT_POOL_STATUS_LABELS } from '../types'

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const entries = ref<TalentPoolEntry[]>([])
const tags = ref<TalentPoolTag[]>([])

const filterStatus = ref('')
const filterSource = ref('')
const filterTagIds = ref<number[]>([])
const filterSearch = ref('')

const showEntryForm = ref(false)
const formData = ref<CreateTalentPoolEntryData>({
  fullName: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  source: 'spontaneous',
  notes: '',
  experienceYears: undefined,
  salaryExpectation: undefined,
  availability: '',
  tagIds: [],
})
const editingEntryId = ref<number | null>(null)

const showTagModal = ref(false)
const newTagName = ref('')
const newTagColor = ref('#667eea')

async function loadEntries() {
  try {
    isLoading.value = true
    error.value = null
    const response = await talentPoolService.list({
      status: filterStatus.value || undefined,
      source: filterSource.value || undefined,
      tagIds: filterTagIds.value.length > 0 ? filterTagIds.value : undefined,
      search: filterSearch.value || undefined,
      limit: 100,
    })
    entries.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar banco de talentos'
  } finally {
    isLoading.value = false
  }
}

async function loadTags() {
  try {
    tags.value = await talentPoolService.listTags()
  } catch (err: any) {
    console.error('Erro ao carregar tags:', err)
  }
}

function openEntryForm(entry?: TalentPoolEntry) {
  if (entry) {
    editingEntryId.value = entry.id
    formData.value = {
      fullName: entry.fullName,
      email: entry.email,
      phone: entry.phone || '',
      linkedinUrl: entry.linkedinUrl || '',
      source: entry.source,
      notes: entry.notes || '',
      experienceYears: entry.experienceYears,
      salaryExpectation: entry.salaryExpectation,
      availability: entry.availability || '',
      tagIds: entry.tags.map(t => t.id),
    }
  } else {
    editingEntryId.value = null
    formData.value = {
      fullName: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      source: 'spontaneous',
      notes: '',
      experienceYears: undefined,
      salaryExpectation: undefined,
      availability: '',
      tagIds: [],
    }
  }
  showEntryForm.value = true
}

function closeEntryForm() {
  showEntryForm.value = false
  editingEntryId.value = null
}

async function saveEntry() {
  try {
    error.value = null
    if (editingEntryId.value) {
      await talentPoolService.update(editingEntryId.value, formData.value)
      successMessage.value = 'Talento atualizado com sucesso'
    } else {
      await talentPoolService.create(formData.value)
      successMessage.value = 'Talento adicionado com sucesso'
    }
    setTimeout(() => { successMessage.value = null }, 3000)
    closeEntryForm()
    await loadEntries()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar talento'
  }
}

async function archiveEntry(id: number) {
  if (!confirm('Deseja realmente arquivar este talento?')) return
  try {
    await talentPoolService.archive(id)
    successMessage.value = 'Talento arquivado com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadEntries()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao arquivar talento'
  }
}

async function createTag() {
  if (!newTagName.value.trim()) return
  try {
    await talentPoolService.createTag(newTagName.value, newTagColor.value)
    newTagName.value = ''
    newTagColor.value = '#667eea'
    await loadTags()
    successMessage.value = 'Tag criada com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao criar tag'
  }
}

async function deleteTag(id: number) {
  if (!confirm('Deseja realmente deletar esta tag?')) return
  try {
    await talentPoolService.deleteTag(id)
    await loadTags()
    successMessage.value = 'Tag deletada com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao deletar tag'
  }
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'badge-success',
    contacted: 'badge-info',
    interviewing: 'badge-warning',
    hired: 'badge-secondary',
    archived: 'badge-muted',
  }
  return classes[status] || 'badge-muted'
}

onMounted(async () => {
  await Promise.all([loadEntries(), loadTags()])
})
</script>

<template>
  <div class="talent-pool-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Banco de Talentos</h1>
        <p class="page-subtitle">Gerencie talentos prospectados para futuras oportunidades</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showTagModal = true">Gerenciar Tags</button>
        <button class="btn btn-primary" @click="openEntryForm()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Adicionar Talento
        </button>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Filtros -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="filterStatus" @change="loadEntries" class="filter-select">
          <option value="">Todos</option>
          <option v-for="(label, key) in TALENT_POOL_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Origem</label>
        <select v-model="filterSource" @change="loadEntries" class="filter-select">
          <option value="">Todas</option>
          <option v-for="(label, key) in TALENT_POOL_SOURCE_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <div class="filter-group filter-search">
        <label class="filter-label">Buscar</label>
        <input v-model="filterSearch" @input="loadEntries" type="text" class="filter-input" placeholder="Nome ou email..." />
      </div>
    </div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <div v-else-if="entries.length === 0" class="empty-state">
      <p>Nenhum talento encontrado</p>
    </div>

    <div v-else class="entries-grid">
      <div v-for="entry in entries" :key="entry.id" class="entry-card">
        <div class="card-header">
          <div class="card-title-row">
            <h3 class="card-title">{{ entry.fullName }}</h3>
            <span class="badge" :class="getStatusBadgeClass(entry.status)">
              {{ TALENT_POOL_STATUS_LABELS[entry.status] }}
            </span>
          </div>
          <p class="card-email">{{ entry.email }}</p>
        </div>

        <div class="card-tags">
          <span v-for="tag in entry.tags" :key="tag.id" class="tag-chip" :style="{ backgroundColor: tag.color || '#667eea' }">
            {{ tag.name }}
          </span>
        </div>

        <div v-if="entry.experienceYears || entry.salaryExpectation" class="card-meta">
          <span v-if="entry.experienceYears" class="meta-item">{{ entry.experienceYears }} anos de experiencia</span>
          <span v-if="entry.salaryExpectation" class="meta-item">Pretensao: R$ {{ entry.salaryExpectation.toLocaleString('pt-BR') }}</span>
        </div>

        <div class="card-actions">
          <button class="btn-action" @click="openEntryForm(entry)">Editar</button>
          <button v-if="entry.status !== 'archived'" class="btn-action btn-danger" @click="archiveEntry(entry.id)">Arquivar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Formulario -->
    <div v-if="showEntryForm" class="modal-overlay" @click.self="closeEntryForm">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingEntryId ? 'Editar Talento' : 'Novo Talento' }}</h3>
          <button class="modal-close" @click="closeEntryForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveEntry" class="form-grid">
            <div class="form-group">
              <label class="form-label">Nome Completo *</label>
              <input v-model="formData.fullName" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Email *</label>
              <input v-model="formData.email" type="email" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input v-model="formData.phone" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">LinkedIn</label>
              <input v-model="formData.linkedinUrl" type="url" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Origem *</label>
              <select v-model="formData.source" class="form-select" required>
                <option v-for="(label, key) in TALENT_POOL_SOURCE_LABELS" :key="key" :value="key">{{ label }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Disponibilidade</label>
              <input v-model="formData.availability" type="text" class="form-input" placeholder="Ex: Imediato, 30 dias..." />
            </div>

            <div class="form-group">
              <label class="form-label">Anos de Experiencia</label>
              <input v-model.number="formData.experienceYears" type="number" min="0" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Pretensao Salarial</label>
              <input v-model.number="formData.salaryExpectation" type="number" min="0" class="form-input" />
            </div>

            <div class="form-group form-col-full">
              <label class="form-label">Notas</label>
              <textarea v-model="formData.notes" class="form-textarea" rows="3"></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeEntryForm">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Tags -->
    <div v-if="showTagModal" class="modal-overlay" @click.self="showTagModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Gerenciar Tags</h3>
          <button class="modal-close" @click="showTagModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createTag" class="tag-form">
            <input v-model="newTagName" type="text" class="form-input" placeholder="Nome da tag..." />
            <input v-model="newTagColor" type="color" class="color-input" />
            <button type="submit" class="btn btn-primary">Criar</button>
          </form>

          <div class="tags-list">
            <div v-for="tag in tags" :key="tag.id" class="tag-item">
              <span class="tag-chip" :style="{ backgroundColor: tag.color }">{{ tag.name }}</span>
              <button class="btn-icon btn-danger" @click="deleteTag(tag.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.talent-pool-view {
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

.header-actions {
  display: flex;
  gap: var(--space-4);
}

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

.filter-search {
  flex: 1;
  max-width: 400px;
}

.filter-label {
  font-size: var(--filter-label-font-size);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-select,
.filter-input {
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-8);
}

.entry-card {
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  transition: all var(--transition-fast);
}

.entry-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.card-title-row {
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

.card-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.card-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag-chip {
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border-light);
}

.meta-item {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.card-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.btn,
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--btn-border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--btn-font-weight);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  white-space: nowrap;
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

.btn-action {
  background-color: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}

.btn-action:hover {
  background-color: var(--color-bg-hover);
}

.btn-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger-dark);
  border-color: var(--color-danger-lighter);
}

.btn-danger:hover {
  background-color: var(--color-danger-lighter);
}

.badge {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  white-space: nowrap;
}

.badge-success {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.badge-info {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.badge-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
}

.badge-secondary {
  background-color: var(--color-secondary-light);
  color: var(--color-secondary-dark);
}

.badge-muted {
  background-color: var(--color-bg-muted);
  color: var(--color-text-muted);
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
  max-width: 700px;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-col-full {
  grid-column: 1 / -1;
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
  transition: border-color var(--transition-fast);
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

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

.tag-form {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.color-input {
  width: 50px;
  height: 40px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
}

.btn-icon {
  display: flex;
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
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .filter-bar {
    flex-direction: column;
  }

  .entries-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

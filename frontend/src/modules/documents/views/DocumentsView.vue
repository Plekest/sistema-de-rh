<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import documentService from '../services/document.service'
import employeeService from '@/modules/employees/services/employee.service'
import type { EmployeeDocument } from '../types'
import { DOCUMENT_TYPES } from '../types'
import type { Employee } from '@/modules/employees/types'
import { formatDate, formatFileSize } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const authStore = useAuthStore()
const { confirm: confirmDialog } = useConfirmDialog()

// Estado
const documents = ref<EmployeeDocument[]>([])
const employees = ref<Employee[]>([])
const isLoading = ref(false)
const error = ref('')
const totalPages = ref(1)
const currentPage = ref(1)

// Filtro
const selectedEmployee = ref<number | null>(null)

const isAdmin = computed(() => authStore.isAdmin || authStore.isManager)

// Upload
const showUploadForm = ref(false)
const uploadForm = ref({
  title: '',
  type: '',
  notes: '',
})
const uploadFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')

// Drag and drop
const isDragging = ref(false)

/**
 * Carrega documentos
 */
async function loadDocuments() {
  if (!selectedEmployee.value) {
    documents.value = []
    totalPages.value = 1
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    const params = {
      page: currentPage.value,
      limit: 20,
    }

    const response = await documentService.getAll(selectedEmployee.value, params)
    documents.value = response.data
    totalPages.value = response.meta.lastPage
  } catch (err: unknown) {
    error.value = 'Erro ao carregar documentos.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Carrega colaboradores
 */
async function loadEmployees() {
  try {
    const response = await employeeService.getAll({ limit: 200 })
    employees.value = response.data
  } catch (err: unknown) {
    console.error('Erro ao carregar colaboradores:', err)
  }
}

/**
 * Abre formulario de upload
 */
function openUploadForm() {
  if (!selectedEmployee.value) {
    error.value = 'Selecione um colaborador antes de enviar documentos.'
    return
  }
  uploadForm.value = {
    title: '',
    type: '',
    notes: '',
  }
  uploadFile.value = null
  uploadError.value = ''
  uploadSuccess.value = ''
  showUploadForm.value = true
}

/**
 * Seleciona arquivo
 */
function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    uploadFile.value = input.files[0] ?? null
  }
}

/**
 * Drag and drop handlers
 */
function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    uploadFile.value = event.dataTransfer.files[0] ?? null
  }
}

/**
 * Faz upload do documento
 */
async function handleUpload() {
  uploadError.value = ''
  uploadSuccess.value = ''

  if (!selectedEmployee.value) {
    uploadError.value = 'Nenhum colaborador selecionado.'
    return
  }
  if (!uploadForm.value.title.trim()) {
    uploadError.value = 'Titulo e obrigatorio.'
    return
  }
  if (!uploadForm.value.type) {
    uploadError.value = 'Tipo de documento e obrigatorio.'
    return
  }
  if (!uploadFile.value) {
    uploadError.value = 'Selecione um arquivo.'
    return
  }

  try {
    isUploading.value = true

    const formData = new FormData()
    formData.append('title', uploadForm.value.title)
    formData.append('type', uploadForm.value.type)
    formData.append('file', uploadFile.value)
    if (uploadForm.value.notes) {
      formData.append('notes', uploadForm.value.notes)
    }

    await documentService.upload(selectedEmployee.value, formData)
    uploadSuccess.value = 'Documento enviado com sucesso.'
    setTimeout(() => {
      uploadSuccess.value = ''
      showUploadForm.value = false
      loadDocuments()
    }, 1500)
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    uploadError.value = axiosErr.response?.data?.message || 'Erro ao enviar documento.'
  } finally {
    isUploading.value = false
  }
}

/**
 * Exclui documento
 */
async function handleDelete(doc: EmployeeDocument) {
  const result = await confirmDialog({
    title: 'Excluir Documento',
    message: `Deseja excluir o documento "${doc.title}"?`,
    variant: 'danger',
    confirmLabel: 'Excluir',
  })

  if (!result) return

  try {
    await documentService.delete(doc.id)
    await loadDocuments()
  } catch (err: unknown) {
    error.value = 'Erro ao excluir documento.'
    console.error(err)
  }
}

/**
 * Abre documento em nova aba
 */
function viewDocument(doc: EmployeeDocument) {
  window.open(documentService.getViewUrl(doc.id), '_blank')
}

/**
 * Faz download do documento
 */
function downloadDocument(doc: EmployeeDocument) {
  window.open(documentService.getDownloadUrl(doc.id), '_blank')
}

/**
 * Retorna label do tipo de documento
 */
function getTypeLabel(type: string): string {
  const found = DOCUMENT_TYPES.find((t) => t.value === type)
  return found ? found.label : type
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadDocuments()
  }
}

watch(selectedEmployee, () => {
  currentPage.value = 1
  loadDocuments()
})

onMounted(() => {
  if (isAdmin.value) {
    loadEmployees()
  } else if (authStore.employeeId) {
    selectedEmployee.value = authStore.employeeId
  }
})
</script>

<template>
  <div class="documents-view">
    <div class="page-header">
      <h1 class="page-title">Documentos</h1>
      <button v-if="isAdmin" class="btn btn-primary" @click="openUploadForm" :disabled="!selectedEmployee">
        Enviar Documento
      </button>
    </div>

    <!-- Filtro colaborador -->
    <div v-if="isAdmin" class="filters-bar">
      <div class="filter-group filter-grow">
        <label for="filter-emp">Colaborador</label>
        <select id="filter-emp" v-model="selectedEmployee">
          <option :value="null">Selecione um colaborador...</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">
            {{ emp.fullName }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <template v-if="!selectedEmployee">
      <EmptyState
        title="Selecione um colaborador"
        description="Escolha um colaborador no filtro acima para visualizar os documentos."
      />
    </template>

    <template v-else>
      <div v-if="isLoading" class="loading-state">
        <LoadingSpinner text="Carregando documentos..." />
      </div>

      <!-- Lista de documentos -->
      <div v-else-if="documents.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Tipo</th>
              <th>Arquivo</th>
              <th>Tamanho</th>
              <th>Data Upload</th>
              <th class="th-actions">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documents" :key="doc.id">
              <td class="td-name">{{ doc.title }}</td>
              <td>
                <span class="badge badge-type">{{ getTypeLabel(doc.type) }}</span>
              </td>
              <td class="td-filename">{{ doc.fileName }}</td>
              <td>{{ formatFileSize(doc.fileSize) }}</td>
              <td>{{ formatDate(doc.uploadedAt) }}</td>
              <td class="td-actions">
                <button class="btn-action" @click="viewDocument(doc)" title="Visualizar">Ver</button>
                <button class="btn-action" @click="downloadDocument(doc)" title="Download">Baixar</button>
                <button v-if="isAdmin" class="btn-action btn-action-danger" @click="handleDelete(doc)" title="Excluir">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState
        v-else
        title="Nenhum documento encontrado"
        :description="isAdmin ? 'Envie um novo documento para este colaborador.' : 'Nenhum documento disponivel.'"
      />
    </template>

    <!-- Paginacao -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="pagination-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">Anterior</button>
      <span class="pagination-info">Pagina {{ currentPage }} de {{ totalPages }}</span>
      <button class="pagination-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">Proxima</button>
    </div>

    <!-- Modal upload -->
    <div v-if="showUploadForm" class="modal-overlay" @click.self="showUploadForm = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Enviar Documento</h2>
          <button class="modal-close" @click="showUploadForm = false">&times;</button>
        </div>

        <form @submit.prevent="handleUpload" class="modal-body">
          <div v-if="uploadError" class="alert alert-error">{{ uploadError }}</div>
          <div v-if="uploadSuccess" class="alert alert-success" role="status" aria-live="polite">{{ uploadSuccess }}</div>

          <div class="form-stack">
            <div class="form-group">
              <label for="upload-title">Titulo *</label>
              <input id="upload-title" v-model="uploadForm.title" type="text" placeholder="Ex: Contrato de trabalho" />
            </div>

            <div class="form-group">
              <label for="upload-type">Tipo *</label>
              <select id="upload-type" v-model="uploadForm.type">
                <option value="" disabled>Selecione...</option>
                <option v-for="dt in DOCUMENT_TYPES" :key="dt.value" :value="dt.value">
                  {{ dt.label }}
                </option>
              </select>
            </div>

            <!-- Area de upload -->
            <div class="form-group">
              <label>Arquivo *</label>
              <div
                class="upload-area"
                :class="{ 'upload-area-active': isDragging, 'upload-area-filled': uploadFile }"
                @dragover="onDragOver"
                @dragleave="onDragLeave"
                @drop="onDrop"
              >
                <template v-if="uploadFile">
                  <span class="upload-filename">{{ uploadFile.name }}</span>
                  <span class="upload-filesize">{{ formatFileSize(uploadFile.size) }}</span>
                  <button type="button" class="upload-remove" @click="uploadFile = null">Remover</button>
                </template>
                <template v-else>
                  <span class="upload-text">Arraste um arquivo aqui ou</span>
                  <label for="file-input" class="upload-browse">selecione do computador</label>
                  <input id="file-input" type="file" class="upload-input" @change="onFileSelect" />
                </template>
              </div>
            </div>

            <div class="form-group">
              <label for="upload-notes">Observacoes</label>
              <textarea id="upload-notes" v-model="uploadForm.notes" rows="2" placeholder="Observacoes opcionais..."></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showUploadForm = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="isUploading">
              {{ isUploading ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.documents-view {
  max-width: var(--max-width-2xl, 1200px);
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-12, 1.5rem);
}

.page-title {
  font-size: var(--font-size-3xl, 1.5rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #1a202c);
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--btn-padding-y, 0.625rem) var(--btn-padding-x, 1.25rem);
  border: none;
  border-radius: var(--btn-border-radius, 6px);
  font-size: var(--btn-font-size, 0.875rem);
  font-weight: var(--btn-font-weight, 600);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
}

.btn-primary { background: var(--color-primary-gradient); color: var(--color-bg-card, #fff); }
.btn-primary:hover:not(:disabled) { box-shadow: var(--shadow-primary, 0 4px 12px rgba(102, 126, 234, 0.35)); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background-color: var(--color-bg-muted, #edf2f7); color: var(--color-text-tertiary, #4a5568); }
.btn-secondary:hover { background-color: var(--color-border, #e2e8f0); }

/* Filtros */
.filters-bar {
  display: flex;
  gap: var(--space-8, 1rem);
  margin-bottom: var(--space-12, 1.5rem);
  background: var(--color-bg-card, #fff);
  padding: var(--filter-bar-padding, 1rem 1.25rem);
  border-radius: var(--filter-bar-border-radius, 8px);
  border: var(--border-width, 1px) solid var(--color-border, #e2e8f0);
}

.filter-group { display: flex; flex-direction: column; gap: var(--space-2, 0.25rem); }
.filter-grow { flex: 1; }
.filter-group label { font-size: var(--filter-label-font-size, 0.75rem); font-weight: var(--font-weight-semibold, 600); color: var(--color-text-tertiary, #4a5568); text-transform: uppercase; letter-spacing: 0.025em; }
.filter-group select { padding: var(--input-padding-y, 0.5rem) var(--input-padding-x, 0.75rem); border: var(--border-width, 1px) solid var(--color-border, #e2e8f0); border-radius: var(--input-border-radius, 5px); font-size: var(--font-size-base, 0.875rem); color: var(--color-text-secondary, #2d3748); background: var(--color-bg-input, #fff); outline: none; }
.filter-group select:focus { border-color: var(--color-border-focus, #667eea); }

/* Tabela */
.table-container { background: var(--color-bg-card, #fff); border-radius: var(--card-border-radius, 8px); border: var(--border-width, 1px) solid var(--color-border, #e2e8f0); overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: var(--table-cell-padding-y, 0.75rem) var(--table-cell-padding-x, 1rem); font-size: var(--table-header-font-size, 0.75rem); font-weight: var(--table-header-font-weight, 600); color: var(--table-header-color, #4a5568); text-transform: uppercase; letter-spacing: 0.025em; border-bottom: var(--border-width-thick, 2px) solid var(--color-border, #e2e8f0); white-space: nowrap; }
.data-table td { padding: var(--table-cell-padding-y, 0.75rem) var(--table-cell-padding-x, 1rem); font-size: var(--font-size-base, 0.875rem); color: var(--color-text-secondary, #2d3748); border-bottom: var(--border-width, 1px) solid var(--color-border-light, #f0f0f0); }
.data-table tbody tr:hover { background-color: var(--table-row-hover-bg, #f7fafc); }
.th-actions { text-align: right; }
.td-actions { text-align: right; white-space: nowrap; }
.td-name { font-weight: var(--font-weight-medium, 500); }
.td-filename { font-size: var(--font-size-sm, 0.813rem); color: var(--color-text-muted, #718096); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.btn-action { background: none; border: var(--border-width, 1px) solid var(--color-border, #e2e8f0); padding: var(--space-2, 0.25rem) var(--space-5, 0.625rem); border-radius: var(--radius-xs, 4px); font-size: var(--font-size-xs, 0.75rem); color: var(--color-text-tertiary, #4a5568); cursor: pointer; margin-left: var(--space-3, 0.375rem); transition: all var(--transition-fast, 0.15s); }
.btn-action:hover { background-color: var(--color-bg-muted, #edf2f7); border-color: var(--color-border-hover, #cbd5e0); }
.btn-action-danger:hover { background-color: var(--color-danger-light, #fff5f5); border-color: var(--color-danger-lighter, #feb2b2); color: var(--color-danger-dark, #c53030); }

.badge { display: inline-block; padding: var(--badge-padding-y, 0.125rem) var(--badge-padding-x, 0.5rem); border-radius: var(--badge-border-radius, 10px); font-size: var(--badge-font-size, 0.75rem); font-weight: var(--badge-font-weight, 600); }
.badge-type { background-color: var(--color-bg-muted, #edf2f7); color: var(--color-text-tertiary, #4a5568); }

/* Paginacao */
.pagination { display: flex; justify-content: center; align-items: center; gap: var(--space-8, 1rem); margin-top: var(--space-12, 1.5rem); }
.pagination-btn { padding: var(--pagination-btn-padding-y, 0.5rem) var(--pagination-btn-padding-x, 1rem); border: var(--border-width, 1px) solid var(--color-border, #e2e8f0); border-radius: var(--input-border-radius, 5px); background: var(--color-bg-card, #fff); color: var(--color-text-tertiary, #4a5568); font-size: var(--font-size-base, 0.875rem); cursor: pointer; }
.pagination-btn:hover:not(:disabled) { background-color: var(--color-bg-muted, #edf2f7); }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination-info { font-size: var(--font-size-base, 0.875rem); color: var(--color-text-muted, #718096); }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal, 200); padding: var(--space-8, 1rem); }
.modal { background: var(--color-bg-card, #fff); border-radius: var(--card-border-radius, 8px); width: 100%; max-width: var(--max-width-sm, 550px); max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-10, 1.25rem); border-bottom: var(--border-width, 1px) solid var(--color-border, #e2e8f0); }
.modal-title { font-size: var(--font-size-xl, 1.125rem); font-weight: var(--font-weight-bold, 700); color: var(--color-text-primary, #1a202c); margin: 0; }
.modal-close { background: none; border: none; font-size: var(--font-size-3xl, 1.5rem); color: var(--color-text-placeholder, #a0aec0); cursor: pointer; padding: 0; line-height: 1; }
.modal-close:hover { color: var(--color-text-tertiary, #4a5568); }
.modal-body { padding: var(--space-10, 1.25rem); }
.modal-actions { display: flex; justify-content: flex-end; gap: var(--space-6, 0.75rem); margin-top: var(--space-10, 1.25rem); }

.form-stack { display: flex; flex-direction: column; gap: var(--space-8, 1rem); }
.form-group { display: flex; flex-direction: column; gap: var(--space-2, 0.25rem); }
.form-group label { font-size: var(--font-size-sm, 0.813rem); font-weight: var(--font-weight-semibold, 600); color: var(--color-text-tertiary, #4a5568); }
.form-group input,
.form-group select,
.form-group textarea { padding: var(--input-padding-y, 0.5rem) var(--input-padding-x, 0.75rem); border: var(--border-width, 1px) solid var(--color-border, #e2e8f0); border-radius: var(--input-border-radius, 5px); font-size: var(--font-size-base, 0.875rem); color: var(--color-text-secondary, #2d3748); background: var(--color-bg-input, #fff); outline: none; font-family: inherit; }
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: var(--color-border-focus, #667eea); }

/* Upload area */
.upload-area {
  border: var(--border-width-thick, 2px) dashed var(--color-border, #e2e8f0);
  border-radius: var(--card-border-radius, 8px);
  padding: var(--space-12, 1.5rem);
  text-align: center;
  transition: all var(--transition-fast, 0.15s);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3, 0.375rem);
}

.upload-area-active {
  border-color: var(--color-primary, #667eea);
  background: var(--color-info-light, #ebf8ff);
}

.upload-area-filled {
  border-color: var(--color-success, #38a169);
  background: var(--color-success-light, #f0fff4);
}

.upload-text { font-size: var(--font-size-base, 0.875rem); color: var(--color-text-muted, #718096); }
.upload-browse { font-size: var(--font-size-base, 0.875rem); color: var(--color-primary, #667eea); font-weight: var(--font-weight-medium, 500); cursor: pointer; text-decoration: underline; }
.upload-browse:hover { color: var(--color-secondary, #764ba2); }
.upload-input { display: none; }
.upload-filename { font-size: var(--font-size-base, 0.875rem); font-weight: var(--font-weight-medium, 500); color: var(--color-text-secondary, #2d3748); }
.upload-filesize { font-size: var(--font-size-xs, 0.75rem); color: var(--color-text-muted, #718096); }
.upload-remove { background: none; border: none; color: var(--color-danger, #e53e3e); font-size: var(--font-size-xs, 0.75rem); cursor: pointer; text-decoration: underline; }

/* Estados */
.alert { padding: var(--alert-padding-y, 0.75rem) var(--alert-padding-x, 1rem); border-radius: var(--alert-border-radius, 6px); font-size: var(--alert-font-size, 0.875rem); margin-bottom: var(--space-8, 1rem); }
.alert-error { background: var(--color-danger-light, #fff5f5); border: var(--border-width, 1px) solid var(--color-danger-lighter, #fed7d7); color: var(--color-danger-dark, #c53030); }
.alert-success { background: var(--color-success-light, #f0fff4); border: var(--border-width, 1px) solid var(--color-success-lighter, #c6f6d5); color: var(--color-success-dark, #276749); }
.loading-state { text-align: center; padding: var(--space-16, 2rem); color: var(--color-text-muted, #718096); font-size: var(--font-size-base, 0.875rem); }
.empty-state { text-align: center; padding: var(--space-24, 3rem) var(--space-8, 1rem); background: var(--color-bg-card, #fff); border-radius: var(--card-border-radius, 8px); border: var(--border-width, 1px) solid var(--color-border, #e2e8f0); }
.empty-title { font-size: var(--font-size-lg, 1rem); font-weight: var(--font-weight-semibold, 600); color: var(--color-text-tertiary, #4a5568); margin: 0 0 var(--space-4, 0.5rem); }
.empty-description { font-size: var(--font-size-base, 0.875rem); color: var(--color-text-muted, #718096); margin: 0; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: var(--space-8, 1rem); }

  /* Touch targets - minimo 44px para mobile */
  .btn-action {
    padding: var(--space-4, 0.5rem) var(--space-6, 0.75rem);
    font-size: var(--font-size-sm, 0.813rem);
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
</style>

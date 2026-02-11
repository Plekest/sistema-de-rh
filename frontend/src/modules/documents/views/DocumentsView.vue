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
      showUploadForm.value = false
      loadDocuments()
    }, 1000)
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
      <div class="empty-state">
        <p class="empty-title">Selecione um colaborador</p>
        <p class="empty-description">Escolha um colaborador no filtro acima para visualizar os documentos.</p>
      </div>
    </template>

    <template v-else>
      <div v-if="isLoading" class="loading-state">Carregando...</div>

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

      <div v-else class="empty-state">
        <p class="empty-title">Nenhum documento encontrado</p>
        <p class="empty-description">{{ isAdmin ? 'Envie um novo documento para este colaborador.' : 'Nenhum documento disponivel.' }}</p>
      </div>
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
          <div v-if="uploadSuccess" class="alert alert-success">{{ uploadSuccess }}</div>

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
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title { font-size: 1.5rem; font-weight: 700; color: #1a202c; margin: 0; }

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.btn-primary:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background-color: #edf2f7; color: #4a5568; }
.btn-secondary:hover { background-color: #e2e8f0; }

/* Filtros */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
.filter-grow { flex: 1; }
.filter-group label { font-size: 0.75rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; }
.filter-group select { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; }
.filter-group select:focus { border-color: #667eea; }

/* Tabela */
.table-container { background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.data-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: #2d3748; border-bottom: 1px solid #f0f0f0; }
.data-table tbody tr:hover { background-color: #f7fafc; }
.th-actions { text-align: right; }
.td-actions { text-align: right; white-space: nowrap; }
.td-name { font-weight: 500; }
.td-filename { font-size: 0.813rem; color: #718096; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.btn-action { background: none; border: 1px solid #e2e8f0; padding: 0.25rem 0.625rem; border-radius: 4px; font-size: 0.75rem; color: #4a5568; cursor: pointer; margin-left: 0.375rem; transition: all 0.15s; }
.btn-action:hover { background-color: #edf2f7; border-color: #cbd5e0; }
.btn-action-danger:hover { background-color: #fff5f5; border-color: #feb2b2; color: #c53030; }

.badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.badge-type { background-color: #edf2f7; color: #4a5568; }

/* Paginacao */
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.pagination-btn { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 5px; background: #fff; color: #4a5568; font-size: 0.875rem; cursor: pointer; }
.pagination-btn:hover:not(:disabled) { background-color: #edf2f7; }
.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pagination-info { font-size: 0.875rem; color: #718096; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
.modal { background: #fff; border-radius: 8px; width: 100%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid #e2e8f0; }
.modal-title { font-size: 1.125rem; font-weight: 700; color: #1a202c; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.5rem; color: #a0aec0; cursor: pointer; padding: 0; line-height: 1; }
.modal-close:hover { color: #4a5568; }
.modal-body { padding: 1.25rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }

.form-stack { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.25rem; }
.form-group label { font-size: 0.813rem; font-weight: 600; color: #4a5568; }
.form-group input,
.form-group select,
.form-group textarea { padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 0.875rem; color: #2d3748; background: #fff; outline: none; font-family: inherit; }
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: #667eea; }

/* Upload area */
.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.upload-area-active {
  border-color: #667eea;
  background: #ebf8ff;
}

.upload-area-filled {
  border-color: #38a169;
  background: #f0fff4;
}

.upload-text { font-size: 0.875rem; color: #718096; }
.upload-browse { font-size: 0.875rem; color: #667eea; font-weight: 500; cursor: pointer; text-decoration: underline; }
.upload-browse:hover { color: #764ba2; }
.upload-input { display: none; }
.upload-filename { font-size: 0.875rem; font-weight: 500; color: #2d3748; }
.upload-filesize { font-size: 0.75rem; color: #718096; }
.upload-remove { background: none; border: none; color: #e53e3e; font-size: 0.75rem; cursor: pointer; text-decoration: underline; }

/* Estados */
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 1rem; }
.alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.alert-success { background: #f0fff4; border: 1px solid #c6f6d5; color: #276749; }
.loading-state { text-align: center; padding: 2rem; color: #718096; font-size: 0.875rem; }
.empty-state { text-align: center; padding: 3rem 1rem; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
.empty-title { font-size: 1rem; font-weight: 600; color: #4a5568; margin: 0 0 0.5rem; }
.empty-description { font-size: 0.875rem; color: #a0aec0; margin: 0; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 1rem; }
}
</style>

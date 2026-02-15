<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import communicationService from '../services/communicationService'
import type { AutomatedCommunication, CommunicationLog } from '../types'
import { TRIGGER_TYPE_LABELS, TRIGGER_TYPE_COLORS } from '../types'

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const communications = ref<AutomatedCommunication[]>([])
const logs = ref<CommunicationLog[]>([])

const showFormModal = ref(false)
const editingCommId = ref<number | null>(null)
const formData = ref({
  name: '',
  triggerType: 'birthday' as any,
  triggerDaysBefore: 0,
  messageTemplate: '',
  isActive: true,
  targetRoles: [] as string[],
})

async function loadCommunications() {
  try {
    isLoading.value = true
    error.value = null
    communications.value = await communicationService.list()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar comunicações'
  } finally {
    isLoading.value = false
  }
}

async function loadLogs() {
  try {
    const response = await communicationService.getLog(undefined, 1, 20)
    logs.value = response.data
  } catch (err: any) {
    console.error('Erro ao carregar logs:', err)
  }
}

function openFormModal(comm?: AutomatedCommunication) {
  if (comm) {
    editingCommId.value = comm.id
    formData.value = {
      name: comm.name,
      triggerType: comm.triggerType,
      triggerDaysBefore: comm.triggerDaysBefore,
      messageTemplate: comm.messageTemplate,
      isActive: comm.isActive,
      targetRoles: comm.targetRoles || [],
    }
  } else {
    editingCommId.value = null
    formData.value = {
      name: '',
      triggerType: 'birthday',
      triggerDaysBefore: 0,
      messageTemplate: '',
      isActive: true,
      targetRoles: [],
    }
  }
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  editingCommId.value = null
}

async function saveCommunication() {
  try {
    error.value = null
    if (editingCommId.value) {
      await communicationService.update(editingCommId.value, formData.value)
      successMessage.value = 'Comunicação atualizada com sucesso'
    } else {
      await communicationService.create(formData.value)
      successMessage.value = 'Comunicação criada com sucesso'
    }
    setTimeout(() => { successMessage.value = null }, 3000)
    closeFormModal()
    await loadCommunications()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar comunicação'
  }
}

async function deleteCommunication(id: number) {
  if (!confirm('Deseja realmente deletar esta comunicação?')) return
  try {
    await communicationService.destroy(id)
    successMessage.value = 'Comunicação deletada com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadCommunications()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao deletar comunicação'
  }
}

async function toggleActive(id: number) {
  try {
    await communicationService.toggle(id)
    await loadCommunications()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao alterar status'
  }
}

async function executeNow() {
  if (!confirm('Executar todas as comunicações ativas agora?')) return
  try {
    isLoading.value = true
    error.value = null
    const result = await communicationService.execute()
    successMessage.value = `${result.sent} comunicações enviadas com sucesso`
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadLogs()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao executar comunicações'
  } finally {
    isLoading.value = false
  }
}

function getTriggerColor(type: string): string {
  return TRIGGER_TYPE_COLORS[type] || '#6b7280'
}

function highlightVariables(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, '<span class="variable">{{$1}}</span>')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR')
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    sent: 'status-sent',
    read: 'status-read',
    failed: 'status-failed',
  }
  return classes[status] || ''
}

onMounted(async () => {
  await Promise.all([loadCommunications(), loadLogs()])
})
</script>

<template>
  <div class="communications-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Comunicações Automatizadas</h1>
        <p class="page-subtitle">Configure mensagens automáticas para eventos importantes</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="executeNow">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Executar Agora
        </button>
        <button class="btn btn-primary" @click="openFormModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nova Comunicação
        </button>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div v-if="isLoading" class="loading">Carregando...</div>

    <!-- Lista de comunicações -->
    <div v-else-if="communications.length === 0" class="empty-state">
      <p>Nenhuma comunicação configurada</p>
    </div>

    <div v-else class="communications-grid">
      <div v-for="comm in communications" :key="comm.id" class="comm-card">
        <div class="comm-header">
          <div class="comm-title-row">
            <h3 class="comm-name">{{ comm.name }}</h3>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="comm.isActive"
                @change="toggleActive(comm.id)"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="comm-trigger">
            <span
              class="trigger-badge"
              :style="{ backgroundColor: getTriggerColor(comm.triggerType) }"
            >
              {{ TRIGGER_TYPE_LABELS[comm.triggerType] }}
            </span>
            <span v-if="comm.triggerDaysBefore > 0" class="trigger-days">
              {{ comm.triggerDaysBefore }} dias antes
            </span>
          </div>
        </div>

        <div class="comm-template">
          <div
            class="template-preview"
            v-html="highlightVariables(comm.messageTemplate.substring(0, 150))"
          ></div>
          <span v-if="comm.messageTemplate.length > 150" class="template-more">...</span>
        </div>

        <div v-if="comm.lastExecutedAt" class="comm-meta">
          <span class="meta-label">Última execução:</span>
          <span class="meta-value">{{ formatDate(comm.lastExecutedAt) }}</span>
        </div>

        <div class="comm-actions">
          <button class="btn-action" @click="openFormModal(comm)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
          </button>
          <button class="btn-action btn-danger" @click="deleteCommunication(comm.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Deletar
          </button>
        </div>
      </div>
    </div>

    <!-- Log de envios -->
    <div class="log-section">
      <h2 class="section-title">Últimos Envios</h2>
      <div v-if="logs.length === 0" class="empty-state">
        <p>Nenhum envio registrado</p>
      </div>
      <div v-else class="log-list">
        <div v-for="log in logs" :key="log.id" class="log-item">
          <div class="log-info">
            <div class="log-name">{{ log.employeeName || 'Destinatário desconhecido' }}</div>
            <div class="log-comm">{{ log.communicationName }}</div>
          </div>
          <div class="log-date">{{ formatDate(log.sentAt) }}</div>
          <span class="log-status" :class="getStatusClass(log.status)">
            {{ log.status === 'sent' ? 'Enviado' : log.status === 'read' ? 'Lido' : 'Falhou' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal: Formulário -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editingCommId ? 'Editar Comunicação' : 'Nova Comunicação' }}
          </h3>
          <button class="modal-close" @click="closeFormModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveCommunication" class="form">
            <div class="form-group form-col-full">
              <label class="form-label">Nome *</label>
              <input v-model="formData.name" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Tipo de Gatilho *</label>
              <select v-model="formData.triggerType" class="form-select" required>
                <option v-for="(label, key) in TRIGGER_TYPE_LABELS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Dias Antes</label>
              <input
                v-model.number="formData.triggerDaysBefore"
                type="number"
                min="0"
                class="form-input"
              />
            </div>

            <div class="form-group form-col-full">
              <label class="form-label">Mensagem *</label>
              <textarea
                v-model="formData.messageTemplate"
                class="form-textarea"
                rows="5"
                required
                placeholder="Use {{employee_name}}, {{hire_date}}, etc."
              ></textarea>
              <div class="form-hint" v-pre>
                Variáveis disponíveis: <code>{{employee_name}}</code>,
                <code>{{hire_date}}</code>, <code>{{department}}</code>,
                <code>{{position}}</code>
              </div>
            </div>

            <div class="form-group form-col-full">
              <label class="form-label">Perfis Alvo</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="admin"
                    v-model="formData.targetRoles"
                  />
                  <span>Admin</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="manager"
                    v-model="formData.targetRoles"
                  />
                  <span>Manager</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    value="employee"
                    v-model="formData.targetRoles"
                  />
                  <span>Employee</span>
                </label>
              </div>
            </div>

            <div class="form-group form-col-full">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.isActive" />
                <span>Ativo</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeFormModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.communications-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-8);
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
  min-width: 200px;
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
  flex-wrap: wrap;
}

.btn {
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

.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

/* Communications Grid */
.communications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-8);
}

.comm-card {
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  transition: all var(--transition-fast);
}

.comm-card:hover {
  box-shadow: var(--shadow-md);
}

.comm-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.comm-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.comm-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--comm-inactive-color);
  transition: var(--transition-fast);
  border-radius: var(--radius-full);
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--comm-active-color);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.comm-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.trigger-badge {
  padding: var(--space-1) var(--space-3);
  background-color: var(--comm-trigger-badge-bg);
  color: white;
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
}

.trigger-days {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.comm-template {
  padding: var(--space-4);
  background-color: var(--comm-template-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.template-preview :deep(.variable) {
  color: var(--comm-variable-color);
  font-weight: var(--font-weight-semibold);
  background-color: var(--color-primary-light);
  padding: 0 var(--space-1);
  border-radius: var(--radius-xs);
}

.template-more {
  color: var(--color-text-muted);
}

.comm-meta {
  display: flex;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  padding-top: var(--space-4);
  border-top: var(--border-width) solid var(--color-border-light);
}

.meta-label {
  color: var(--color-text-muted);
}

.meta-value {
  color: var(--color-text-secondary);
}

.comm-actions {
  display: flex;
  gap: var(--space-3);
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
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

/* Log Section */
.log-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-10);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.log-item {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-4);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
}

.log-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.log-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.log-comm {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.log-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.log-status {
  padding: var(--badge-padding-y) var(--badge-padding-x);
  border-radius: var(--badge-border-radius);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
}

.status-sent {
  background-color: var(--color-success-bg);
  color: var(--color-success-darker);
}

.status-read {
  background-color: var(--color-info-bg);
  color: var(--color-info-dark);
}

.status-failed {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-darker);
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

.form {
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

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.form-hint code {
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-xs);
  font-family: monospace;
  font-size: var(--font-size-2xs);
  color: var(--comm-variable-color);
}

.checkbox-group {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: var(--space-6);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .communications-grid {
    grid-template-columns: 1fr;
  }

  .log-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .form {
    grid-template-columns: 1fr;
  }
}
</style>

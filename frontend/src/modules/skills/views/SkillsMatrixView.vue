<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import skillsService from '../services/skillsService'
import type { SkillCategory, Skill, EmployeeSkill, DepartmentSkillMatrix } from '../types'

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const activeTab = ref<'catalog' | 'matrix' | 'assess' | 'gap'>('catalog')

// Catalog tab
const categories = ref<SkillCategory[]>([])
const expandedCategories = ref<Set<number>>(new Set())
const showCategoryModal = ref(false)
const showSkillModal = ref(false)
const categoryForm = ref({ id: null as number | null, name: '', description: '', displayOrder: 0 })
const skillForm = ref({ id: null as number | null, categoryId: 0, name: '', description: '' })

// Matrix tab
const selectedDepartmentId = ref<number | null>(null)
const departmentMatrix = ref<DepartmentSkillMatrix | null>(null)

// Assess tab
const selectedEmployeeId = ref<number | null>(null)
const employeeSkills = ref<EmployeeSkill[]>([])
const allSkills = ref<Skill[]>([])

// Gap tab
const gapEmployeeId = ref<number | null>(null)
const gapData = ref<Array<{ skill: Skill; currentLevel: number; targetLevel: number | null; gap: number }>>([])

function toggleCategory(categoryId: number) {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
}

function getLevelColor(level: number): string {
  const colors = [
    'transparent',
    '#ef4444', // 1 - vermelho
    '#f97316', // 2 - laranja
    '#eab308', // 3 - amarelo
    '#84cc16', // 4 - verde claro
    '#22c55e', // 5 - verde
  ]
  return colors[level] || colors[0]
}

function getLevelLabel(level: number): string {
  const labels = ['N/A', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Expert']
  return labels[level] || labels[0]
}

async function loadCategories() {
  try {
    isLoading.value = true
    error.value = null
    categories.value = await skillsService.getCategories()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar categorias'
  } finally {
    isLoading.value = false
  }
}

async function loadDepartmentMatrix() {
  if (!selectedDepartmentId.value) return
  try {
    isLoading.value = true
    error.value = null
    departmentMatrix.value = await skillsService.getDepartmentMatrix(selectedDepartmentId.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar matriz de competências'
  } finally {
    isLoading.value = false
  }
}

async function loadEmployeeSkills() {
  if (!selectedEmployeeId.value) return
  try {
    isLoading.value = true
    error.value = null
    const [skills, employeeSkillsData] = await Promise.all([
      skillsService.getSkills(),
      skillsService.getEmployeeSkills(selectedEmployeeId.value),
    ])
    allSkills.value = skills
    employeeSkills.value = employeeSkillsData
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar competências do colaborador'
  } finally {
    isLoading.value = false
  }
}

async function loadGapReport() {
  if (!gapEmployeeId.value) return
  try {
    isLoading.value = true
    error.value = null
    const report = await skillsService.getGapReport(gapEmployeeId.value)
    gapData.value = report.skills
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar análise de gap'
  } finally {
    isLoading.value = false
  }
}

function openCategoryModal(category?: SkillCategory) {
  if (category) {
    categoryForm.value = {
      id: category.id,
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder,
    }
  } else {
    categoryForm.value = { id: null, name: '', description: '', displayOrder: 0 }
  }
  showCategoryModal.value = true
}

function openSkillModal(skill?: Skill, categoryId?: number) {
  if (skill) {
    skillForm.value = {
      id: skill.id,
      categoryId: skill.categoryId,
      name: skill.name,
      description: skill.description || '',
    }
  } else {
    skillForm.value = { id: null, categoryId: categoryId || 0, name: '', description: '' }
  }
  showSkillModal.value = true
}

async function saveCategory() {
  try {
    error.value = null
    if (categoryForm.value.id) {
      await skillsService.updateCategory(categoryForm.value.id, categoryForm.value)
      successMessage.value = 'Categoria atualizada com sucesso'
    } else {
      await skillsService.createCategory(categoryForm.value)
      successMessage.value = 'Categoria criada com sucesso'
    }
    setTimeout(() => { successMessage.value = null }, 3000)
    showCategoryModal.value = false
    await loadCategories()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar categoria'
  }
}

async function saveSkill() {
  try {
    error.value = null
    if (skillForm.value.id) {
      await skillsService.updateSkill(skillForm.value.id, skillForm.value)
      successMessage.value = 'Competência atualizada com sucesso'
    } else {
      await skillsService.createSkill(skillForm.value)
      successMessage.value = 'Competência criada com sucesso'
    }
    setTimeout(() => { successMessage.value = null }, 3000)
    showSkillModal.value = false
    await loadCategories()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao salvar competência'
  }
}

async function deleteCategory(id: number) {
  if (!confirm('Deseja realmente deletar esta categoria?')) return
  try {
    await skillsService.deleteCategory(id)
    successMessage.value = 'Categoria deletada com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadCategories()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao deletar categoria'
  }
}

async function deleteSkill(id: number) {
  if (!confirm('Deseja realmente deletar esta competência?')) return
  try {
    await skillsService.deleteSkill(id)
    successMessage.value = 'Competência deletada com sucesso'
    setTimeout(() => { successMessage.value = null }, 3000)
    await loadCategories()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao deletar competência'
  }
}

async function updateSkillLevel(employeeId: number, skillId: number, currentLevel: number, targetLevel: number | null) {
  try {
    await skillsService.assessSkill({ employeeId, skillId, currentLevel, targetLevel: targetLevel || undefined })
    successMessage.value = 'Nível atualizado com sucesso'
    setTimeout(() => { successMessage.value = null }, 2000)
    if (activeTab.value === 'assess') {
      await loadEmployeeSkills()
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao atualizar nível'
  }
}

function getEmployeeSkillLevel(employeeSkills: EmployeeSkill[], skillId: number): number {
  const found = employeeSkills.find(es => es.skillId === skillId)
  return found ? found.currentLevel : 0
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="skills-matrix-view">
    <div class="view-header">
      <div class="header-text">
        <h1 class="page-title">Matriz de Competências</h1>
        <p class="page-subtitle">Gerencie competências e avalie colaboradores</p>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'catalog' }"
        @click="activeTab = 'catalog'"
      >
        Catálogo de Skills
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'matrix' }"
        @click="activeTab = 'matrix'"
      >
        Matriz por Departamento
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'assess' }"
        @click="activeTab = 'assess'"
      >
        Avaliação Individual
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'gap' }"
        @click="activeTab = 'gap'"
      >
        Gap Analysis
      </button>
    </div>

    <!-- Tab: Catálogo de Skills -->
    <div v-if="activeTab === 'catalog'" class="tab-content">
      <div class="tab-actions">
        <button class="btn btn-primary" @click="openCategoryModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nova Categoria
        </button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>

      <div v-else-if="categories.length === 0" class="empty-state">
        <p>Nenhuma categoria criada</p>
      </div>

      <div v-else class="categories-list">
        <div v-for="category in categories" :key="category.id" class="category-card">
          <div class="category-header" @click="toggleCategory(category.id)">
            <div class="category-info">
              <h3 class="category-name">{{ category.name }}</h3>
              <p v-if="category.description" class="category-desc">{{ category.description }}</p>
              <span class="category-count">{{ category.skills?.length || 0 }} competências</span>
            </div>
            <div class="category-actions">
              <button class="btn-icon" @click.stop="openCategoryModal(category)" title="Editar categoria">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon" @click.stop="openSkillModal(undefined, category.id)" title="Adicionar competência">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button class="btn-icon btn-danger" @click.stop="deleteCategory(category.id)" title="Deletar categoria">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon" :class="{ 'expanded': expandedCategories.has(category.id) }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <div v-if="expandedCategories.has(category.id)" class="skills-list">
            <div v-if="!category.skills || category.skills.length === 0" class="empty-skills">
              Nenhuma competência nesta categoria
            </div>
            <div v-else>
              <div v-for="skill in category.skills" :key="skill.id" class="skill-row">
                <div class="skill-info">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span v-if="skill.description" class="skill-desc">{{ skill.description }}</span>
                </div>
                <div class="skill-row-actions">
                  <button class="btn-icon-sm" @click="openSkillModal(skill)" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn-icon-sm btn-danger" @click="deleteSkill(skill.id)" title="Deletar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    </div>

    <!-- Tab: Matriz por Departamento -->
    <div v-if="activeTab === 'matrix'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Departamento</label>
          <input
            v-model.number="selectedDepartmentId"
            type="number"
            class="filter-input"
            placeholder="ID do departamento"
          />
        </div>
        <button class="btn btn-primary" @click="loadDepartmentMatrix">Carregar Matriz</button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>

      <div v-else-if="!departmentMatrix" class="empty-state">
        <p>Selecione um departamento para visualizar a matriz</p>
      </div>

      <div v-else class="matrix-container">
        <h3 class="matrix-title">{{ departmentMatrix.department.name }}</h3>
        <div class="matrix-scroll">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="matrix-header-fixed">Colaborador</th>
                <th v-for="skill in departmentMatrix.skills" :key="skill.id" class="matrix-header-skill">
                  {{ skill.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in departmentMatrix.employees" :key="emp.id">
                <td class="matrix-cell-name">{{ emp.name }}</td>
                <td v-for="skill in departmentMatrix.skills" :key="skill.id" class="matrix-cell">
                  <div
                    class="level-badge"
                    :style="{ backgroundColor: getLevelColor(getEmployeeSkillLevel(emp.skills, skill.id)) }"
                    :title="getLevelLabel(getEmployeeSkillLevel(emp.skills, skill.id))"
                  >
                    {{ getEmployeeSkillLevel(emp.skills, skill.id) || '-' }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="matrix-legend">
          <span class="legend-title">Legenda:</span>
          <div v-for="level in [1, 2, 3, 4, 5]" :key="level" class="legend-item">
            <div class="legend-badge" :style="{ backgroundColor: getLevelColor(level) }">{{ level }}</div>
            <span class="legend-label">{{ getLevelLabel(level) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Avaliação Individual -->
    <div v-if="activeTab === 'assess'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Colaborador (ID)</label>
          <input
            v-model.number="selectedEmployeeId"
            type="number"
            class="filter-input"
            placeholder="ID do colaborador"
          />
        </div>
        <button class="btn btn-primary" @click="loadEmployeeSkills">Carregar Competências</button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>

      <div v-else-if="allSkills.length === 0" class="empty-state">
        <p>Selecione um colaborador para avaliar competências</p>
      </div>

      <div v-else class="assess-container">
        <div v-for="skill in allSkills" :key="skill.id" class="assess-item">
          <div class="assess-header">
            <span class="assess-skill-name">{{ skill.name }}</span>
            <span v-if="skill.description" class="assess-skill-desc">{{ skill.description }}</span>
          </div>
          <div class="assess-sliders">
            <div class="slider-group">
              <label class="slider-label">Nível Atual</label>
              <input
                type="range"
                min="0"
                max="5"
                :value="employeeSkills.find(es => es.skillId === skill.id)?.currentLevel || 0"
                @input="(e) => {
                  const current = parseInt((e.target as HTMLInputElement).value)
                  const target = employeeSkills.find(es => es.skillId === skill.id)?.targetLevel || null
                  if (selectedEmployeeId) updateSkillLevel(selectedEmployeeId, skill.id, current, target)
                }"
                class="range-slider"
              />
              <span class="slider-value">{{ employeeSkills.find(es => es.skillId === skill.id)?.currentLevel || 0 }}</span>
            </div>
            <div class="slider-group">
              <label class="slider-label">Nível Alvo</label>
              <input
                type="range"
                min="0"
                max="5"
                :value="employeeSkills.find(es => es.skillId === skill.id)?.targetLevel || 0"
                @input="(e) => {
                  const target = parseInt((e.target as HTMLInputElement).value)
                  const current = employeeSkills.find(es => es.skillId === skill.id)?.currentLevel || 0
                  if (selectedEmployeeId) updateSkillLevel(selectedEmployeeId, skill.id, current, target)
                }"
                class="range-slider"
              />
              <span class="slider-value">{{ employeeSkills.find(es => es.skillId === skill.id)?.targetLevel || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Gap Analysis -->
    <div v-if="activeTab === 'gap'" class="tab-content">
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Colaborador (ID)</label>
          <input
            v-model.number="gapEmployeeId"
            type="number"
            class="filter-input"
            placeholder="ID do colaborador"
          />
        </div>
        <button class="btn btn-primary" @click="loadGapReport">Gerar Análise</button>
      </div>

      <div v-if="isLoading" class="loading">Carregando...</div>

      <div v-else-if="gapData.length === 0" class="empty-state">
        <p>Selecione um colaborador para análise de gap</p>
      </div>

      <div v-else class="gap-container">
        <div v-for="item in gapData.filter(i => i.gap > 0)" :key="item.skill.id" class="gap-item">
          <div class="gap-header">
            <span class="gap-skill-name">{{ item.skill.name }}</span>
            <span class="gap-badge" :class="{ 'gap-high': item.gap > 1 }">Gap: {{ item.gap }}</span>
          </div>
          <div class="gap-bar-container">
            <div class="gap-bar gap-bar-current" :style="{ width: (item.currentLevel * 20) + '%' }">
              <span class="gap-bar-label">Atual: {{ item.currentLevel }}</span>
            </div>
            <div class="gap-bar gap-bar-target" :style="{ width: ((item.targetLevel || 0) * 20) + '%' }">
              <span class="gap-bar-label">Alvo: {{ item.targetLevel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Categoria -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ categoryForm.id ? 'Editar Categoria' : 'Nova Categoria' }}</h3>
          <button class="modal-close" @click="showCategoryModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCategory" class="form-grid">
            <div class="form-group form-col-full">
              <label class="form-label">Nome *</label>
              <input v-model="categoryForm.name" type="text" class="form-input" required />
            </div>
            <div class="form-group form-col-full">
              <label class="form-label">Descrição</label>
              <textarea v-model="categoryForm.description" class="form-textarea" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Ordem de Exibição</label>
              <input v-model.number="categoryForm.displayOrder" type="number" class="form-input" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showCategoryModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Competência -->
    <div v-if="showSkillModal" class="modal-overlay" @click.self="showSkillModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ skillForm.id ? 'Editar Competência' : 'Nova Competência' }}</h3>
          <button class="modal-close" @click="showSkillModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSkill" class="form-grid">
            <div class="form-group form-col-full">
              <label class="form-label">Nome *</label>
              <input v-model="skillForm.name" type="text" class="form-input" required />
            </div>
            <div class="form-group form-col-full">
              <label class="form-label">Descrição</label>
              <textarea v-model="skillForm.description" class="form-textarea" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showSkillModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-matrix-view {
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
.empty-state,
.empty-skills {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-text-muted);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
}

.empty-skills {
  padding: var(--space-8);
  font-size: var(--font-size-sm);
}

/* Tabs */
.tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: var(--border-width) solid var(--color-border);
  padding-bottom: var(--space-2);
}

.tab {
  padding: var(--space-4) var(--space-8);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.tab-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
}

/* Categories */
.categories-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.category-card {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-8) var(--space-10);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.category-header:hover {
  background-color: var(--color-bg-hover);
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.category-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.category-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.category-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.expand-icon {
  transition: transform var(--transition-fast);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

/* Skills List */
.skills-list {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--space-6) var(--space-10);
  background-color: var(--color-bg-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
}

.skill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.skill-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.skill-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.skill-row-actions {
  display: flex;
  gap: var(--space-2);
}

/* Matrix */
.matrix-container {
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  padding: var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.matrix-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.matrix-scroll {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.matrix-header-fixed,
.matrix-header-skill {
  padding: var(--space-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  background-color: var(--color-bg-subtle);
  border-bottom: var(--border-width) solid var(--color-border);
}

.matrix-header-fixed {
  position: sticky;
  left: 0;
  background-color: var(--color-bg-card);
  z-index: 1;
  min-width: 150px;
}

.matrix-header-skill {
  min-width: 100px;
  text-align: center;
}

.matrix-cell-name {
  padding: var(--space-4);
  position: sticky;
  left: 0;
  background-color: var(--color-bg-card);
  font-weight: var(--font-weight-medium);
  border-bottom: var(--border-width) solid var(--color-border-light);
  min-width: 150px;
}

.matrix-cell {
  padding: var(--space-4);
  text-align: center;
  border-bottom: var(--border-width) solid var(--color-border-light);
}

.level-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  color: white;
  font-size: var(--font-size-sm);
}

.matrix-legend {
  display: flex;
  gap: var(--space-6);
  align-items: center;
  flex-wrap: wrap;
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

.legend-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.legend-item {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.legend-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: white;
}

.legend-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Assess */
.assess-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  padding: var(--space-10);
}

.assess-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-8);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-md);
}

.assess-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.assess-skill-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.assess-skill-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.assess-sliders {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.slider-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.range-slider {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-full);
  outline: none;
  -webkit-appearance: none;
  background: var(--color-bg-muted);
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.slider-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-align: center;
}

/* Gap Analysis */
.gap-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--card-border-radius);
  padding: var(--space-10);
}

.gap-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-8);
  background-color: var(--color-bg-subtle);
  border-radius: var(--radius-md);
}

.gap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gap-skill-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.gap-badge {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-warning-bg);
  color: var(--color-warning-darker);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
}

.gap-badge.gap-high {
  background-color: var(--color-danger-bg);
  color: var(--color-danger-darker);
}

.gap-bar-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.gap-bar {
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  min-width: 80px;
}

.gap-bar-current {
  background-color: var(--color-info);
}

.gap-bar-target {
  background-color: var(--color-success);
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: var(--space-8);
  padding: var(--space-8);
  background-color: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  max-width: 300px;
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-input {
  padding: var(--space-3) var(--space-6);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.filter-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

/* Buttons */
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

.btn-icon,
.btn-icon-sm {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon {
  width: 32px;
  height: 32px;
}

.btn-icon-sm {
  width: 28px;
  height: 28px;
}

.btn-icon:hover,
.btn-icon-sm:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.btn-icon.btn-danger:hover,
.btn-icon-sm.btn-danger:hover {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
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

@media (max-width: 768px) {
  .tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    max-width: 100%;
  }

  .assess-sliders {
    grid-template-columns: 1fr;
  }

  .matrix-scroll {
    overflow-x: scroll;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

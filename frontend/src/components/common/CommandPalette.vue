<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useCommandPalette } from '@/composables/useCommandPalette'
import type { CommandPaletteResult } from '@/composables/useCommandPalette'

const {
  isOpen,
  query,
  results,
  isLoading,
  selectedIndex,
  close,
  selectItem,
  selectPrevious,
  selectNext,
  selectCurrent,
  setupKeyboardShortcut,
} = useCommandPalette()

// Agrupa resultados por tipo
const groupedResults = computed(() => {
  const groups: Record<string, CommandPaletteResult[]> = {
    navigation: [],
    employee: [],
    department: [],
    position: [],
  }

  results.value.forEach((result) => {
    const group = groups[result.type]
    if (group) {
      group.push(result)
    }
  })

  return groups
})

const typeLabels: Record<string, string> = {
  navigation: 'Navegação',
  employee: 'Colaboradores',
  department: 'Departamentos',
  position: 'Cargos',
}

/**
 * Retorna icone SVG inline para cada tipo
 */
function getIcon(type: string, iconName?: string): string {
  const icons: Record<string, string> = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>',
    clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    time: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 8 14"></polyline>',
    timeline: '<line x1="12" y1="2" x2="12" y2="22"></line><circle cx="12" cy="6" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="18" r="2"></circle>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
    list: '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',
    employee: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    department: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>',
    position: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>',
  }

  return icons[iconName || type] ?? icons.file ?? ''
}

/**
 * Trata teclas de navegacao
 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectPrevious()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectNext()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    selectCurrent()
  }
}

/**
 * Calcula o index global de um resultado
 */
function getGlobalIndex(type: string, localIndex: number): number {
  let globalIndex = 0
  const types = ['navigation', 'employee', 'department', 'position']

  for (const t of types) {
    if (t === type) {
      return globalIndex + localIndex
    }
    globalIndex += groupedResults.value[t]?.length || 0
  }

  return globalIndex
}

/**
 * Verifica se um item esta selecionado
 */
function isSelected(type: string, localIndex: number): boolean {
  return getGlobalIndex(type, localIndex) === selectedIndex.value
}

let cleanup: (() => void) | null = null

onMounted(() => {
  cleanup = setupKeyboardShortcut()
})

onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div
        v-if="isOpen"
        class="command-palette-overlay"
        @click="close"
        @keydown="handleKeydown"
      >
        <Transition name="palette-scale">
          <div
            v-if="isOpen"
            class="command-palette-card"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-title"
          >
            <!-- Input de busca -->
            <div class="command-palette-header">
              <svg
                class="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                v-model="query"
                type="text"
                class="command-palette-input"
                placeholder="Buscar ou navegar..."
                id="command-palette-title"
                autofocus
              />
              <kbd class="command-palette-kbd">Esc</kbd>
            </div>

            <!-- Resultados -->
            <div class="command-palette-body">
              <div v-if="isLoading" class="command-palette-loading">
                <div class="spinner"></div>
                <span>Buscando...</span>
              </div>

              <div v-else-if="results.length === 0" class="command-palette-empty">
                <span>Nenhum resultado encontrado</span>
              </div>

              <div v-else class="command-palette-results">
                <template v-for="(type, key) in groupedResults" :key="key">
                  <div v-if="type.length > 0" class="result-group">
                    <div class="result-group-label">{{ typeLabels[key] }}</div>
                    <div
                      v-for="(result, index) in type"
                      :key="result.id"
                      class="result-item"
                      :class="{ selected: isSelected(key, index) }"
                      @click="selectItem(result)"
                      @mouseenter="selectedIndex = getGlobalIndex(key, index)"
                      role="button"
                      tabindex="0"
                    >
                      <svg
                        class="result-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        v-html="getIcon(result.type, result.icon)"
                      ></svg>
                      <div class="result-content">
                        <span class="result-title">{{ result.title }}</span>
                        <span v-if="result.description" class="result-description">
                          {{ result.description }}
                        </span>
                      </div>
                      <span class="result-type-badge">{{ typeLabels[result.type] }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Footer -->
            <div class="command-palette-footer">
              <div class="command-palette-hint">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <span>para navegar</span>
              </div>
              <div class="command-palette-hint">
                <kbd>Enter</kbd>
                <span>para selecionar</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay */
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: var(--z-dialog);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20vh;
  transition: all var(--transition-base);
}

/* Card */
.command-palette-card {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all var(--transition-spring);
  margin: 0 var(--space-8);
}

/* Header */
.command-palette-header {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-10);
  border-bottom: var(--border-width) solid var(--color-border);
}

.search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.command-palette-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
}

.command-palette-input::placeholder {
  color: var(--color-text-placeholder);
}

.command-palette-kbd {
  background: var(--color-bg-subtle);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  font-family: monospace;
}

/* Body */
.command-palette-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) 0;
}

.command-palette-loading,
.command-palette-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  padding: var(--space-20);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Results */
.command-palette-results {
  display: flex;
  flex-direction: column;
}

.result-group {
  display: flex;
  flex-direction: column;
}

.result-group:not(:last-child) {
  border-bottom: var(--border-width) solid var(--color-border-light);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
}

.result-group-label {
  padding: var(--space-3) var(--space-10);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-5) var(--space-10);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.result-item:hover,
.result-item.selected {
  background: var(--color-bg-hover);
}

.result-item.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

.result-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.result-item:hover .result-icon,
.result-item.selected .result-icon {
  color: var(--color-primary);
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.result-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-description {
  font-size: var(--font-size-2xs);
  color: var(--color-text-placeholder);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-type-badge {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-placeholder);
  background: var(--color-bg-subtle);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-xl);
  flex-shrink: 0;
}

/* Footer */
.command-palette-footer {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  padding: var(--space-4) var(--space-10);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-bg-subtle);
}

.command-palette-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-2xs);
  color: var(--color-text-muted);
}

.command-palette-hint kbd {
  background: var(--color-bg-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  font-family: monospace;
  min-width: 20px;
  text-align: center;
}

/* Transicoes */
.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity var(--transition-base);
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}

.palette-scale-enter-active {
  transition: all var(--transition-spring);
}

.palette-scale-leave-active {
  transition: all var(--transition-base);
}

.palette-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.palette-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .command-palette-overlay {
    padding-top: 10vh;
  }

  .command-palette-card {
    max-height: 70vh;
  }

  .result-type-badge {
    display: none;
  }
}
</style>

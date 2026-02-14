import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme-preference'

/**
 * Detecta preferencia do sistema operacional
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Carrega preferencia salva ou usa preferencia do sistema
 */
function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return getSystemTheme()
}

// Estado compartilhado entre todas as instancias do composable
const theme = ref<'light' | 'dark'>(getInitialTheme())

/**
 * Composable para gerenciar tema claro/escuro do sistema
 *
 * Funcionalidades:
 * - Aplica tema via atributo data-theme no html
 * - Persiste preferencia no localStorage
 * - Detecta preferencia do sistema como fallback
 * - Estado compartilhado (singleton)
 */
export function useTheme() {
  /**
   * Alterna entre tema claro e escuro
   */
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  /**
   * Define tema especifico
   */
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }

  // Observa mudancas no tema e aplica no DOM + localStorage
  watch(theme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }, { immediate: true })

  // Detecta mudancas na preferencia do sistema (somente se usuario nao escolheu explicitamente)
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        theme.value = e.matches ? 'dark' : 'light'
      }
    })
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light'
  }
}

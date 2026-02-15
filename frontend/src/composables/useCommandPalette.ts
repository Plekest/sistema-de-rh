import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

export interface CommandPaletteResult {
  id: string
  title: string
  description?: string
  type: 'employee' | 'department' | 'position' | 'navigation'
  path: string
  icon?: string
}

export function useCommandPalette() {
  const router = useRouter()
  const isOpen = ref(false)
  const query = ref('')
  const results = ref<CommandPaletteResult[]>([])
  const isLoading = ref(false)
  const selectedIndex = ref(0)
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Itens de navegacao estaticos (sempre visiveis quando nao ha busca)
   */
  const navigationItems: CommandPaletteResult[] = [
    { id: 'nav-home', title: 'Dashboard', description: 'Ir para o painel principal', type: 'navigation', path: '/home', icon: 'home' },
    { id: 'nav-employees', title: 'Colaboradores', description: 'Gerenciar colaboradores', type: 'navigation', path: '/employees', icon: 'users' },
    { id: 'nav-leave', title: 'Férias e Licenças', description: 'Gerenciar ausências', type: 'navigation', path: '/leave', icon: 'calendar' },
    { id: 'nav-payroll', title: 'Folha de Pagamento', description: 'Visualizar contracheques', type: 'navigation', path: '/payroll', icon: 'dollar' },
    { id: 'nav-benefits', title: 'Benefícios', description: 'Gerenciar benefícios', type: 'navigation', path: '/benefits', icon: 'gift' },
    { id: 'nav-training', title: 'Treinamentos', description: 'Acessar treinamentos', type: 'navigation', path: '/training', icon: 'book' },
    { id: 'nav-recruitment', title: 'Recrutamento', description: 'Processos seletivos', type: 'navigation', path: '/recruitment', icon: 'briefcase' },
    { id: 'nav-performance', title: 'Avaliação de Desempenho', description: 'Acessar avaliações', type: 'navigation', path: '/performance', icon: 'chart' },
    { id: 'nav-documents', title: 'Documentos', description: 'Gerenciar documentos', type: 'navigation', path: '/documents', icon: 'file' },
    { id: 'nav-attendance', title: 'Registro de Ponto', description: 'Registrar ponto', type: 'navigation', path: '/attendance', icon: 'clock' },
    { id: 'nav-hours-bank', title: 'Banco de Horas', description: 'Consultar saldo', type: 'navigation', path: '/hours-bank', icon: 'time' },
    { id: 'nav-history', title: 'Histórico', description: 'Ver histórico profissional', type: 'navigation', path: '/history', icon: 'timeline' },
    { id: 'nav-users', title: 'Usuários', description: 'Gerenciar usuários (Admin)', type: 'navigation', path: '/users', icon: 'user' },
    { id: 'nav-permissions', title: 'Permissões', description: 'Configurar permissões (Admin)', type: 'navigation', path: '/admin/permissions', icon: 'shield' },
    { id: 'nav-notifications', title: 'Notificações', description: 'Ver notificações', type: 'navigation', path: '/notifications', icon: 'bell' },
    { id: 'nav-audit-log', title: 'Audit Log', description: 'Ver logs de auditoria (Admin)', type: 'navigation', path: '/audit-log', icon: 'list' },
    { id: 'nav-calendar', title: 'Calendário', description: 'Ver calendário da equipe', type: 'navigation', path: '/calendar', icon: 'calendar' },
  ]

  /**
   * Abre o command palette
   */
  function open() {
    isOpen.value = true
    query.value = ''
    results.value = navigationItems
    selectedIndex.value = 0
  }

  /**
   * Fecha o command palette
   */
  function close() {
    isOpen.value = false
    query.value = ''
    results.value = []
    selectedIndex.value = 0
  }

  /**
   * Executa busca na API com debounce
   */
  async function search(searchQuery: string) {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    if (!searchQuery.trim()) {
      results.value = navigationItems
      selectedIndex.value = 0
      return
    }

    debounceTimeout = setTimeout(async () => {
      isLoading.value = true
      try {
        const response = await api.get<{ data: CommandPaletteResult[] }>('/search', {
          params: { q: searchQuery },
        })

        // Combina resultados da API com itens de navegacao filtrados
        const filteredNavigation = navigationItems.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )

        results.value = [...response.data.data, ...filteredNavigation]
        selectedIndex.value = 0
      } catch (error) {
        // Em caso de erro, mostra apenas navegacao filtrada
        results.value = navigationItems.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        selectedIndex.value = 0
      } finally {
        isLoading.value = false
      }
    }, 300)
  }

  /**
   * Navega para o item selecionado
   */
  function selectItem(item: CommandPaletteResult) {
    router.push(item.path)
    close()
  }

  /**
   * Navega para cima na lista
   */
  function selectPrevious() {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  }

  /**
   * Navega para baixo na lista
   */
  function selectNext() {
    if (selectedIndex.value < results.value.length - 1) {
      selectedIndex.value++
    }
  }

  /**
   * Seleciona o item atual (Enter)
   */
  function selectCurrent() {
    const item = results.value[selectedIndex.value]
    if (item) {
      selectItem(item)
    }
  }

  /**
   * Watch na query para buscar automaticamente
   */
  watch(query, (newQuery) => {
    search(newQuery)
  })

  /**
   * Listener global para Ctrl+K / Cmd+K
   */
  function setupKeyboardShortcut() {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen.value) {
          close()
        } else {
          open()
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }

  return {
    isOpen,
    query,
    results,
    isLoading,
    selectedIndex,
    open,
    close,
    selectItem,
    selectPrevious,
    selectNext,
    selectCurrent,
    setupKeyboardShortcut,
  }
}

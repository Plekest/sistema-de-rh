import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/modules/auth/services/auth.service'
import type { User, LoginCredentials, UserPermissions } from '@/modules/auth/types'
import router from '@/router'

/**
 * Store de autenticacao - gerencia estado do usuario logado
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref<boolean>(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const isAdmin = computed(() => user.value?.role === 'admin')

  const isManager = computed(() => user.value?.role === 'manager')

  const userRole = computed(() => user.value?.role || null)

  const employeeId = computed(() => user.value?.employeeId || null)

  const permissions = computed(() => user.value?.permissions || null)

  /**
   * Verifica se o usuario tem acesso a um modulo especifico
   */
  function canAccess(module: string): boolean {
    if (!permissions.value) return true
    const key = module as keyof UserPermissions
    if (key in permissions.value) {
      return permissions.value[key]
    }
    return true
  }

  /**
   * Retorna o path da primeira rota acessivel ao usuario
   */
  function getDefaultRoute(): string {
    return '/home'
  }

  // Actions
  /**
   * Realiza login do usuario
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      isLoading.value = true
      const response = await authService.login(credentials)

      // Salva token no localStorage
      token.value = response.token
      localStorage.setItem('auth_token', response.token)

      // Salva dados do usuario
      user.value = response.user

      // Redireciona para pagina inicial baseada nas permissoes
      const defaultRoute = getDefaultRoute()
      await router.push(defaultRoute)
    } catch (error) {
      // Limpa qualquer estado
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Realiza logout do usuario
   */
  async function logout(): Promise<void> {
    try {
      isLoading.value = true

      // Chama API de logout (se houver token)
      if (token.value) {
        await authService.logout()
      }
    } catch (error) {
      // Ignora erros no logout (pode ja estar expirado)
      console.error('Erro ao fazer logout:', error)
    } finally {
      // Sempre limpa o estado local
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      isLoading.value = false

      // Redireciona para login
      await router.push('/login')
    }
  }

  /**
   * Busca dados do usuario autenticado
   */
  async function fetchUser(): Promise<void> {
    try {
      isLoading.value = true
      const userData = await authService.me()
      user.value = userData
    } catch (error) {
      // Se falhar ao buscar usuario, limpa autenticacao
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicializa o store - verifica se ha token salvo
   */
  async function initialize(): Promise<void> {
    const savedToken = localStorage.getItem('auth_token')

    if (savedToken) {
      token.value = savedToken

      try {
        // Tenta buscar dados do usuario
        await fetchUser()
      } catch (error) {
        // Token invalido ou expirado
        console.error('Erro ao inicializar autenticacao:', error)
        token.value = null
        user.value = null
        localStorage.removeItem('auth_token')
      }
    }
  }

  return {
    // State
    user,
    token,
    isLoading,

    // Getters
    isAuthenticated,
    isAdmin,
    isManager,
    userRole,
    employeeId,
    permissions,

    // Actions
    login,
    logout,
    fetchUser,
    initialize,
    canAccess,
    getDefaultRoute
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/modules/auth/services/auth.service'
import type { User, LoginCredentials } from '@/modules/auth/types'
import router from '@/router'

/**
 * Store de autenticação - gerencia estado do usuário logado
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

  // Actions
  /**
   * Realiza login do usuário
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    try {
      isLoading.value = true
      const response = await authService.login(credentials)

      // Salva token no localStorage
      token.value = response.token
      localStorage.setItem('auth_token', response.token)

      // Salva dados do usuário
      user.value = response.user

      // Redireciona para pagina inicial
      await router.push('/employees')
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
   * Realiza logout do usuário
   */
  async function logout(): Promise<void> {
    try {
      isLoading.value = true

      // Chama API de logout (se houver token)
      if (token.value) {
        await authService.logout()
      }
    } catch (error) {
      // Ignora erros no logout (pode já estar expirado)
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
   * Busca dados do usuário autenticado
   */
  async function fetchUser(): Promise<void> {
    try {
      isLoading.value = true
      const userData = await authService.me()
      user.value = userData
    } catch (error) {
      // Se falhar ao buscar usuário, limpa autenticação
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicializa o store - verifica se há token salvo
   */
  async function initialize(): Promise<void> {
    const savedToken = localStorage.getItem('auth_token')

    if (savedToken) {
      token.value = savedToken

      try {
        // Tenta buscar dados do usuário
        await fetchUser()
      } catch (error) {
        // Token inválido ou expirado
        console.error('Erro ao inicializar autenticação:', error)
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

    // Actions
    login,
    logout,
    fetchUser,
    initialize
  }
})

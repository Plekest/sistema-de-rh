import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * Instancia configurada do Axios para chamadas a API do backend
 *
 * - baseURL configurada via variavel de ambiente VITE_API_URL
 * - Interceptor de requisicao para adicionar token de autenticacao
 * - Interceptor de resposta para tratar erros 401 (logout automatico + redirect)
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

/**
 * URLs que nao devem disparar logout automatico ao receber 401.
 * Evita loop infinito quando a propria chamada de login retorna 401 (credenciais invalidas).
 */
const AUTH_URLS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password']

/**
 * Flag para evitar multiplos redirects simultaneos quando varias
 * chamadas recebem 401 ao mesmo tempo (ex: token expirado).
 */
let isLoggingOut = false

/**
 * Interceptor de requisicao - adiciona Authorization header se houver token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Interceptor de resposta - trata erros 401 (token expirado/invalido)
 *
 * Ao receber 401 em qualquer chamada que nao seja de autenticacao:
 * 1. Limpa token e dados do usuario no localStorage
 * 2. Redireciona para /login
 * 3. Usa flag isLoggingOut para evitar multiplos redirects simultaneos
 */
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const requestUrl = error.config?.url || ''
    const isAuthUrl = AUTH_URLS.some((url) => requestUrl.includes(url))

    // Trata 401 apenas para chamadas que NAO sao de autenticacao
    if (error.response?.status === 401 && !isAuthUrl && !isLoggingOut) {
      isLoggingOut = true

      // Limpa estado de autenticacao diretamente no localStorage
      // Nao importa o auth store aqui para evitar dependencia circular
      localStorage.removeItem('auth_token')

      // Redireciona para login. Usa import dinamico do router para evitar
      // dependencia circular (api.ts <- auth.service.ts <- auth store <- router)
      try {
        const { default: router } = await import('@/router')
        await router.push('/login')
      } catch (routerError) {
        // Fallback: reload da pagina caso o router falhe
        window.location.href = '/login'
      } finally {
        // Reseta a flag apos um pequeno delay para garantir que o redirect completou
        setTimeout(() => {
          isLoggingOut = false
        }, 1000)
      }
    }

    return Promise.reject(error)
  }
)

export default api

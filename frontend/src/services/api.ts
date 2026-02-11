import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

/**
 * Instância configurada do Axios para chamadas à API do backend
 *
 * - baseURL configurada via variável de ambiente VITE_API_URL
 * - Interceptor de requisição para adicionar token de autenticação
 * - Interceptor de resposta para tratar erros 401 (redirect para login)
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
 * Interceptor de requisição - adiciona Authorization header se houver token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Busca token do localStorage (ou sessionStorage)
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
 * Interceptor de resposta - trata erros globais
 */
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Token inválido ou expirado - redireciona para login
    if (error.response?.status === 401) {
      // Limpa token armazenado
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')

      // Redireciona para login apenas se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api

import { ref } from 'vue'
import type { AxiosError } from 'axios'

/**
 * Estrutura de erro de validacao retornada pela API (status 422)
 * Formato padrao do AdonisJS/VineJS: { message, errors: { campo: ['mensagem'] } }
 */
interface ValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Estrutura de erro generico retornada pela API
 */
interface ApiErrorResponse {
  message?: string
  error?: string
}

/**
 * Resultado do processamento de erro
 */
export interface ApiError {
  /** Mensagem amigavel principal para exibir ao usuario */
  message: string
  /** Erros de validacao por campo (quando status 422) */
  fieldErrors: Record<string, string[]>
  /** Status HTTP original (0 se erro de rede) */
  statusCode: number
  /** Indica se e um erro de rede (sem resposta do servidor) */
  isNetworkError: boolean
  /** Indica se e um erro de validacao (422) */
  isValidationError: boolean
}

/**
 * Mapeamento de status HTTP para mensagens amigaveis em portugues
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Requisicao invalida. Verifique os dados e tente novamente.',
  401: 'Sessao expirada. Faca login novamente.',
  403: 'Voce nao tem permissao para realizar esta acao.',
  404: 'O recurso solicitado nao foi encontrado.',
  408: 'A requisicao demorou muito. Tente novamente.',
  409: 'Conflito ao processar a requisicao. O registro pode ja existir.',
  413: 'O arquivo enviado e muito grande.',
  422: 'Existem erros de validacao nos dados enviados.',
  429: 'Muitas tentativas. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Servidor temporariamente indisponivel. Tente novamente.',
  503: 'Servico indisponivel no momento. Tente novamente mais tarde.',
}

/**
 * Composable para tratamento padronizado de erros de API
 *
 * Converte erros do Axios em mensagens amigaveis para o usuario,
 * trata erros de validacao (422), erros de rede e erros HTTP genericos.
 *
 * @example
 * ```ts
 * const { error, fieldErrors, handleError, clearError } = useApiError()
 *
 * async function save() {
 *   clearError()
 *   try {
 *     await api.post('/endpoint', data)
 *   } catch (err) {
 *     handleError(err)
 *   }
 * }
 * ```
 */
export function useApiError() {
  /** Mensagem de erro principal (string reativa para usar no template) */
  const error = ref<string>('')

  /** Erros de validacao por campo (objeto reativo para uso em formularios) */
  const fieldErrors = ref<Record<string, string[]>>({})

  /** Indica se ha um erro ativo */
  const hasError = ref<boolean>(false)

  /**
   * Processa um erro qualquer e retorna um objeto ApiError estruturado.
   * Funcao pura - nao altera estado reativo. Util para processamento customizado.
   */
  function parseError(err: unknown): ApiError {
    // Erro do Axios com resposta do servidor
    if (isAxiosError(err) && err.response) {
      const status = err.response.status
      const data = err.response.data as ApiErrorResponse & ValidationErrorResponse

      // Erro de validacao (422) - extrai erros por campo
      if (status === 422 && data.errors) {
        return {
          message: data.message || HTTP_ERROR_MESSAGES[422],
          fieldErrors: data.errors,
          statusCode: 422,
          isNetworkError: false,
          isValidationError: true,
        }
      }

      // Erro HTTP generico com mensagem do servidor
      const serverMessage = data.message || data.error
      const fallbackMessage = HTTP_ERROR_MESSAGES[status] || 'Ocorreu um erro inesperado.'

      return {
        message: serverMessage || fallbackMessage,
        fieldErrors: {},
        statusCode: status,
        isNetworkError: false,
        isValidationError: false,
      }
    }

    // Erro do Axios sem resposta (erro de rede, timeout, CORS)
    if (isAxiosError(err) && err.request) {
      // Timeout
      if (err.code === 'ECONNABORTED') {
        return {
          message: 'A requisicao demorou muito. Verifique sua conexao e tente novamente.',
          fieldErrors: {},
          statusCode: 0,
          isNetworkError: true,
          isValidationError: false,
        }
      }

      // Erro de rede generico
      return {
        message: 'Nao foi possivel conectar ao servidor. Verifique sua conexao com a internet.',
        fieldErrors: {},
        statusCode: 0,
        isNetworkError: true,
        isValidationError: false,
      }
    }

    // Erro JavaScript generico (Error, TypeError, etc.)
    if (err instanceof Error) {
      return {
        message: 'Ocorreu um erro inesperado. Tente novamente.',
        fieldErrors: {},
        statusCode: 0,
        isNetworkError: false,
        isValidationError: false,
      }
    }

    // Tipo desconhecido
    return {
      message: 'Ocorreu um erro desconhecido.',
      fieldErrors: {},
      statusCode: 0,
      isNetworkError: false,
      isValidationError: false,
    }
  }

  /**
   * Processa um erro e atualiza os refs reativos (error, fieldErrors, hasError).
   * Uso principal em catch blocks de chamadas API.
   *
   * @param err - Erro capturado no catch
   * @param fallbackMessage - Mensagem opcional para sobrescrever a mensagem padrao
   * @returns O objeto ApiError processado
   */
  function handleError(err: unknown, fallbackMessage?: string): ApiError {
    const parsed = parseError(err)

    error.value = fallbackMessage || parsed.message
    fieldErrors.value = parsed.fieldErrors
    hasError.value = true

    return parsed
  }

  /**
   * Retorna a mensagem de erro de um campo especifico (primeira mensagem).
   * Util para exibir erros inline em formularios.
   *
   * @param field - Nome do campo (ex: 'email', 'password')
   * @returns Primeira mensagem de erro do campo ou string vazia
   */
  function getFieldError(field: string): string {
    const errors = fieldErrors.value[field]
    return errors && errors.length > 0 ? errors[0] : ''
  }

  /**
   * Verifica se um campo especifico tem erro de validacao
   */
  function hasFieldError(field: string): boolean {
    return !!(fieldErrors.value[field] && fieldErrors.value[field].length > 0)
  }

  /**
   * Limpa todos os erros (mensagem, campo e flag)
   */
  function clearError() {
    error.value = ''
    fieldErrors.value = {}
    hasError.value = false
  }

  /**
   * Limpa erro de um campo especifico
   */
  function clearFieldError(field: string) {
    if (fieldErrors.value[field]) {
      const newErrors = { ...fieldErrors.value }
      delete newErrors[field]
      fieldErrors.value = newErrors

      // Se nao ha mais erros de campo e a mensagem e de validacao, limpa tudo
      if (Object.keys(fieldErrors.value).length === 0 && error.value === HTTP_ERROR_MESSAGES[422]) {
        clearError()
      }
    }
  }

  return {
    // Estado reativo
    error,
    fieldErrors,
    hasError,

    // Metodos
    handleError,
    parseError,
    getFieldError,
    hasFieldError,
    clearError,
    clearFieldError,
  }
}

/**
 * Type guard para verificar se um erro e do Axios
 */
function isAxiosError(err: unknown): err is AxiosError {
  return !!(err && typeof err === 'object' && 'isAxiosError' in err)
}

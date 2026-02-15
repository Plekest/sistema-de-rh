export interface AutomatedCommunication {
  id: number
  name: string
  triggerType:
    | 'birthday'
    | 'work_anniversary'
    | 'document_expiring'
    | 'probation_ending'
    | 'leave_returning'
    | 'onboarding_incomplete'
    | 'custom'
  triggerDaysBefore: number
  messageTemplate: string
  isActive: boolean
  targetRoles?: string[]
  lastExecutedAt?: string
  createdAt: string
}

export interface CommunicationLog {
  id: number
  communicationName?: string
  employeeName?: string
  message: string
  sentAt: string
  status: 'sent' | 'read' | 'failed'
}

export const TRIGGER_TYPE_LABELS: Record<string, string> = {
  birthday: 'Aniversário',
  work_anniversary: 'Aniversário de Empresa',
  document_expiring: 'Documento Vencendo',
  probation_ending: 'Fim de Experiência',
  leave_returning: 'Retorno de Férias',
  onboarding_incomplete: 'Onboarding Incompleto',
  custom: 'Personalizado',
}

export const TRIGGER_TYPE_COLORS: Record<string, string> = {
  birthday: '#ec4899',
  work_anniversary: '#3b82f6',
  document_expiring: '#f97316',
  probation_ending: '#eab308',
  leave_returning: '#22c55e',
  onboarding_incomplete: '#8b5cf6',
  custom: '#6b7280',
}

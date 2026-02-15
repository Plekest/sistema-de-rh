export interface OnboardingTemplate {
  id: number
  name: string
  type: 'onboarding' | 'offboarding'
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  itemsCount?: number
}

export interface OnboardingTemplateItem {
  id: number
  templateId: number
  title: string
  description: string | null
  responsible: 'hr' | 'manager' | 'it' | 'employee'
  dueInDays: number
  isRequired: boolean
  sortOrder: number
}

export interface OnboardingChecklist {
  id: number
  employeeId: number
  templateId: number
  type: 'onboarding' | 'offboarding'
  status: 'in_progress' | 'completed' | 'cancelled'
  startDate: string
  completedAt: string | null
  createdAt: string
  employee?: {
    id: number
    fullName: string
    department?: { id: number; name: string }
  }
  template?: {
    id: number
    name: string
  }
  items?: OnboardingChecklistItem[]
}

export interface OnboardingChecklistItem {
  id: number
  checklistId: number
  templateItemId: number
  title: string
  description: string | null
  responsible: 'hr' | 'manager' | 'it' | 'employee'
  dueDate: string
  completedAt: string | null
  status: 'pending' | 'completed' | 'skipped' | 'overdue'
  completedBy: number | null
  notes: string | null
  sortOrder: number
}

export interface CreateTemplateData {
  name: string
  type: 'onboarding' | 'offboarding'
  description?: string | null
  isActive?: boolean
}

export interface CreateTemplateItemData {
  title: string
  description?: string | null
  responsible: 'hr' | 'manager' | 'it' | 'employee'
  dueInDays: number
  isRequired: boolean
  sortOrder: number
}

export interface ChecklistFilters {
  page?: number
  limit?: number
  employeeId?: number
  status?: string
  type?: string
}

export const ONBOARDING_TYPE_LABELS: Record<string, string> = {
  onboarding: 'Integração',
  offboarding: 'Desligamento',
}

export const RESPONSIBLE_LABELS: Record<string, string> = {
  hr: 'RH',
  manager: 'Gestor',
  it: 'TI',
  employee: 'Colaborador',
}

export const CHECKLIST_STATUS_LABELS: Record<string, string> = {
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const ITEM_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  completed: 'Concluído',
  skipped: 'Pulado',
  overdue: 'Atrasado',
}

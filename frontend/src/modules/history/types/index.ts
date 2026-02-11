export interface HistoryEntry {
  id: number
  employeeId: number
  employee?: { id: number; fullName: string }
  type: HistoryEventType
  title: string
  description?: string
  oldValue?: string
  newValue?: string
  createdBy?: number
  createdByUser?: { id: number; fullName: string }
  eventDate: string
  createdAt: string
}

export type HistoryEventType =
  | 'hire'
  | 'promotion'
  | 'transfer'
  | 'salary_change'
  | 'warning'
  | 'note'
  | 'termination'
  | 'document'
  | 'other'

export interface HistoryFormData {
  employeeId: number
  type: HistoryEventType
  title: string
  description?: string
  oldValue?: string
  newValue?: string
  eventDate: string
}

export interface HistoryListParams {
  employeeId?: number | null
  type?: HistoryEventType | ''
  page?: number
  limit?: number
}

export const HISTORY_EVENT_TYPES: { value: HistoryEventType; label: string; color: string }[] = [
  { value: 'hire', label: 'Admissao', color: '#38a169' },
  { value: 'promotion', label: 'Promocao', color: '#3182ce' },
  { value: 'transfer', label: 'Transferencia', color: '#805ad5' },
  { value: 'salary_change', label: 'Alteracao Salarial', color: '#d69e2e' },
  { value: 'warning', label: 'Advertencia', color: '#dd6b20' },
  { value: 'note', label: 'Observacao', color: '#718096' },
  { value: 'termination', label: 'Desligamento', color: '#e53e3e' },
  { value: 'document', label: 'Documento', color: '#4a5568' },
  { value: 'other', label: 'Outro', color: '#a0aec0' },
]

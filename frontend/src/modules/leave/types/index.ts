export interface LeaveConfig {
  id: number
  leaveType: string
  label: string
  defaultDays: number
  requiresApproval: boolean
  requiresDocument: boolean
  isPaid: boolean
  isActive: boolean
}

export interface LeaveBalance {
  id: number
  employeeId: number
  accrualStartDate: string
  accrualEndDate: string
  totalDays: number
  usedDays: number
  soldDays: number
  remainingDays: number
  status: 'accruing' | 'available' | 'partially_used' | 'used' | 'expired'
  employee?: {
    id: number
    fullName: string
  }
}

export interface Leave {
  id: number
  employeeId: number
  leaveBalanceId: number | null
  type: 'vacation' | 'medical' | 'maternity' | 'paternity' | 'bereavement' | 'wedding' | 'blood_donation' | 'military' | 'other'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_progress' | 'completed'
  startDate: string
  endDate: string
  daysCount: number
  isPaid: boolean
  sellDays: number
  notes: string | null
  rejectionReason: string | null
  requestedBy: number | null
  approvedBy: number | null
  approvedAt: string | null
  createdAt: string
  employee?: {
    id: number
    fullName: string
    department?: { id: number; name: string }
  }
  approver?: {
    id: number
    fullName: string
  }
}

export interface CreateLeaveData {
  employeeId: number
  type: string
  startDate: string
  endDate: string
  daysCount: number
  isPaid?: boolean
  sellDays?: number
  leaveBalanceId?: number | null
  notes?: string | null
}

export interface LeaveFilters {
  page?: number
  limit?: number
  employeeId?: number
  type?: string
  status?: string
}

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Ferias',
  medical: 'Licenca Medica',
  maternity: 'Licenca Maternidade',
  paternity: 'Licenca Paternidade',
  bereavement: 'Licenca Luto',
  wedding: 'Licenca Casamento',
  blood_donation: 'Doacao de Sangue',
  military: 'Servico Militar',
  other: 'Outros',
}

export const LEAVE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
  in_progress: 'Em Andamento',
  completed: 'Concluida',
}

export interface OccupationalExam {
  id: number
  employeeId: number
  type: 'admission' | 'periodic' | 'dismissal' | 'return_to_work' | 'role_change'
  examDate: string
  expiryDate: string | null
  result: 'fit' | 'unfit' | 'fit_with_restrictions'
  restrictions: string | null
  doctorName: string | null
  crm: string | null
  clinicName: string | null
  asoDocumentPath: string | null
  status: 'scheduled' | 'completed' | 'expired' | 'cancelled'
  notes: string | null
  employee?: { id: number; fullName: string }
}

export interface MedicalCertificate {
  id: number
  employeeId: number
  startDate: string
  endDate: string
  daysCount: number
  cidCode: string | null
  cidDescription: string | null
  doctorName: string | null
  crm: string | null
  documentPath: string | null
  leaveId: number | null
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  employee?: { id: number; fullName: string }
}

export interface HealthDashboard {
  totalExams: number
  examsByType: Array<{ type: string; count: number }>
  examsByStatus: Array<{ status: string; count: number }>
  upcomingExams: OccupationalExam[]
  expiredExams: OccupationalExam[]
  certificatesByMonth: Array<{ month: number; year: number; count: number; totalDays: number }>
  avgDaysAbsent: number
}

export const EXAM_TYPE_LABELS: Record<OccupationalExam['type'], string> = {
  admission: 'Admissional',
  periodic: 'Periódico',
  dismissal: 'Demissional',
  return_to_work: 'Retorno ao Trabalho',
  role_change: 'Mudança de Função',
}

export const EXAM_STATUS_LABELS: Record<OccupationalExam['status'], string> = {
  scheduled: 'Agendado',
  completed: 'Realizado',
  expired: 'Vencido',
  cancelled: 'Cancelado',
}

export const EXAM_RESULT_LABELS: Record<OccupationalExam['result'], string> = {
  fit: 'Apto',
  unfit: 'Inapto',
  fit_with_restrictions: 'Apto com Restrições',
}

export const CERTIFICATE_STATUS_LABELS: Record<MedicalCertificate['status'], string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

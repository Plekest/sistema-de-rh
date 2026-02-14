export interface Training {
  id: number
  title: string
  description: string | null
  type: 'online' | 'presential' | 'hybrid'
  category: string | null
  instructor: string | null
  provider: string | null
  startDate: string
  endDate: string
  durationHours: number
  maxParticipants: number | null
  location: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  isMandatory: boolean
  createdBy: number | null
  notes: string | null
  enrollments?: TrainingEnrollment[]
  enrollmentCount?: number
  createdAt: string
  updatedAt: string
}

export interface TrainingEnrollment {
  id: number
  trainingId: number
  employeeId: number
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  enrolledAt: string
  completedAt: string | null
  score: number | null
  certificateUrl: string | null
  feedback: string | null
  feedbackRating: number | null
  employee?: { id: number; fullName: string; email: string }
}

export interface TrainingFilters {
  page?: number
  limit?: number
  status?: string
  type?: string
  category?: string
  search?: string
}

export interface TrainingStats {
  total: number
  inProgress: number
  completed: number
  completionRate: number
}

export interface CreateTrainingData {
  title: string
  description?: string | null
  type: 'online' | 'presential' | 'hybrid'
  category?: string | null
  instructor?: string | null
  provider?: string | null
  startDate: string
  endDate: string
  durationHours: number
  maxParticipants?: number | null
  location?: string | null
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  isMandatory?: boolean
  notes?: string | null
}

export interface UpdateTrainingData extends Partial<CreateTrainingData> {}

export interface EnrollEmployeeData {
  employeeId: number
}

export interface BulkEnrollData {
  employeeIds: number[]
}

export interface UpdateEnrollmentData {
  status?: 'enrolled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  score?: number | null
  certificateUrl?: string | null
  feedback?: string | null
  feedbackRating?: number | null
}

export const TRAINING_TYPE_LABELS: Record<string, string> = {
  online: 'Online',
  presential: 'Presencial',
  hybrid: 'Hibrido',
}

export const TRAINING_STATUS_LABELS: Record<string, string> = {
  planned: 'Planejado',
  in_progress: 'Em Andamento',
  completed: 'Concluido',
  cancelled: 'Cancelado',
}

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  enrolled: 'Inscrito',
  in_progress: 'Em Andamento',
  completed: 'Concluido',
  cancelled: 'Cancelado',
  no_show: 'Falta',
}

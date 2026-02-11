export interface JobRequisition {
  id: number
  title: string
  departmentId: number
  positionId: number | null
  requestedBy: number
  approvedBy: number | null
  salaryRangeMin: number | null
  salaryRangeMax: number | null
  employmentType: 'clt' | 'pj'
  workModel: 'onsite' | 'hybrid' | 'remote'
  headcount: number
  description: string | null
  requirements: string | null
  status: 'pending_approval' | 'approved' | 'open' | 'filled' | 'cancelled'
  approvedAt: string | null
  closedAt: string | null
  createdAt: string
  department?: { id: number; name: string }
  position?: { id: number; title: string }
  candidates?: Candidate[]
}

export interface RecruitmentStage {
  id: number
  name: string
  displayOrder: number
  isDefault: boolean
  isActive: boolean
}

export interface Candidate {
  id: number
  jobRequisitionId: number
  name: string
  email: string
  phone: string | null
  linkedinUrl: string | null
  salaryExpectation: number | null
  resumePath: string | null
  source: 'referral' | 'linkedin' | 'website' | 'agency' | 'other'
  currentStageId: number | null
  status: 'active' | 'hired' | 'rejected' | 'withdrawn'
  notes: string | null
  createdAt: string
  jobRequisition?: JobRequisition
  currentStage?: RecruitmentStage
  stageHistory?: CandidateStageHistory[]
  interviews?: Interview[]
}

export interface CandidateStageHistory {
  id: number
  candidateId: number
  stageId: number
  movedBy: number
  feedback: string | null
  score: number | null
  enteredAt: string
  leftAt: string | null
  stage?: RecruitmentStage
}

export interface Interview {
  id: number
  candidateId: number
  interviewerId: number
  stageId: number | null
  scheduledAt: string
  durationMinutes: number
  location: string | null
  meetingLink: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  feedback: string | null
  score: number | null
  createdAt: string
  interviewer?: { id: number; fullName: string }
  stage?: RecruitmentStage
}

// Create/Update DTOs
export interface CreateJobRequisitionData {
  title: string
  departmentId: number
  positionId?: number | null
  salaryRangeMin?: number | null
  salaryRangeMax?: number | null
  employmentType: 'clt' | 'pj'
  workModel: 'onsite' | 'hybrid' | 'remote'
  headcount: number
  description?: string | null
  requirements?: string | null
}

export interface UpdateJobRequisitionData extends Partial<CreateJobRequisitionData> {}

export interface CreateCandidateData {
  jobRequisitionId: number
  name: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  salaryExpectation?: number | null
  resumePath?: string | null
  source: 'referral' | 'linkedin' | 'website' | 'agency' | 'other'
  notes?: string | null
}

export interface UpdateCandidateData extends Partial<CreateCandidateData> {}

export interface MoveCandidateData {
  stageId: number
  feedback?: string
  score?: number
}

export interface RejectCandidateData {
  feedback?: string
}

export interface CreateInterviewData {
  candidateId: number
  interviewerId: number
  stageId?: number | null
  scheduledAt: string
  durationMinutes: number
  location?: string | null
  meetingLink?: string | null
}

export interface UpdateInterviewData extends Partial<Omit<CreateInterviewData, 'candidateId'>> {}

export interface CompleteInterviewData {
  feedback: string
  score: number
}

// Filters
export interface JobRequisitionFilters {
  status?: string
  departmentId?: number
  employmentType?: string
  page?: number
  limit?: number
}

export interface CandidateFilters {
  jobRequisitionId?: number
  status?: string
  stageId?: number
  search?: string
  page?: number
  limit?: number
}

// Labels
export const REQUISITION_STATUS_LABELS: Record<string, string> = {
  pending_approval: 'Aguardando Aprovacao',
  approved: 'Aprovada',
  open: 'Aberta',
  filled: 'Preenchida',
  cancelled: 'Cancelada',
}

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  clt: 'CLT',
  pj: 'PJ',
}

export const WORK_MODEL_LABELS: Record<string, string> = {
  onsite: 'Presencial',
  hybrid: 'Hibrido',
  remote: 'Remoto',
}

export const CANDIDATE_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  hired: 'Contratado',
  rejected: 'Rejeitado',
  withdrawn: 'Desistiu',
}

export const CANDIDATE_SOURCE_LABELS: Record<string, string> = {
  referral: 'Indicacao',
  linkedin: 'LinkedIn',
  website: 'Site',
  agency: 'Agencia',
  other: 'Outro',
}

export const INTERVIEW_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
  no_show: 'Nao Compareceu',
}

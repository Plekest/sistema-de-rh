// Tipos de ciclo
export type CycleType = 'semestral' | 'anual'
export type CycleStatus = 'draft' | 'self_eval' | 'manager_eval' | 'calibration' | 'closed'

// Tipos de competencia
export type CompetencyCategory = 'technical' | 'behavioral' | 'leadership'

// Tipos de meta
export type GoalStatus = 'pending' | 'in_progress' | 'achieved' | 'not_achieved'

// Tipos de avaliacao
export type EvaluationType = 'self' | 'manager'
export type EvaluationStatus = 'pending' | 'in_progress' | 'completed'

// Tipos de PDI
export type PDIStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

// Labels em portugues
export const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
  draft: 'Rascunho',
  self_eval: 'Autoavaliacao',
  manager_eval: 'Avaliacao Gestor',
  calibration: 'Calibracao',
  closed: 'Encerrado',
}

export const CYCLE_TYPE_LABELS: Record<CycleType, string> = {
  semestral: 'Semestral',
  anual: 'Anual',
}

export const COMPETENCY_CATEGORY_LABELS: Record<CompetencyCategory, string> = {
  technical: 'Tecnica',
  behavioral: 'Comportamental',
  leadership: 'Lideranca',
}

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  achieved: 'Atingida',
  not_achieved: 'Nao Atingida',
}

export const EVALUATION_TYPE_LABELS: Record<EvaluationType, string> = {
  self: 'Autoavaliacao',
  manager: 'Gestor',
}

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluida',
}

export const PDI_STATUS_LABELS: Record<PDIStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluido',
  cancelled: 'Cancelado',
}

// Interfaces principais
export interface Competency {
  id: number
  name: string
  description: string
  category: CompetencyCategory
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CycleCompetency {
  id: number
  cycleId: number
  competencyId: number
  weight: number
  competency?: Competency
}

export interface PerformanceCycle {
  id: number
  name: string
  type: CycleType
  status: CycleStatus
  startDate: string
  endDate: string
  selfEvalDeadline: string
  managerEvalDeadline: string
  createdBy: number
  createdAt: string
  updatedAt?: string
  cycleCompetencies?: CycleCompetency[]
}

export interface IndividualGoal {
  id: number
  cycleId: number
  employeeId: number
  title: string
  description: string
  weight: number
  targetValue?: string | null
  achievedValue?: string | null
  status: GoalStatus
  createdAt?: string
  updatedAt?: string
  employee?: {
    id: number
    fullName: string
    position?: { name: string }
  }
  cycle?: {
    id: number
    name: string
  }
}

export interface EvaluationScore {
  id: number
  evaluationId: number
  competencyId: number
  score: number
  comments?: string
  competency?: Competency
}

export interface Evaluation {
  id: number
  cycleId: number
  employeeId: number
  evaluatorId: number
  type: EvaluationType
  status: EvaluationStatus
  overallScore?: number
  comments?: string
  completedAt?: string
  createdAt?: string
  updatedAt?: string
  employee?: {
    id: number
    fullName: string
    position?: { name: string }
  }
  evaluator?: {
    id: number
    fullName: string
  }
  scores?: EvaluationScore[]
}

export interface DevelopmentPlan {
  id: number
  employeeId: number
  cycleId?: number
  action: string
  description: string
  responsibleId: number
  deadline: string
  status: PDIStatus
  createdAt?: string
  updatedAt?: string
  employee?: {
    id: number
    fullName: string
  }
  cycle?: {
    id: number
    name: string
  }
  responsible?: {
    id: number
    fullName: string
  }
}

// Dados de criacao/atualizacao
export interface CreateCycleData {
  name: string
  type: CycleType
  startDate: string
  endDate: string
  selfEvalDeadline: string
  managerEvalDeadline: string
}

export interface UpdateCycleData {
  name?: string
  selfEvalDeadline?: string
  managerEvalDeadline?: string
}

export interface CreateCompetencyData {
  name: string
  description: string
  category: CompetencyCategory
}

export interface UpdateCompetencyData {
  name?: string
  description?: string
  category?: CompetencyCategory
  isActive?: boolean
}

export interface CreateGoalData {
  cycleId: number
  employeeId: number
  title: string
  description: string
  weight: number
  targetValue?: string | null
}

export interface UpdateGoalData {
  title?: string
  description?: string
  weight?: number
  targetValue?: string | null
  achievedValue?: string | null
  status?: GoalStatus
}

export interface CreateEvaluationData {
  cycleId: number
  employeeId: number
  type: EvaluationType
}

export interface SubmitEvaluationData {
  scores: Array<{
    competencyId: number
    score: number
    comments?: string
  }>
  overallScore: number
  comments?: string
}

export interface CreateDevelopmentPlanData {
  employeeId: number
  cycleId?: number
  action: string
  description: string
  responsibleId: number
  deadline: string
}

export interface UpdateDevelopmentPlanData {
  action?: string
  description?: string
  responsibleId?: number
  deadline?: string
  status?: PDIStatus
}

// Filtros
export interface CycleFilters {
  page?: number
  limit?: number
  status?: CycleStatus
  year?: number
}

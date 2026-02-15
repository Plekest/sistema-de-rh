export interface Survey {
  id: number
  title: string
  description: string | null
  type: 'climate' | 'satisfaction' | 'enps' | 'custom'
  isAnonymous: boolean
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'closed'
  targetDepartments: number[] | null
  createdAt: string
  createdBy: number
  totalResponses?: number
  totalEmployees?: number
  responseRate?: number
}

export interface SurveyQuestion {
  id: number
  surveyId: number
  questionText: string
  questionType: 'scale' | 'multiple_choice' | 'text' | 'yes_no' | 'enps'
  options: string[] | null
  isRequired: boolean
  sortOrder: number
}

export interface SurveyResponse {
  id: number
  surveyId: number
  employeeId: number | null
  completedAt: string
  answers: SurveyAnswer[]
}

export interface SurveyAnswer {
  id: number
  responseId: number
  questionId: number
  answerValue: string | number | null
  answerText: string | null
}

export interface CreateSurveyData {
  title: string
  description?: string | null
  type: 'climate' | 'satisfaction' | 'enps' | 'custom'
  isAnonymous: boolean
  startDate: string
  endDate: string
  targetDepartments?: number[] | null
  questions: CreateQuestionData[]
}

export interface CreateQuestionData {
  questionText: string
  questionType: 'scale' | 'multiple_choice' | 'text' | 'yes_no' | 'enps'
  options?: string[] | null
  isRequired: boolean
  sortOrder: number
}

export interface SurveyResults {
  survey: Survey
  totalResponses: number
  responseRate: number
  questionResults: QuestionResult[]
}

export interface QuestionResult {
  question: SurveyQuestion
  totalAnswers: number
  scaleAverage?: number
  enpsScore?: number
  distribution?: Record<string, number>
  textAnswers?: string[]
}

export const SURVEY_TYPE_LABELS: Record<string, string> = {
  climate: 'Pesquisa de Clima',
  satisfaction: 'Satisfação',
  enps: 'eNPS',
  custom: 'Personalizada',
}

export const SURVEY_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  closed: 'Encerrada',
}

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  scale: 'Escala 1-5',
  multiple_choice: 'Múltipla Escolha',
  text: 'Texto Livre',
  yes_no: 'Sim/Não',
  enps: 'eNPS (0-10)',
}

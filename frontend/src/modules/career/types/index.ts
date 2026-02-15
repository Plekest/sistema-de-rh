export interface CareerPath {
  id: number
  name: string
  description: string | null
  departmentId: number | null
  isActive: boolean
  levels?: CareerPathLevel[]
  department?: { id: number; name: string }
}

export interface CareerPathLevel {
  id: number
  careerPathId: number
  positionId: number | null
  levelOrder: number
  title: string
  description: string | null
  minExperienceMonths: number | null
  requiredSkills: Array<{ skillId: number; minLevel: number }> | null
  salaryRangeMin: number | null
  salaryRangeMax: number | null
  position?: { id: number; title: string }
}

export interface SuccessionPlan {
  id: number
  positionId: number
  currentHolderId: number | null
  successorId: number | null
  readiness: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'development_needed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  developmentActions: string | null
  notes: string | null
  position?: { id: number; title: string }
  currentHolder?: { id: number; fullName: string }
  successor?: { id: number; fullName: string }
}

export interface EmployeeCareerPlan {
  employee: { id: number; fullName: string }
  currentPath?: CareerPath
  currentLevel?: CareerPathLevel
  nextLevel?: CareerPathLevel
  skillsGap: Array<{ skillName: string; currentLevel: number; requiredLevel: number }>
}

export const READINESS_LABELS: Record<SuccessionPlan['readiness'], string> = {
  ready_now: 'Pronto Agora',
  ready_1_year: 'Pronto em 1 Ano',
  ready_2_years: 'Pronto em 2 Anos',
  development_needed: 'Precisa Desenvolvimento',
}

export const PRIORITY_LABELS: Record<SuccessionPlan['priority'], string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

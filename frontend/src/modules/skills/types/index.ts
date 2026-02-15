export interface SkillCategory {
  id: number
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  skills?: Skill[]
}

export interface Skill {
  id: number
  categoryId: number
  name: string
  description: string | null
  levelDescriptors: Record<string, string> | null
  isActive: boolean
  category?: SkillCategory
}

export interface EmployeeSkill {
  id: number
  employeeId: number
  skillId: number
  currentLevel: number
  targetLevel: number | null
  assessedBy: number | null
  assessedAt: string | null
  notes: string | null
  skill?: Skill
  employee?: {
    id: number
    fullName: string
  }
}

export interface SkillGapReport {
  employeeId: number
  employeeName: string
  skills: Array<{
    skill: Skill
    currentLevel: number
    targetLevel: number | null
    gap: number
  }>
}

export interface DepartmentSkillMatrix {
  department: { id: number; name: string }
  employees: Array<{
    id: number
    name: string
    skills: EmployeeSkill[]
  }>
  skills: Skill[]
}

export interface CreateSkillCategoryData {
  name: string
  description?: string
  displayOrder?: number
  isActive?: boolean
}

export interface CreateSkillData {
  categoryId: number
  name: string
  description?: string
  levelDescriptors?: Record<string, string>
  isActive?: boolean
}

export interface AssessSkillData {
  employeeId: number
  skillId: number
  currentLevel: number
  targetLevel?: number
  notes?: string
}

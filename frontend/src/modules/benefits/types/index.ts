export interface Benefit {
  id: number
  name: string
  type: 'vt' | 'vr' | 'va' | 'health' | 'dental' | 'life_insurance' | 'daycare' | 'gym' | 'other'
  description: string | null
  provider: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  plans?: BenefitPlan[]
}

export interface BenefitPlan {
  id: number
  benefitId: number
  name: string
  monthlyValue: number
  employeeDiscountValue: number | null
  employeeDiscountPercentage: number | null
  eligibilityRules: Record<string, any> | null
  isActive: boolean
  createdAt: string
  benefit?: Benefit
}

export interface EmployeeBenefit {
  id: number
  employeeId: number
  benefitPlanId: number
  enrollmentDate: string
  cancellationDate: string | null
  status: 'active' | 'cancelled' | 'suspended'
  notes: string | null
  createdAt: string
  employee?: {
    id: number
    fullName: string
  }
  benefitPlan?: BenefitPlan & {
    benefit?: Benefit
  }
  dependents?: BenefitDependent[]
}

export interface BenefitDependent {
  id: number
  employeeBenefitId: number
  name: string
  cpf: string | null
  birthDate: string | null
  relationship: 'spouse' | 'child' | 'parent' | 'other'
  createdAt: string
}

export interface CreateBenefitData {
  name: string
  type: string
  description?: string | null
  provider?: string | null
  isActive?: boolean
}

export interface CreatePlanData {
  benefitId: number
  name: string
  monthlyValue: number
  employeeDiscountValue?: number | null
  employeeDiscountPercentage?: number | null
  eligibilityRules?: Record<string, any> | null
  isActive?: boolean
}

export interface EnrollEmployeeData {
  employeeId: number
  benefitPlanId: number
  enrollmentDate: string
  notes?: string | null
}

export interface AddDependentData {
  name: string
  cpf?: string | null
  birthDate?: string | null
  relationship: 'spouse' | 'child' | 'parent' | 'other'
}

export interface BenefitFilters {
  page?: number
  limit?: number
  type?: string
  isActive?: boolean
}

export const BENEFIT_TYPE_LABELS: Record<string, string> = {
  vt: 'Vale Transporte',
  vr: 'Vale Refeicao',
  va: 'Vale Alimentacao',
  health: 'Plano de Saude',
  dental: 'Plano Odontologico',
  life_insurance: 'Seguro de Vida',
  daycare: 'Auxilio Creche',
  gym: 'Auxilio Academia',
  other: 'Outros',
}

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  cancelled: 'Cancelado',
  suspended: 'Suspenso',
}

export const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: 'Conjuge',
  child: 'Filho(a)',
  parent: 'Pai/Mae',
  other: 'Outros',
}

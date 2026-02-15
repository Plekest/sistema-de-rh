export interface TalentPoolEntry {
  id: number
  fullName: string
  email: string
  phone?: string
  linkedinUrl?: string
  source: 'recruitment' | 'referral' | 'spontaneous' | 'linkedin' | 'event' | 'other'
  status: 'active' | 'contacted' | 'interviewing' | 'hired' | 'archived'
  notes?: string
  experienceYears?: number
  salaryExpectation?: number
  availability?: string
  tags: TalentPoolTag[]
  createdAt: string
}

export interface TalentPoolTag {
  id: number
  name: string
  color?: string
}

export interface CreateTalentPoolEntryData {
  fullName: string
  email: string
  phone?: string
  linkedinUrl?: string
  source: 'recruitment' | 'referral' | 'spontaneous' | 'linkedin' | 'event' | 'other'
  notes?: string
  experienceYears?: number
  salaryExpectation?: number
  availability?: string
  tagIds?: number[]
}

export interface UpdateTalentPoolEntryData extends Partial<CreateTalentPoolEntryData> {
  status?: 'active' | 'contacted' | 'interviewing' | 'hired' | 'archived'
}

export interface TalentPoolFilters {
  status?: string
  source?: string
  tagIds?: number[]
  search?: string
  page?: number
  limit?: number
}

export const TALENT_POOL_SOURCE_LABELS: Record<string, string> = {
  recruitment: 'Recrutamento',
  referral: 'Indicacao',
  spontaneous: 'Espontaneo',
  linkedin: 'LinkedIn',
  event: 'Evento',
  other: 'Outro',
}

export const TALENT_POOL_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  contacted: 'Contatado',
  interviewing: 'Em Entrevista',
  hired: 'Contratado',
  archived: 'Arquivado',
}

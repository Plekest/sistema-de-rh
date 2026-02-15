export interface LifecycleEvent {
  date: string
  type: string
  title: string
  description: string
  source: 'history' | 'leave' | 'training' | 'evaluation' | 'onboarding' | 'turnover'
  metadata?: Record<string, any>
}

export interface LifecycleSummary {
  tenureMonths: number
  totalPromotions: number
  totalTrainings: number
  engagementScore?: number
  onboardingStatus?: string
}

export interface LifecycleFilters {
  from?: string
  to?: string
  types?: string[]
}

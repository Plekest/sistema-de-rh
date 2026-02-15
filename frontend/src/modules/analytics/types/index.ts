export interface WorkforceOverview {
  totalEmployees: number
  byDepartment: Array<{ department: string; count: number }>
  byType: Array<{ type: string; count: number }>
  byStatus: Array<{ status: string; count: number }>
  avgAge: number | null
  avgTenureMonths: number | null
}

export interface RetentionAnalysis {
  turnoverRate: number
  voluntaryRate: number
  involuntaryRate: number
  byDepartment: Array<{ department: string; rate: number }>
  byTenureRange: Array<{ range: string; count: number }>
}

export interface PerformanceOverview {
  avgScore: number
  distribution: Array<{ score: number; count: number }>
  topPerformers: Array<{ employeeId: number; employeeName: string; score: number }>
  bottomPerformers: Array<{ employeeId: number; employeeName: string; score: number }>
}

export interface TrainingOverview {
  totalHours: number
  avgHoursPerEmployee: number
  completionRate: number
  byCategory: Array<{ category: string; hours: number; count: number }>
}

export interface EngagementOverview {
  avgScore: number
  distribution: Array<{ scoreRange: string; count: number }>
  byDepartment: Array<{ department: string; score: number }>
  trend: Array<{ month: string; score: number }>
}

export interface CompensationAnalysis {
  avgSalary: number
  medianSalary: number
  byDepartment: Array<{ department: string; avg: number; median: number; count: number }>
  byPosition: Array<{ position: string; avg: number; median: number; count: number }>
  payEquityIndex: number
}

export interface PredictiveInsights {
  attritionRisk: Array<{
    employee: { id: number; fullName: string }
    riskScore: number
    reasons: string[]
  }>
  upcomingExamExpirations: Array<{
    employee: { id: number; fullName: string }
    examType: string
    expiryDate: string
  }>
  leaveBalanceWarnings: Array<{
    employee: { id: number; fullName: string }
    warning: string
  }>
}

export interface AnalyticsSnapshot {
  id: number
  createdAt: string
  period: string
  data: Record<string, any>
}

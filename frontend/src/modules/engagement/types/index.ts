export interface EngagementScore {
  id: number
  employeeId: number
  score: number
  attendanceScore?: number
  performanceScore?: number
  trainingScore?: number
  tenureScore?: number
  leaveScore?: number
  referenceMonth: number
  referenceYear: number
}

export interface EngagementRanking {
  employeeId: number
  employeeName: string
  departmentName?: string
  score: number
}

export interface DepartmentAverage {
  departmentId: number
  departmentName: string
  averageScore: number
  employeeCount: number
}

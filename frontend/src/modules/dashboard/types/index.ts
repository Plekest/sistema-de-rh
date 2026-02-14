export interface AdminDashboard {
  totalEmployees: number
  activeEmployees: number
  departmentsCount: number
  employeesByType: { clt: number; pj: number }
  employeesByStatus: { active: number; inactive: number; terminated: number }
  departmentDistribution: { departmentName: string; count: number }[]
  pendingLeaves: number
  upcomingLeaves: {
    id: number
    employeeName: string
    department: string
    type: string
    startDate: string
    endDate: string
    daysCount: number
  }[]
  recentHires: {
    id: number
    fullName: string
    hireDate: string
    department: string
    position: string
  }[]
  todayAttendance: {
    present: number
    absent: number
    late: number
  }
  monthlyPayroll: {
    totalGross: number
    totalNet: number
    processed: boolean
  }
  notifications: {
    unread: number
  }
}

export interface EmployeeDashboard {
  employee: {
    id: number
    fullName: string
    department: string
    position: string
    hireDate: string
    type: string
    email: string
  }
  myLeaves: { pending: number; approved: number; total: number }
  upcomingLeaves: {
    id: number
    type: string
    status: string
    startDate: string
    endDate: string
    daysCount: number
  }[]
  myBenefits: number
  lastPaySlip: {
    id: number
    month: number
    year: number
    netSalary: number
    grossSalary: number
  } | null
  recentHistory: {
    id: number
    type: string
    title: string
    eventDate: string
  }[]
  attendanceThisMonth: {
    days: number
    hoursTotal: string
  }
}

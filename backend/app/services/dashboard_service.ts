import { DateTime } from 'luxon'
import Employee from '#models/employee'
import Leave from '#models/leave'
import PayrollPeriod from '#models/payroll_period'
import PaySlip from '#models/pay_slip'
import EmployeeBenefit from '#models/employee_benefit'
import EmployeeHistory from '#models/employee_history'
import TimeEntry from '#models/time_entry'
import Database from '@adonisjs/lucid/services/db'
import { toNumber } from '#utils/number_helper'

export default class DashboardService {
  async getAdminDashboard() {
    const now = DateTime.now()
    const thirtyDaysFromNow = now.plus({ days: 30 })

    // Total active employees
    const totalEmployees = await Employee.query().where('status', 'active').count('* as total')
    const totalEmployeesCount = toNumber(totalEmployees[0].$extras.total)

    // Employees by type
    const employeesByTypeData = await Employee.query()
      .where('status', 'active')
      .groupBy('type')
      .select('type')
      .count('* as count')

    const employeesByType = {
      clt: 0,
      pj: 0,
    }
    employeesByTypeData.forEach((row) => {
      employeesByType[row.type as 'clt' | 'pj'] = toNumber(row.$extras.count)
    })

    // Employees by status
    const employeesByStatusData = await Employee.query()
      .groupBy('status')
      .select('status')
      .count('* as count')

    const employeesByStatus = {
      active: 0,
      inactive: 0,
      terminated: 0,
    }
    employeesByStatusData.forEach((row) => {
      employeesByStatus[row.status as 'active' | 'inactive' | 'terminated'] = toNumber(
        row.$extras.count
      )
    })

    // Department distribution
    const departmentDistributionData = await Database.from('employees')
      .innerJoin('departments', 'employees.department_id', 'departments.id')
      .where('employees.status', 'active')
      .groupBy('departments.id', 'departments.name')
      .select('departments.name as departmentName')
      .count('* as count')
      .orderBy('count', 'desc')

    const departmentDistribution = departmentDistributionData.map((row) => ({
      departmentName: row.departmentName,
      count: toNumber(row.count),
    }))

    // Pending leaves count
    const pendingLeavesData = await Leave.query().where('status', 'pending').count('* as total')
    const pendingLeaves = toNumber(pendingLeavesData[0].$extras.total)

    // Upcoming leaves (approved leaves starting in the next 30 days)
    const upcomingLeavesData = await Leave.query()
      .whereIn('status', ['approved', 'in_progress'])
      .whereBetween('start_date', [now.toSQLDate()!, thirtyDaysFromNow.toSQLDate()!])
      .preload('employee', (query) => {
        query.preload('department')
      })
      .orderBy('start_date', 'asc')
      .limit(10)

    const upcomingLeaves = upcomingLeavesData.map((leave) => ({
      id: leave.id,
      employeeName: leave.employee.fullName,
      department: leave.employee.department?.name || 'N/A',
      type: leave.type,
      startDate: leave.startDate.toFormat('yyyy-MM-dd'),
      endDate: leave.endDate.toFormat('yyyy-MM-dd'),
      daysCount: leave.daysCount,
    }))

    // Recent hires (last 5 employees hired)
    const recentHiresData = await Employee.query()
      .where('status', 'active')
      .preload('department')
      .preload('position')
      .orderBy('hire_date', 'desc')
      .limit(5)

    const recentHires = recentHiresData.map((employee) => ({
      id: employee.id,
      fullName: employee.fullName,
      hireDate: employee.hireDate.toFormat('yyyy-MM-dd'),
      department: employee.department?.name || 'N/A',
      position: employee.position?.title || 'N/A',
    }))

    // Total payroll from most recent closed period
    let totalPayroll = 0
    const lastClosedPeriod = await PayrollPeriod.query()
      .where('status', 'closed')
      .orderBy('reference_year', 'desc')
      .orderBy('reference_month', 'desc')
      .first()

    if (lastClosedPeriod) {
      const payrollSum = await PaySlip.query()
        .where('payroll_period_id', lastClosedPeriod.id)
        .sum('net_salary as total')

      totalPayroll = toNumber(payrollSum[0].$extras.total)
    }

    // Attendance today - contagem de presentes, ausentes e atrasados
    const today = now.toSQLDate()!
    const presentData = await TimeEntry.query()
      .where('date', today)
      .whereNotNull('clock_in')
      .countDistinct('employee_id as total')
    const present = toNumber(presentData[0].$extras.total)

    const lateData = await TimeEntry.query()
      .where('date', today)
      .whereNotNull('clock_in')
      .where('is_late', true)
      .countDistinct('employee_id as total')
    const late = toNumber(lateData[0].$extras.total)

    const absent = totalEmployeesCount - present

    // Count departments
    const departmentsData = await Database.from('departments').count('* as total')
    const departmentsCount = toNumber(departmentsData[0].total)

    // Unread notifications count (assumindo que existe uma tabela notifications)
    let unreadNotifications = 0
    try {
      const notificationsData = await Database.from('notifications')
        .where('is_read', false)
        .count('* as total')
      unreadNotifications = toNumber(notificationsData[0].total)
    } catch (_error) {
      // Se tabela nao existir, retorna 0
    }

    return {
      totalEmployees: totalEmployeesCount,
      activeEmployees: totalEmployeesCount,
      departmentsCount,
      employeesByType,
      employeesByStatus,
      departmentDistribution,
      pendingLeaves,
      upcomingLeaves,
      recentHires,
      todayAttendance: {
        present,
        absent,
        late,
      },
      monthlyPayroll: {
        totalGross: totalPayroll,
        totalNet: totalPayroll,
        processed: totalPayroll > 0,
      },
      notifications: {
        unread: unreadNotifications,
      },
    }
  }

  async getEmployeeDashboard(employeeId: number) {
    const employee = await Employee.findOrFail(employeeId)
    await employee.load('department')
    await employee.load('position')

    const now = DateTime.now()
    const sixtyDaysFromNow = now.plus({ days: 60 })
    const startOfMonth = now.startOf('month')
    const endOfMonth = now.endOf('month')

    // My leaves summary
    const myLeavesData = await Leave.query()
      .where('employee_id', employeeId)
      .whereIn('type', ['vacation', 'medical', 'maternity', 'paternity', 'other'])
      .groupBy('status')
      .select('status')
      .count('* as count')

    const myLeaves = {
      pending: 0,
      approved: 0,
      total: 0,
    }

    myLeavesData.forEach((row) => {
      const count = toNumber(row.$extras.count)
      if (row.status === 'pending') {
        myLeaves.pending = count
      } else if (row.status === 'approved' || row.status === 'in_progress') {
        myLeaves.approved += count
      }
      myLeaves.total += count
    })

    // Upcoming leaves (approved/pending in next 60 days)
    const upcomingLeavesData = await Leave.query()
      .where('employee_id', employeeId)
      .whereIn('status', ['pending', 'approved', 'in_progress'])
      .whereBetween('start_date', [now.toSQLDate()!, sixtyDaysFromNow.toSQLDate()!])
      .orderBy('start_date', 'asc')

    const upcomingLeaves = upcomingLeavesData.map((leave) => ({
      id: leave.id,
      type: leave.type,
      status: leave.status,
      startDate: leave.startDate.toFormat('yyyy-MM-dd'),
      endDate: leave.endDate.toFormat('yyyy-MM-dd'),
      daysCount: leave.daysCount,
    }))

    // My active benefits count
    const myBenefitsData = await EmployeeBenefit.query()
      .where('employee_id', employeeId)
      .where('status', 'active')
      .count('* as total')

    const myBenefits = toNumber(myBenefitsData[0].$extras.total)

    // Last pay slip
    let lastPaySlip = null
    const lastPaySlipData = await PaySlip.query()
      .where('employee_id', employeeId)
      .preload('period')
      .orderBy('created_at', 'desc')
      .first()

    if (lastPaySlipData) {
      lastPaySlip = {
        id: lastPaySlipData.id,
        month: lastPaySlipData.period.referenceMonth,
        year: lastPaySlipData.period.referenceYear,
        netSalary: lastPaySlipData.netSalary,
        grossSalary: lastPaySlipData.grossSalary,
      }
    }

    // Recent history (last 5 entries)
    const recentHistoryData = await EmployeeHistory.query()
      .where('employee_id', employeeId)
      .orderBy('event_date', 'desc')
      .limit(5)

    const recentHistory = recentHistoryData.map((history) => ({
      id: history.id,
      type: history.type,
      title: history.title,
      eventDate: history.eventDate.toFormat('yyyy-MM-dd'),
    }))

    // Attendance this month
    const attendanceThisMonthData = await TimeEntry.query()
      .where('employee_id', employeeId)
      .whereBetween('date', [startOfMonth.toSQLDate()!, endOfMonth.toSQLDate()!])
      .whereNotNull('clock_in')
      .select('*')

    const days = attendanceThisMonthData.length
    const totalMinutes = attendanceThisMonthData.reduce(
      (sum, entry) => sum + (entry.totalWorkedMinutes || 0),
      0
    )
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const hoursTotal = `${hours}h ${minutes}m`

    const attendanceThisMonth = {
      days,
      hoursTotal,
    }

    return {
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        department: employee.department?.name || 'N/A',
        position: employee.position?.title || 'N/A',
        hireDate: employee.hireDate.toFormat('yyyy-MM-dd'),
        type: employee.type,
        email: employee.email,
      },
      myLeaves,
      upcomingLeaves,
      myBenefits,
      lastPaySlip,
      recentHistory,
      attendanceThisMonth,
    }
  }
}

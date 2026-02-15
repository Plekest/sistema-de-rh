import OccupationalExam from '#models/occupational_exam'
import MedicalCertificate from '#models/medical_certificate'
import Employee from '#models/employee'
import Leave from '#models/leave'
import AuditLogService from '#services/audit_log_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

interface CreateExamData {
  employee_id: number
  type: 'admission' | 'periodic' | 'dismissal' | 'return_to_work' | 'role_change'
  exam_date: DateTime
  expiry_date?: DateTime | null
  result?: 'fit' | 'unfit' | 'fit_with_restrictions'
  restrictions?: string | null
  doctor_name?: string | null
  crm?: string | null
  clinic_name?: string | null
  status?: 'scheduled' | 'completed' | 'expired' | 'cancelled'
  notes?: string | null
}

interface UpdateExamData {
  type?: 'admission' | 'periodic' | 'dismissal' | 'return_to_work' | 'role_change'
  exam_date?: DateTime
  expiry_date?: DateTime | null
  result?: 'fit' | 'unfit' | 'fit_with_restrictions'
  restrictions?: string | null
  doctor_name?: string | null
  crm?: string | null
  clinic_name?: string | null
  status?: 'scheduled' | 'completed' | 'expired' | 'cancelled'
  notes?: string | null
}

interface ListExamFilters {
  employeeId?: number
  type?: 'admission' | 'periodic' | 'dismissal' | 'return_to_work' | 'role_change'
  status?: 'scheduled' | 'completed' | 'expired' | 'cancelled'
  page?: number
  limit?: number
}

interface CreateCertificateData {
  employee_id: number
  start_date: DateTime
  end_date: DateTime
  days_count: number
  cid_code?: string | null
  cid_description?: string | null
  doctor_name?: string | null
  crm?: string | null
  notes?: string | null
}

interface ListCertificateFilters {
  employeeId?: number
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  limit?: number
}

export default class OccupationalHealthService {
  /**
   * Lista exames com filtros e paginacao
   */
  async listExams(filters: ListExamFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = OccupationalExam.query().preload('employee').preload('creator')

    if (filters.employeeId) {
      query.where('employee_id', filters.employeeId)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    const result = await query.orderBy('exam_date', 'desc').paginate(page, limit)
    return result
  }

  /**
   * Cria exame ocupacional
   */
  async createExam(data: CreateExamData, userId?: number) {
    await Employee.findOrFail(data.employee_id)

    const exam = await OccupationalExam.create({
      employeeId: data.employee_id,
      type: data.type,
      examDate: data.exam_date,
      expiryDate: data.expiry_date || null,
      result: data.result || undefined,
      restrictions: data.restrictions || null,
      doctorName: data.doctor_name || null,
      crm: data.crm || null,
      clinicName: data.clinic_name || null,
      status: data.status || 'scheduled',
      notes: data.notes || null,
      createdBy: userId || null,
    })

    await exam.load('employee')

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'occupational_exam',
      resourceId: exam.id,
      description: `Exame ocupacional criado: ${exam.type} - ${exam.employee.fullName}`,
      newValues: { type: exam.type, examDate: exam.examDate.toISODate() },
    })

    return exam
  }

  /**
   * Atualiza exame
   */
  async updateExam(id: number, data: UpdateExamData, userId?: number) {
    const exam = await OccupationalExam.findOrFail(id)
    const oldValues = { status: exam.status }

    exam.merge({
      type: data.type ?? exam.type,
      examDate: data.exam_date ?? exam.examDate,
      expiryDate: data.expiry_date !== undefined ? data.expiry_date : exam.expiryDate,
      result: data.result !== undefined ? data.result : exam.result,
      restrictions: data.restrictions !== undefined ? data.restrictions : exam.restrictions,
      doctorName: data.doctor_name !== undefined ? data.doctor_name : exam.doctorName,
      crm: data.crm !== undefined ? data.crm : exam.crm,
      clinicName: data.clinic_name !== undefined ? data.clinic_name : exam.clinicName,
      status: data.status ?? exam.status,
      notes: data.notes !== undefined ? data.notes : exam.notes,
    })

    await exam.save()
    await exam.load('employee')

    await AuditLogService.log({
      userId,
      action: 'update',
      resourceType: 'occupational_exam',
      resourceId: exam.id,
      description: `Exame ocupacional atualizado: ID ${exam.id}`,
      oldValues,
      newValues: { status: exam.status },
    })

    return exam
  }

  /**
   * Remove exame
   */
  async deleteExam(id: number, userId?: number) {
    const exam = await OccupationalExam.findOrFail(id)
    await exam.delete()

    await AuditLogService.log({
      userId,
      action: 'delete',
      resourceType: 'occupational_exam',
      resourceId: exam.id,
      description: `Exame ocupacional removido: ID ${exam.id}`,
    })

    return exam
  }

  /**
   * Retorna exames que vencem nos proximos X dias
   */
  async getUpcomingExams(days: number = 30) {
    const today = DateTime.now()
    const futureDate = today.plus({ days })

    return await OccupationalExam.query()
      .whereBetween('expiry_date', [today.toSQLDate()!, futureDate.toSQLDate()!])
      .whereNot('status', 'cancelled')
      .preload('employee')
      .orderBy('expiry_date', 'asc')
  }

  /**
   * Retorna exames vencidos
   */
  async getExpiredExams() {
    const today = DateTime.now()

    return await OccupationalExam.query()
      .where('expiry_date', '<', today.toSQLDate()!)
      .whereNot('status', 'cancelled')
      .preload('employee')
      .orderBy('expiry_date', 'asc')
  }

  /**
   * Completa exame com resultado
   */
  async completeExam(
    id: number,
    result: 'fit' | 'unfit' | 'fit_with_restrictions',
    restrictions?: string | null,
    doctorName?: string | null,
    crm?: string | null,
    userId?: number
  ) {
    const exam = await OccupationalExam.findOrFail(id)

    exam.result = result
    exam.restrictions = restrictions || null
    exam.doctorName = doctorName || exam.doctorName
    exam.crm = crm || exam.crm
    exam.status = 'completed'

    await exam.save()
    await exam.load('employee')

    await AuditLogService.log({
      userId,
      action: 'update',
      resourceType: 'occupational_exam',
      resourceId: exam.id,
      description: `Exame concluído com resultado: ${result}`,
      newValues: { result, status: 'completed' },
    })

    return exam
  }

  /**
   * Lista atestados com filtros
   */
  async listCertificates(filters: ListCertificateFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = MedicalCertificate.query().preload('employee').preload('approver')

    if (filters.employeeId) {
      query.where('employee_id', filters.employeeId)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    const result = await query.orderBy('start_date', 'desc').paginate(page, limit)
    return result
  }

  /**
   * Cria atestado medico
   */
  async createCertificate(data: CreateCertificateData, userId?: number) {
    await Employee.findOrFail(data.employee_id)

    const certificate = await MedicalCertificate.create({
      employeeId: data.employee_id,
      startDate: data.start_date,
      endDate: data.end_date,
      daysCount: data.days_count,
      cidCode: data.cid_code || null,
      cidDescription: data.cid_description || null,
      doctorName: data.doctor_name || null,
      crm: data.crm || null,
      status: 'pending',
      notes: data.notes || null,
    })

    await certificate.load('employee')

    await AuditLogService.log({
      userId,
      action: 'create',
      resourceType: 'medical_certificate',
      resourceId: certificate.id,
      description: `Atestado médico criado: ${certificate.employee.fullName} - ${certificate.daysCount} dias`,
      newValues: { employeeId: data.employee_id, daysCount: data.days_count },
    })

    return certificate
  }

  /**
   * Aprova atestado e cria leave automaticamente
   */
  async approveCertificate(id: number, userId: number) {
    const certificate = await MedicalCertificate.query()
      .where('id', id)
      .preload('employee')
      .firstOrFail()

    certificate.status = 'approved'
    certificate.approvedBy = userId
    await certificate.save()

    // Cria leave tipo medical automaticamente
    const leave = await Leave.create({
      employeeId: certificate.employeeId,
      type: 'medical',
      startDate: certificate.startDate,
      endDate: certificate.endDate,
      daysCount: certificate.daysCount,
      isPaid: true,
      sellDays: 0,
      status: 'approved',
      requestedBy: userId,
      approvedBy: userId,
      approvedAt: DateTime.now(),
      notes: `Afastamento por atestado médico - ID ${certificate.id}`,
    })

    certificate.leaveId = leave.id
    await certificate.save()

    await AuditLogService.log({
      userId,
      action: 'approve',
      resourceType: 'medical_certificate',
      resourceId: certificate.id,
      description: `Atestado aprovado e leave criado: ${certificate.employee.fullName}`,
      newValues: { status: 'approved', leaveId: leave.id },
    })

    await certificate.load('leave')

    return certificate
  }

  /**
   * Rejeita atestado
   */
  async rejectCertificate(id: number, userId: number) {
    const certificate = await MedicalCertificate.findOrFail(id)

    certificate.status = 'rejected'
    certificate.approvedBy = userId
    await certificate.save()

    await certificate.load('employee')

    await AuditLogService.log({
      userId,
      action: 'reject',
      resourceType: 'medical_certificate',
      resourceId: certificate.id,
      description: `Atestado rejeitado: ID ${certificate.id}`,
      newValues: { status: 'rejected' },
    })

    return certificate
  }

  /**
   * Dashboard de saude ocupacional
   */
  async getHealthDashboard() {
    // Total de exames por tipo
    const examsByType = await db
      .from('occupational_exams')
      .select('type')
      .groupBy('type')
      .count('* as total')

    // Total de exames por status
    const examsByStatus = await db
      .from('occupational_exams')
      .select('status')
      .groupBy('status')
      .count('* as total')

    // Atestados por mes (ultimos 12 meses)
    const startDate = DateTime.now().minus({ months: 12 }).toSQLDate()
    const certificatesByMonth = await db.rawQuery(
      `
      SELECT
        EXTRACT(YEAR FROM start_date) as year,
        EXTRACT(MONTH FROM start_date) as month,
        COUNT(*) as total,
        SUM(days_count) as total_days
      FROM medical_certificates
      WHERE start_date >= ?
      GROUP BY EXTRACT(YEAR FROM start_date), EXTRACT(MONTH FROM start_date)
      ORDER BY year, month
    `,
      [startDate]
    )

    // Media de dias de afastamento
    const avgDaysAbsent = await db
      .from('medical_certificates')
      .where('status', 'approved')
      .avg('days_count as avg_days')
      .first()

    return {
      examsByType: examsByType.map((e) => ({ type: e.type, count: Number(e.total) })),
      examsByStatus: examsByStatus.map((e) => ({ status: e.status, count: Number(e.total) })),
      certificatesByMonth: certificatesByMonth.rows.map((r: any) => ({
        year: Number(r.year),
        month: Number(r.month),
        count: Number(r.total),
        totalDays: Number(r.total_days),
      })),
      avgDaysAbsent: avgDaysAbsent?.avg_days ? Math.round(Number(avgDaysAbsent.avg_days)) : 0,
    }
  }
}

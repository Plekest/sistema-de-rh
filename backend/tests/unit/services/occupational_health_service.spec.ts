import { test } from '@japa/runner'
import OccupationalHealthService from '#services/occupational_health_service'
import Database from '@adonisjs/lucid/services/db'
import OccupationalExam from '#models/occupational_exam'
import MedicalCertificate from '#models/medical_certificate'
import Leave from '#models/leave'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

// Helper para gerar IDs únicos
function generateUniqueId() {
  const rand = Math.floor(Math.random() * 90000000) + 10000000
  return `${Date.now()}${rand}`
}

function generateUniqueCPF() {
  const rand = Math.floor(Math.random() * 90000000) + 10000000
  return `${rand}000`
}

test.group('OccupationalHealthService - Exams', (group) => {
  let service: OccupationalHealthService
  let employee: Employee
  let creator: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new OccupationalHealthService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueId = generateUniqueId()

    const user = await User.create({
      fullName: `User ${uniqueId}`,
      email: `user${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'employee',
      isActive: true,
    })

    creator = await User.create({
      fullName: `Admin ${uniqueId}`,
      email: `admin${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    const department = await Department.create({
      name: `Dept ${uniqueId}`,
    })

    const position = await Position.create({
      title: `Position ${uniqueId}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${uniqueId}`,
      fullName: `Employee ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `employee${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })
  })

  test('deve criar exame', async ({ assert }) => {
    // Arrange
    const examData = {
      employee_id: employee.id,
      type: 'admission' as const,
      exam_date: DateTime.now(),
      expiry_date: DateTime.now().plus({ years: 1 }),
      result: 'fit' as const,
      restrictions: null,
      doctor_name: 'Dr. João Silva',
      crm: '12345',
      clinic_name: 'Clínica Saúde',
      status: 'scheduled' as const,
      notes: 'Exame de admissão',
    }

    // Act
    const exam = await service.createExam(examData, creator.id)

    // Assert
    assert.exists(exam)
    assert.equal(exam.employeeId, employee.id)
    assert.equal(exam.type, 'admission')
    assert.equal(exam.doctorName, 'Dr. João Silva')
    assert.equal(exam.status, 'scheduled')
  })

  test('deve listar exames com paginação', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'admission',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'completed',
      createdBy: creator.id,
    })

    // Act
    const result = await service.listExams({ page: 1, limit: 20 })

    // Assert - paginate() retorna SimplePaginator
    assert.exists(result)
    assert.isArray(result)
    assert.isAtLeast(result.length, 1)
  })

  test('deve filtrar exames por employee', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'admission',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'completed',
      createdBy: creator.id,
    })

    // Act
    const result = await service.listExams({ employeeId: employee.id })

    // Assert
    assert.isArray(result)
    result.forEach((exam) => {
      assert.equal(exam.employeeId, employee.id)
    })
  })

  test('deve filtrar exames por tipo', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'periodic',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'completed',
      createdBy: creator.id,
    })

    // Act
    const result = await service.listExams({ type: 'periodic' })

    // Assert
    assert.isArray(result)
    result.forEach((exam) => {
      assert.equal(exam.type, 'periodic')
    })
  })

  test('deve filtrar exames por status', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'admission',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'scheduled',
      createdBy: creator.id,
    })

    // Act
    const result = await service.listExams({ status: 'scheduled' })

    // Assert
    assert.isArray(result)
    result.forEach((exam) => {
      assert.equal(exam.status, 'scheduled')
    })
  })

  test('deve atualizar exame', async ({ assert }) => {
    // Arrange
    const exam = await OccupationalExam.create({
      employeeId: employee.id,
      type: 'admission',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'scheduled',
      createdBy: creator.id,
    })

    // Act
    const updated = await service.updateExam(exam.id, {
      status: 'completed',
      result: 'fit_with_restrictions',
      restrictions: 'Evitar trabalho noturno',
    })

    // Assert
    assert.equal(updated.status, 'completed')
    assert.equal(updated.result, 'fit_with_restrictions')
    assert.equal(updated.restrictions, 'Evitar trabalho noturno')
  })

  test('deve concluir exame (mudar status para completed)', async ({ assert }) => {
    // Arrange
    const exam = await OccupationalExam.create({
      employeeId: employee.id,
      type: 'admission',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'scheduled',
      createdBy: creator.id,
    })

    // Act
    await service.completeExam(exam.id, 'fit', null, 'Dr. João', '12345', creator.id)
    await exam.refresh()

    // Assert
    assert.equal(exam.status, 'completed')
    assert.equal(exam.result, 'fit')
  })

  test('deve listar exames próximos do vencimento', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'periodic',
      examDate: DateTime.now().minus({ months: 11 }),
      expiryDate: DateTime.now().plus({ days: 15 }), // Vence em 15 dias
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'completed',
      createdBy: creator.id,
    })

    // Act
    const exams = await service.getUpcomingExams(30) // Próximos 30 dias

    // Assert
    assert.isArray(exams)
    assert.isAtLeast(exams.length, 1)
  })

  test('deve listar exames vencidos', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'periodic',
      examDate: DateTime.now().minus({ years: 2 }),
      expiryDate: DateTime.now().minus({ days: 10 }), // Vencido há 10 dias
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'completed',
      createdBy: creator.id,
    })

    // Act
    const exams = await service.getExpiredExams()

    // Assert
    assert.isArray(exams)
    assert.isAtLeast(exams.length, 1)
  })
})

test.group('OccupationalHealthService - Certificates', (group) => {
  let service: OccupationalHealthService
  let employee: Employee
  let approver: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new OccupationalHealthService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueId = generateUniqueId()

    const user = await User.create({
      fullName: `User ${uniqueId}`,
      email: `user${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'employee',
      isActive: true,
    })

    approver = await User.create({
      fullName: `Manager ${uniqueId}`,
      email: `manager${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'manager',
      isActive: true,
    })

    const department = await Department.create({
      name: `Dept ${uniqueId}`,
    })

    const position = await Position.create({
      title: `Position ${uniqueId}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${uniqueId}`,
      fullName: `Employee ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `employee${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })
  })

  test('deve criar atestado', async ({ assert }) => {
    // Arrange
    const certificateData = {
      employee_id: employee.id,
      start_date: DateTime.now(),
      end_date: DateTime.now().plus({ days: 3 }),
      days_count: 3,
      cid_code: 'J00',
      cid_description: 'Resfriado comum',
      doctor_name: 'Dra. Maria Santos',
      crm: '54321',
      notes: 'Repouso de 3 dias',
    }

    // Act
    const certificate = await service.createCertificate(certificateData)

    // Assert
    assert.exists(certificate)
    assert.equal(certificate.employeeId, employee.id)
    assert.equal(certificate.daysCount, 3)
    assert.equal(certificate.cidCode, 'J00')
    assert.equal(certificate.status, 'pending')
  })

  test('deve listar atestados com paginação', async ({ assert }) => {
    // Arrange
    await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    const result = await service.listCertificates({ page: 1, limit: 20 })

    // Assert
    assert.exists(result)
    assert.isArray(result)
  })

  test('deve filtrar atestados por employee', async ({ assert }) => {
    // Arrange
    await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    const result = await service.listCertificates({ employeeId: employee.id })

    // Assert
    assert.isArray(result)
    result.forEach((cert) => {
      assert.equal(cert.employeeId, employee.id)
    })
  })

  test('deve filtrar atestados por status', async ({ assert }) => {
    // Arrange
    await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'approved',
      approvedBy: approver.id,
    })

    // Act
    const result = await service.listCertificates({ status: 'approved' })

    // Assert
    assert.isArray(result)
    result.forEach((cert) => {
      assert.equal(cert.status, 'approved')
    })
  })

  test('deve aprovar atestado', async ({ assert }) => {
    // Arrange
    const certificate = await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    await service.approveCertificate(certificate.id, approver.id)
    await certificate.refresh()

    // Assert
    assert.equal(certificate.status, 'approved')
    assert.equal(certificate.approvedBy, approver.id)
  })

  test('deve rejeitar atestado', async ({ assert }) => {
    // Arrange
    const certificate = await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    await service.rejectCertificate(certificate.id, approver.id)
    await certificate.refresh()

    // Assert
    assert.equal(certificate.status, 'rejected')
    assert.equal(certificate.approvedBy, approver.id)
  })

  test('ao aprovar atestado, deve criar leave automaticamente', async ({ assert }) => {
    // Arrange
    const certificate = await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    await service.approveCertificate(certificate.id, approver.id)
    await certificate.refresh()

    // Assert
    assert.isNotNull(certificate.leaveId)
    const leave = await Leave.find(certificate.leaveId!)
    assert.exists(leave)
  })

  test('leave criada deve ter tipo medical', async ({ assert }) => {
    // Arrange
    const certificate = await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    await service.approveCertificate(certificate.id, approver.id)
    await certificate.refresh()

    // Assert
    const leave = await Leave.find(certificate.leaveId!)
    assert.exists(leave)
    assert.equal(leave!.type, 'medical')
  })

  test('leave criada deve ter mesmas datas do atestado', async ({ assert }) => {
    // Arrange
    const startDate = DateTime.now()
    const endDate = DateTime.now().plus({ days: 3 })

    const certificate = await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: startDate,
      endDate: endDate,
      daysCount: 3,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    await service.approveCertificate(certificate.id, approver.id)
    await certificate.refresh()

    // Assert
    const leave = await Leave.find(certificate.leaveId!)
    assert.exists(leave)
    assert.equal(leave!.startDate.toISODate(), startDate.toISODate())
    assert.equal(leave!.endDate.toISODate(), endDate.toISODate())
  })
})

test.group('OccupationalHealthService - Dashboard', (group) => {
  let service: OccupationalHealthService
  let employee: Employee
  let creator: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new OccupationalHealthService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueId = generateUniqueId()

    const user = await User.create({
      fullName: `User ${uniqueId}`,
      email: `user${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'employee',
      isActive: true,
    })

    creator = await User.create({
      fullName: `Admin ${uniqueId}`,
      email: `admin${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    const department = await Department.create({
      name: `Dept ${uniqueId}`,
    })

    const position = await Position.create({
      title: `Position ${uniqueId}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${uniqueId}`,
      fullName: `Employee ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `employee${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })
  })

  test('deve retornar dashboard com totais', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'admission',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'completed',
      createdBy: creator.id,
    })

    await MedicalCertificate.create({
      employeeId: employee.id,
      startDate: DateTime.now(),
      endDate: DateTime.now().plus({ days: 2 }),
      daysCount: 2,
      cidCode: 'J00',
      cidDescription: 'Resfriado',
      doctorName: 'Dr. João',
      crm: '12345',
      documentPath: '/docs/cert.pdf',
      status: 'pending',
    })

    // Act
    const dashboard = await service.getHealthDashboard()

    // Assert
    assert.exists(dashboard)
    assert.property(dashboard, 'examsByType')
    assert.property(dashboard, 'examsByStatus')
    assert.property(dashboard, 'certificatesByMonth')
    assert.property(dashboard, 'avgDaysAbsent')
    assert.isArray(dashboard.examsByType)
    assert.isArray(dashboard.examsByStatus)
  })

  test('deve retornar exames por tipo e status', async ({ assert }) => {
    // Arrange
    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'admission',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'completed',
      createdBy: creator.id,
    })

    await OccupationalExam.create({
      employeeId: employee.id,
      type: 'periodic',
      examDate: DateTime.now(),
      expiryDate: DateTime.now().plus({ years: 1 }),
      result: 'fit',
      doctorName: 'Dr. João',
      crm: '12345',
      clinicName: 'Clínica',
      status: 'scheduled',
      createdBy: creator.id,
    })

    // Act
    const dashboard = await service.getHealthDashboard()

    // Assert
    assert.exists(dashboard)
    assert.property(dashboard, 'examsByType')
    assert.property(dashboard, 'examsByStatus')
  })
})

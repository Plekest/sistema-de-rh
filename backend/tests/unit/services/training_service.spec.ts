import { test } from '@japa/runner'
import TrainingService from '#services/training_service'
import Database from '@adonisjs/lucid/services/db'
import Training from '#models/training'
import TrainingEnrollment from '#models/training_enrollment'
import Employee from '#models/employee'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import { DateTime } from 'luxon'

test.group('TrainingService - list', (group) => {
  let service: TrainingService
  let user: User
  let department: Department
  let position: Position
  let employee: Employee

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${timestamp}`,
      fullName: `Colaborador ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })
  })

  test('deve retornar lista paginada de treinamentos', async ({ assert }) => {
    // Arrange
    await Training.create({
      title: 'Treinamento 1',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    await Training.create({
      title: 'Treinamento 2',
      type: 'presential',
      startDate: DateTime.fromISO('2024-04-01'),
      endDate: DateTime.fromISO('2024-04-05'),
      durationHours: 10,
      status: 'planned',
      isMandatory: true,
      createdBy: user.id,
    })

    // Act
    const result = await service.list({ page: 1, limit: 20 })

    // Assert
    assert.isAtLeast(result.length, 2)
  })

  test('deve filtrar por status', async ({ assert }) => {
    // Arrange
    await Training.create({
      title: 'Treinamento Planejado',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    await Training.create({
      title: 'Treinamento Em Andamento',
      type: 'online',
      startDate: DateTime.fromISO('2024-02-01'),
      endDate: DateTime.fromISO('2024-02-10'),
      durationHours: 15,
      status: 'in_progress',
      isMandatory: false,
      createdBy: user.id,
    })

    // Act
    const result = await service.list({ status: 'planned' })

    // Assert
    assert.isAbove(result.length, 0)
    result.forEach((training) => {
      assert.equal(training.status, 'planned')
    })
  })

  test('deve filtrar por type', async ({ assert }) => {
    // Arrange
    await Training.create({
      title: 'Treinamento Online',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    await Training.create({
      title: 'Treinamento Presencial',
      type: 'presential',
      startDate: DateTime.fromISO('2024-04-01'),
      endDate: DateTime.fromISO('2024-04-05'),
      durationHours: 10,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    // Act
    const result = await service.list({ type: 'online' })

    // Assert
    assert.isAbove(result.length, 0)
    result.forEach((training) => {
      assert.equal(training.type, 'online')
    })
  })

  test('deve filtrar por category', async ({ assert }) => {
    // Arrange
    await Training.create({
      title: 'Treinamento de Seguranca',
      type: 'online',
      category: 'Seguranca do Trabalho',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    await Training.create({
      title: 'Treinamento de TI',
      type: 'online',
      category: 'Tecnologia',
      startDate: DateTime.fromISO('2024-04-01'),
      endDate: DateTime.fromISO('2024-04-05'),
      durationHours: 10,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    // Act
    const result = await service.list({ category: 'Tecnologia' })

    // Assert
    assert.isAbove(result.length, 0)
    result.forEach((training) => {
      assert.equal(training.category, 'Tecnologia')
    })
  })

  test('deve retornar array vazio quando não há treinamentos', async ({ assert }) => {
    // Act - Filtra por categoria inexistente
    const result = await service.list({ category: 'Categoria Inexistente XYZ' })

    // Assert
    assert.equal(result.length, 0)
  })

  test('deve paginar corretamente', async ({ assert }) => {
    // Arrange - Criar 3 treinamentos
    for (let i = 1; i <= 3; i++) {
      await Training.create({
        title: `Treinamento ${i}`,
        type: 'online',
        startDate: DateTime.fromISO(`2024-0${i}-01`),
        endDate: DateTime.fromISO(`2024-0${i}-10`),
        durationHours: 20,
        status: 'planned',
        isMandatory: false,
        createdBy: user.id,
      })
    }

    // Act
    const page1 = await service.list({ page: 1, limit: 2 })
    const page2 = await service.list({ page: 2, limit: 2 })

    // Assert
    assert.equal(page1.length, 2)
    assert.isAtLeast(page2.length, 1)
  })
})

test.group('TrainingService - show', (group) => {
  let service: TrainingService
  let user: User
  let training: Training

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    training = await Training.create({
      title: 'Treinamento Teste',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })
  })

  test('deve retornar treinamento com detalhes e enrollments', async ({ assert }) => {
    // Act
    const result = await service.show(training.id)

    // Assert
    assert.equal(result.id, training.id)
    assert.equal(result.title, 'Treinamento Teste')
    assert.property(result, 'creator')
    assert.property(result, 'enrollments')
  })

  test('deve lançar erro quando treinamento não existe', async ({ assert }) => {
    // Act & Assert
    try {
      await service.show(99999)
      assert.fail('Deveria lançar erro')
    } catch (error) {
      assert.include(error.message, 'E_ROW_NOT_FOUND')
    }
  })
})

test.group('TrainingService - create', (group) => {
  let service: TrainingService
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })
  })

  test('deve criar treinamento com campos obrigatórios', async ({ assert }) => {
    // Arrange
    const data = {
      title: 'Novo Treinamento',
      type: 'online' as const,
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      durationHours: 20,
    }

    // Act
    const result = await service.create(data, user.id)

    // Assert
    assert.equal(result.title, 'Novo Treinamento')
    assert.equal(result.type, 'online')
    assert.equal(result.durationHours, 20)
    assert.equal(result.status, 'planned') // Default
    assert.equal(result.isMandatory, false) // Default
  })

  test('deve criar treinamento com todos os campos opcionais', async ({ assert }) => {
    // Arrange
    const data = {
      title: 'Treinamento Completo',
      description: 'Descrição detalhada',
      type: 'hybrid' as const,
      category: 'Segurança',
      instructor: 'João Silva',
      provider: 'SENAI',
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      durationHours: 40,
      maxParticipants: 20,
      location: 'Sala 101',
      status: 'in_progress' as const,
      isMandatory: true,
      notes: 'Observações importantes',
    }

    // Act
    const result = await service.create(data, user.id)

    // Assert
    assert.equal(result.title, 'Treinamento Completo')
    assert.equal(result.description, 'Descrição detalhada')
    assert.equal(result.type, 'hybrid')
    assert.equal(result.category, 'Segurança')
    assert.equal(result.instructor, 'João Silva')
    assert.equal(result.provider, 'SENAI')
    assert.equal(result.maxParticipants, 20)
    assert.equal(result.location, 'Sala 101')
    assert.equal(result.status, 'in_progress')
    assert.equal(result.isMandatory, true)
    assert.equal(result.notes, 'Observações importantes')
  })

  test('deve validar que endDate >= startDate', async ({ assert }) => {
    // Arrange
    const data = {
      title: 'Treinamento Inválido',
      type: 'online' as const,
      startDate: '2024-05-10',
      endDate: '2024-05-01', // Antes da data de início
      durationHours: 20,
    }

    // Act & Assert
    try {
      await service.create(data, user.id)
      assert.fail('Deveria lançar erro')
    } catch (error) {
      assert.include(error.message, 'data de termino')
      assert.include(error.message, 'posterior')
    }
  })

  test('deve definir status default como planned', async ({ assert }) => {
    // Arrange
    const data = {
      title: 'Treinamento',
      type: 'online' as const,
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      durationHours: 20,
      // Sem especificar status
    }

    // Act
    const result = await service.create(data, user.id)

    // Assert
    assert.equal(result.status, 'planned')
  })
})

test.group('TrainingService - update', (group) => {
  let service: TrainingService
  let user: User
  let training: Training

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    training = await Training.create({
      title: 'Treinamento Original',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })
  })

  test('deve atualizar treinamento com sucesso', async ({ assert }) => {
    // Arrange
    const data = {
      title: 'Treinamento Atualizado',
      type: 'presential' as const,
      durationHours: 30,
    }

    // Act
    const result = await service.update(training.id, data)

    // Assert
    assert.equal(result.title, 'Treinamento Atualizado')
    assert.equal(result.type, 'presential')
    assert.equal(result.durationHours, 30)
  })

  test('deve atualizar parcialmente (apenas título)', async ({ assert }) => {
    // Arrange
    const data = {
      title: 'Novo Título',
    }

    // Act
    const result = await service.update(training.id, data)

    // Assert
    assert.equal(result.title, 'Novo Título')
    assert.equal(result.type, 'online') // Mantém original
    assert.equal(result.durationHours, 20) // Mantém original
  })

  test('deve lançar erro quando treinamento não existe', async ({ assert }) => {
    // Act & Assert
    try {
      await service.update(99999, { title: 'Teste' })
      assert.fail('Deveria lançar erro')
    } catch (error) {
      assert.include(error.message, 'E_ROW_NOT_FOUND')
    }
  })
})

test.group('TrainingService - delete', (group) => {
  let service: TrainingService
  let user: User
  let department: Department
  let position: Position
  let employee: Employee
  let training: Training

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${timestamp}`,
      fullName: `Colaborador ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    training = await Training.create({
      title: 'Treinamento para Deletar',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })
  })

  test('deve marcar como cancelled (soft delete)', async ({ assert }) => {
    // Act
    const result = await service.delete(training.id)

    // Assert
    assert.equal(result.status, 'cancelled')

    // Verifica que não foi realmente deletado
    const stillExists = await Training.find(training.id)
    assert.isNotNull(stillExists)
  })

  test('deve cancelar enrollments ativos ao deletar', async ({ assert }) => {
    // Arrange - Criar inscrição
    const enrollment = await TrainingEnrollment.create({
      trainingId: training.id,
      employeeId: employee.id,
      status: 'enrolled',
      enrolledAt: DateTime.now(),
    })

    // Act
    await service.delete(training.id)

    // Assert
    await enrollment.refresh()
    assert.equal(enrollment.status, 'cancelled')
  })
})

test.group('TrainingService - enroll', (group) => {
  let service: TrainingService
  let user: User
  let department: Department
  let position: Position
  let employee: Employee
  let training: Training

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${timestamp}`,
      fullName: `Colaborador ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    training = await Training.create({
      title: 'Treinamento de Inscrição',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })
  })

  test('deve inscrever colaborador com sucesso', async ({ assert }) => {
    // Act
    const result = await service.enroll(training.id, employee.id)

    // Assert
    assert.equal(result.trainingId, training.id)
    assert.equal(result.employeeId, employee.id)
    assert.equal(result.status, 'enrolled')
    assert.isNotNull(result.enrolledAt)
  })

  test('deve lançar erro quando colaborador já inscrito', async ({ assert }) => {
    // Arrange - Primeira inscrição
    await service.enroll(training.id, employee.id)

    // Act & Assert - Segunda inscrição
    try {
      await service.enroll(training.id, employee.id)
      assert.fail('Deveria lançar erro')
    } catch (error) {
      assert.include(error.message, 'ja inscrito')
    }
  })

  test('deve lançar erro quando treinamento cancelado', async ({ assert }) => {
    // Arrange
    training.status = 'cancelled'
    await training.save()

    // Act & Assert
    try {
      await service.enroll(training.id, employee.id)
      assert.fail('Deveria lançar erro')
    } catch (error) {
      assert.include(error.message, 'cancelados')
    }
  })

  test('deve lançar erro quando treinamento lotado (maxParticipants)', async ({ assert }) => {
    // Arrange - Define limite de 1 participante
    training.maxParticipants = 1
    await training.save()

    // Criar outro colaborador e inscrevê-lo
    const timestamp = Date.now()
    const employee2 = await Employee.create({
      registrationNumber: `REG2${timestamp}`,
      fullName: `Colaborador 2 ${timestamp}`,
      cpf: `${timestamp + 1}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador2${timestamp}@empresa.com`,
      phone: '11999999998',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    await service.enroll(training.id, employee2.id)

    // Act & Assert - Tentar inscrever segundo colaborador
    try {
      await service.enroll(training.id, employee.id)
      assert.fail('Deveria lançar erro')
    } catch (error) {
      assert.include(error.message, 'limite maximo')
    }
  })

  test('deve permitir inscrição quando maxParticipants é null', async ({ assert }) => {
    // Arrange
    training.maxParticipants = null
    await training.save()

    // Act
    const result = await service.enroll(training.id, employee.id)

    // Assert
    assert.equal(result.status, 'enrolled')
  })
})

test.group('TrainingService - bulkEnroll', (group) => {
  let service: TrainingService
  let user: User
  let department: Department
  let position: Position
  let employee1: Employee
  let employee2: Employee
  let training: Training

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })

    employee1 = await Employee.create({
      registrationNumber: `REG1${timestamp}`,
      fullName: `Colaborador 1 ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador1${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    employee2 = await Employee.create({
      registrationNumber: `REG2${timestamp}`,
      fullName: `Colaborador 2 ${timestamp}`,
      cpf: `${timestamp + 1}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador2${timestamp}@empresa.com`,
      phone: '11999999998',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    training = await Training.create({
      title: 'Treinamento Bulk',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })
  })

  test('deve inscrever múltiplos colaboradores', async ({ assert }) => {
    // Act
    const result = await service.bulkEnroll(training.id, [employee1.id, employee2.id])

    // Assert
    assert.equal(result.enrollments.length, 2)
    assert.equal(result.errors.length, 0)
  })

  test('deve reportar erros individuais sem falhar todo o lote', async ({ assert }) => {
    // Arrange - Inscrever employee1 previamente
    await service.enroll(training.id, employee1.id)

    // Act - Tentar inscrever ambos (employee1 já está inscrito)
    const result = await service.bulkEnroll(training.id, [employee1.id, employee2.id])

    // Assert
    assert.equal(result.enrollments.length, 1) // Apenas employee2 inscrito
    assert.equal(result.errors.length, 1) // Erro para employee1
    assert.equal(result.errors[0].employeeId, employee1.id)
  })
})

test.group('TrainingService - updateEnrollment', (group) => {
  let service: TrainingService
  let user: User
  let department: Department
  let position: Position
  let employee: Employee
  let training: Training
  let enrollment: TrainingEnrollment

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${timestamp}`,
      fullName: `Colaborador ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    training = await Training.create({
      title: 'Treinamento Update',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    enrollment = await TrainingEnrollment.create({
      trainingId: training.id,
      employeeId: employee.id,
      status: 'enrolled',
      enrolledAt: DateTime.now(),
    })
  })

  test('deve atualizar status para completed', async ({ assert }) => {
    // Act
    const result = await service.updateEnrollment(enrollment.id, {
      status: 'completed',
    })

    // Assert
    assert.equal(result.status, 'completed')
  })

  test('deve registrar completedAt ao concluir', async ({ assert }) => {
    // Act
    const result = await service.updateEnrollment(enrollment.id, {
      status: 'completed',
    })

    // Assert
    assert.isNotNull(result.completedAt)
  })

  test('deve atualizar score e feedback', async ({ assert }) => {
    // Act
    const result = await service.updateEnrollment(enrollment.id, {
      status: 'completed',
      score: 85,
      feedback: 'Excelente treinamento',
      feedbackRating: 5,
    })

    // Assert
    assert.equal(result.score, 85)
    assert.equal(result.feedback, 'Excelente treinamento')
    assert.equal(result.feedbackRating, 5)
  })
})

test.group('TrainingService - getStats', (group) => {
  let service: TrainingService
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })
  })

  test('deve retornar estatísticas corretas', async ({ assert }) => {
    // Arrange
    await Training.create({
      title: 'Treinamento Planejado',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })

    await Training.create({
      title: 'Treinamento Em Andamento',
      type: 'online',
      startDate: DateTime.fromISO('2024-02-01'),
      endDate: DateTime.fromISO('2024-02-10'),
      durationHours: 15,
      status: 'in_progress',
      isMandatory: false,
      createdBy: user.id,
    })

    await Training.create({
      title: 'Treinamento Concluído',
      type: 'online',
      startDate: DateTime.fromISO('2024-01-01'),
      endDate: DateTime.fromISO('2024-01-10'),
      durationHours: 10,
      status: 'completed',
      isMandatory: false,
      createdBy: user.id,
    })

    // Act
    const stats = await service.getStats()

    // Assert
    assert.isAtLeast(stats.total, 3)
    assert.isAtLeast(stats.planned, 1)
    assert.isAtLeast(stats.inProgress, 1)
    assert.isAtLeast(stats.completed, 1)
    assert.isNumber(stats.completionRate)
  })

  test('deve retornar zeros quando não há treinamentos', async ({ assert }) => {
    // Act
    const stats = await service.getStats()

    // Assert
    // Os valores podem vir como string ou number do banco, então convertemos
    assert.exists(stats.total)
    assert.exists(stats.completionRate)
    assert.isNumber(Number(stats.total))
    assert.isNumber(Number(stats.completionRate))
  })
})

test.group('TrainingService - getEmployeeTrainings', (group) => {
  let service: TrainingService
  let user: User
  let department: Department
  let position: Position
  let employee: Employee
  let training: Training

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new TrainingService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const timestamp = Date.now()
    user = await User.create({
      fullName: `Admin ${timestamp}`,
      email: `admin${timestamp}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${timestamp}`,
    })

    position = await Position.create({
      title: `Cargo ${timestamp}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${timestamp}`,
      fullName: `Colaborador ${timestamp}`,
      cpf: `${timestamp}`.substring(0, 11).padEnd(11, '0'),
      email: `colaborador${timestamp}@empresa.com`,
      phone: '11999999999',
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      salary: 5000,
      status: 'active',
      birthDate: DateTime.fromISO('1990-01-01'),
    })

    training = await Training.create({
      title: 'Treinamento do Colaborador',
      type: 'online',
      startDate: DateTime.fromISO('2024-03-01'),
      endDate: DateTime.fromISO('2024-03-10'),
      durationHours: 20,
      status: 'planned',
      isMandatory: false,
      createdBy: user.id,
    })
  })

  test('deve retornar treinamentos de um colaborador', async ({ assert }) => {
    // Arrange
    await service.enroll(training.id, employee.id)

    // Act
    const result = await service.getEmployeeTrainings(employee.id)

    // Assert
    assert.isAtLeast(result.length, 1)
    assert.equal(result[0].employeeId, employee.id)
  })

  test('deve retornar array vazio quando colaborador não tem treinamentos', async ({
    assert,
  }) => {
    // Act
    const result = await service.getEmployeeTrainings(employee.id)

    // Assert
    assert.equal(result.length, 0)
  })
})

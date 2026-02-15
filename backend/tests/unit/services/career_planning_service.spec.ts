import { test } from '@japa/runner'
import CareerPlanningService from '#services/career_planning_service'
import Database from '@adonisjs/lucid/services/db'
import CareerPath from '#models/career_path'
import CareerPathLevel from '#models/career_path_level'
import SuccessionPlan from '#models/succession_plan'
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

test.group('CareerPlanningService - Paths', (group) => {
  let service: CareerPlanningService
  let department: Department
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new CareerPlanningService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueId = generateUniqueId()
    user = await User.create({
      fullName: `Admin ${uniqueId}`,
      email: `admin${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${uniqueId}`,
    })
  })

  test('deve criar career path', async ({ assert }) => {
    // Arrange
    const pathData = {
      name: `Career Path ${generateUniqueId()}`,
      description: 'Caminho de desenvolvimento',
      department_id: department.id,
    }

    // Act
    const path = await service.createPath(pathData, user.id)

    // Assert
    assert.exists(path)
    assert.equal(path.name, pathData.name)
    assert.equal(path.departmentId, department.id)
    assert.equal(path.createdBy, user.id)
    assert.isTrue(path.isActive)
  })

  test('deve listar career paths com levels', async ({ assert }) => {
    // Arrange
    const path = await CareerPath.create({
      name: `Path ${generateUniqueId()}`,
      description: 'Descrição',
      departmentId: department.id,
      isActive: true,
      createdBy: user.id,
    })

    const position = await Position.create({
      title: `Position ${generateUniqueId()}`,
      departmentId: department.id,
    })

    await CareerPathLevel.create({
      careerPathId: path.id,
      positionId: position.id,
      levelOrder: 1,
      title: 'Júnior',
      description: 'Nível inicial',
      minExperienceMonths: 0,
      requiredSkills: ['JavaScript'],
      salaryRangeMin: 3000,
      salaryRangeMax: 5000,
    })

    // Act
    const paths = await service.listPaths()

    // Assert
    assert.isArray(paths)
    const found = paths.find((p) => p.id === path.id)
    assert.exists(found)
  })

  test('deve filtrar por departamento', async ({ assert }) => {
    // Arrange
    const otherDept = await Department.create({
      name: `Other ${generateUniqueId()}`,
    })

    await CareerPath.create({
      name: `Path 1 ${generateUniqueId()}`,
      description: 'Path 1',
      departmentId: department.id,
      isActive: true,
      createdBy: user.id,
    })

    await CareerPath.create({
      name: `Path 2 ${generateUniqueId()}`,
      description: 'Path 2',
      departmentId: otherDept.id,
      isActive: true,
      createdBy: user.id,
    })

    // Act
    const paths = await service.listPaths({ departmentId: department.id })

    // Assert
    assert.isArray(paths)
    paths.forEach((path) => {
      assert.equal(path.departmentId, department.id)
    })
  })

  test('deve atualizar career path', async ({ assert }) => {
    // Arrange
    const path = await CareerPath.create({
      name: `Old Path ${generateUniqueId()}`,
      description: 'Antiga descrição',
      departmentId: department.id,
      isActive: true,
      createdBy: user.id,
    })

    // Act
    const updated = await service.updatePath(
      path.id,
      {
        name: 'New Path',
        description: 'Nova descrição',
      },
      user.id
    )

    // Assert
    assert.equal(updated.name, 'New Path')
    assert.equal(updated.description, 'Nova descrição')
  })

  test('deve desativar career path', async ({ assert }) => {
    // Arrange
    const path = await CareerPath.create({
      name: `Path ${generateUniqueId()}`,
      description: 'Para desativar',
      departmentId: department.id,
      isActive: true,
      createdBy: user.id,
    })

    // Act
    await service.deletePath(path.id, user.id)
    await path.refresh()

    // Assert
    assert.isFalse(path.isActive)
  })
})

test.group('CareerPlanningService - Levels', (group) => {
  let service: CareerPlanningService
  let careerPath: CareerPath
  let position: Position

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new CareerPlanningService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueId = generateUniqueId()
    const user = await User.create({
      fullName: `Admin ${uniqueId}`,
      email: `admin${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'admin',
      isActive: true,
    })

    const department = await Department.create({
      name: `Dept ${uniqueId}`,
    })

    careerPath = await CareerPath.create({
      name: `Path ${uniqueId}`,
      description: 'Descrição',
      departmentId: department.id,
      isActive: true,
      createdBy: user.id,
    })

    position = await Position.create({
      title: `Position ${uniqueId}`,
      departmentId: department.id,
    })
  })

  test('deve adicionar level ao path', async ({ assert }) => {
    // Arrange
    const levelData = {
      career_path_id: careerPath.id,
      position_id: position.id,
      level_order: 1,
      title: 'Júnior',
      description: 'Nível inicial',
      min_experience_months: 0,
      required_skills: null,
      salary_range_min: 3000,
      salary_range_max: 5000,
    }

    // Act
    const level = await service.addLevel(careerPath.id, levelData)

    // Assert
    assert.exists(level)
    assert.equal(level.careerPathId, careerPath.id)
    assert.equal(level.positionId, position.id)
    assert.equal(level.levelOrder, 1)
    assert.equal(level.title, 'Júnior')
  })

  test('deve atualizar level', async ({ assert }) => {
    // Arrange
    const level = await CareerPathLevel.create({
      careerPathId: careerPath.id,
      positionId: position.id,
      levelOrder: 1,
      title: 'Old Title',
      description: 'Old',
      minExperienceMonths: 0,
      requiredSkills: ['Old'],
      salaryRangeMin: 3000,
      salaryRangeMax: 5000,
    })

    // Act
    const updated = await service.updateLevel(level.id, {
      title: 'New Title',
      description: 'New',
      min_experience_months: 6,
    })

    // Assert
    assert.equal(updated.title, 'New Title')
    assert.equal(updated.description, 'New')
    assert.equal(updated.minExperienceMonths, 6)
  })

  test('deve remover level', async ({ assert }) => {
    // Arrange
    const level = await CareerPathLevel.create({
      careerPathId: careerPath.id,
      positionId: position.id,
      levelOrder: 1,
      title: 'To Remove',
      description: 'Remove me',
      minExperienceMonths: 0,
      requiredSkills: ['Skill'],
      salaryRangeMin: 3000,
      salaryRangeMax: 5000,
    })

    // Act
    await service.removeLevel(level.id)
    const found = await CareerPathLevel.find(level.id)

    // Assert
    assert.isNull(found)
  })

  test('levels devem estar ordenados por level_order', async ({ assert }) => {
    // Arrange
    await CareerPathLevel.create({
      careerPathId: careerPath.id,
      positionId: position.id,
      levelOrder: 3,
      title: 'Senior',
      description: 'Senior',
      minExperienceMonths: 60,
      requiredSkills: ['Senior Skills'],
      salaryRangeMin: 8000,
      salaryRangeMax: 12000,
    })

    await CareerPathLevel.create({
      careerPathId: careerPath.id,
      positionId: position.id,
      levelOrder: 1,
      title: 'Júnior',
      description: 'Júnior',
      minExperienceMonths: 0,
      requiredSkills: ['Basic'],
      salaryRangeMin: 3000,
      salaryRangeMax: 5000,
    })

    await CareerPathLevel.create({
      careerPathId: careerPath.id,
      positionId: position.id,
      levelOrder: 2,
      title: 'Pleno',
      description: 'Pleno',
      minExperienceMonths: 24,
      requiredSkills: ['Mid'],
      salaryRangeMin: 5000,
      salaryRangeMax: 8000,
    })

    // Act - listPaths retorna paths com levels ordenados
    const paths = await service.listPaths({ isActive: true })
    const foundPath = paths.find((p) => p.id === careerPath.id)
    const levels = foundPath?.levels || []

    // Assert
    assert.isArray(levels)
    assert.equal(levels.length, 3)
    assert.equal(levels[0].levelOrder, 1)
    assert.equal(levels[1].levelOrder, 2)
    assert.equal(levels[2].levelOrder, 3)
  })
})

test.group('CareerPlanningService - Succession', (group) => {
  let service: CareerPlanningService
  let position: Position
  let currentHolder: Employee
  let successor: Employee
  let creator: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new CareerPlanningService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueId = generateUniqueId()

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

    position = await Position.create({
      title: `Position ${uniqueId}`,
      departmentId: department.id,
    })

    const user1 = await User.create({
      fullName: `User1 ${uniqueId}`,
      email: `user1${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'employee',
      isActive: true,
    })

    currentHolder = await Employee.create({
      userId: user1.id,
      registrationNumber: `REG1${uniqueId}`,
      fullName: `Holder ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `holder${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ years: 5 }),
      status: 'active',
    })

    const user2 = await User.create({
      fullName: `User2 ${uniqueId}`,
      email: `user2${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'employee',
      isActive: true,
    })

    successor = await Employee.create({
      userId: user2.id,
      registrationNumber: `REG2${uniqueId}`,
      fullName: `Successor ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `successor${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now().minus({ years: 2 }),
      status: 'active',
    })
  })

  test('deve criar plano de sucessão', async ({ assert }) => {
    // Arrange
    const planData = {
      position_id: position.id,
      current_holder_id: currentHolder.id,
      successor_id: successor.id,
      readiness: 'ready_now' as const,
      priority: 'high' as const,
      development_actions: 'Treinamento A, Mentoria B',
      notes: 'Candidato promissor',
    }

    // Act
    const plan = await service.createSuccessionPlan(planData, creator.id)

    // Assert
    assert.exists(plan)
    assert.equal(plan.positionId, position.id)
    assert.equal(plan.currentHolderId, currentHolder.id)
    assert.equal(plan.successorId, successor.id)
    assert.equal(plan.readiness, 'ready_now')
    assert.equal(plan.priority, 'high')
  })

  test('deve listar planos com filtro de prioridade', async ({ assert }) => {
    // Arrange
    await SuccessionPlan.create({
      positionId: position.id,
      currentHolderId: currentHolder.id,
      successorId: successor.id,
      readiness: 'ready_now',
      priority: 'high',
      developmentActions: JSON.stringify(['Action']),
      notes: 'High priority',
      createdBy: creator.id,
    })

    const otherPosition = await Position.create({
      title: `Other ${generateUniqueId()}`,
      departmentId: position.departmentId,
    })

    await SuccessionPlan.create({
      positionId: otherPosition.id,
      currentHolderId: currentHolder.id,
      successorId: successor.id,
      readiness: 'ready_1_year',
      priority: 'low',
      developmentActions: JSON.stringify(['Action']),
      notes: 'Low priority',
      createdBy: creator.id,
    })

    // Act
    const plans = await service.getSuccessionPlans({ priority: 'high' })

    // Assert
    assert.isArray(plans)
    plans.forEach((plan) => {
      assert.equal(plan.priority, 'high')
    })
  })

  test('deve atualizar plano de sucessão', async ({ assert }) => {
    // Arrange
    const plan = await SuccessionPlan.create({
      positionId: position.id,
      currentHolderId: currentHolder.id,
      successorId: successor.id,
      readiness: 'development_needed',
      priority: 'medium',
      developmentActions: JSON.stringify(['Old']),
      notes: 'Old notes',
      createdBy: creator.id,
    })

    // Act
    const updated = await service.updateSuccessionPlan(plan.id, {
      readiness: 'ready_now',
      priority: 'high',
      notes: 'New notes',
    })

    // Assert
    assert.equal(updated.readiness, 'ready_now')
    assert.equal(updated.priority, 'high')
    assert.equal(updated.notes, 'New notes')
  })

  test('deve remover plano de sucessão', async ({ assert }) => {
    // Arrange
    const plan = await SuccessionPlan.create({
      positionId: position.id,
      currentHolderId: currentHolder.id,
      successorId: successor.id,
      readiness: 'ready_now',
      priority: 'high',
      developmentActions: JSON.stringify(['Action']),
      notes: 'To remove',
      createdBy: creator.id,
    })

    // Act
    await service.deleteSuccessionPlan(plan.id, creator.id)
    const found = await SuccessionPlan.find(plan.id)

    // Assert
    assert.isNull(found)
  })

  test('deve retornar planos por employee (como successor)', async ({ assert }) => {
    // Arrange
    await SuccessionPlan.create({
      positionId: position.id,
      currentHolderId: currentHolder.id,
      successorId: successor.id,
      readiness: 'ready_now',
      priority: 'high',
      developmentActions: JSON.stringify(['Action']),
      notes: 'Plano',
      createdBy: creator.id,
    })

    // Act
    const plans = await service.getSuccessionPlansByEmployee(successor.id)

    // Assert
    assert.isArray(plans)
    assert.isAtLeast(plans.length, 1)
    const found = plans.find((p) => p.successorId === successor.id)
    assert.exists(found)
  })

  test('deve retornar posições críticas (sem successor)', async ({ assert }) => {
    // Arrange
    await Position.create({
      title: `Critical ${generateUniqueId()}`,
      departmentId: position.departmentId,
    })

    // Posição com plano
    await SuccessionPlan.create({
      positionId: position.id,
      currentHolderId: currentHolder.id,
      successorId: successor.id,
      readiness: 'ready_now',
      priority: 'high',
      developmentActions: JSON.stringify(['Action']),
      createdBy: creator.id,
    })

    // Act
    const critical = await service.getCriticalPositions()

    // Assert
    assert.isArray(critical)
  })

  test('deve incluir posições com readiness = development_needed nas críticas', async ({
    assert,
  }) => {
    // Arrange
    await SuccessionPlan.create({
      positionId: position.id,
      currentHolderId: currentHolder.id,
      successorId: successor.id,
      readiness: 'development_needed',
      priority: 'high',
      developmentActions: JSON.stringify(['Action']),
      createdBy: creator.id,
    })

    // Act
    const critical = await service.getCriticalPositions()

    // Assert
    assert.isArray(critical)
    const found = critical.find((p) => p.readiness === 'development_needed')
    assert.exists(found)
  })
})

test.group('CareerPlanningService - Employee Path', (group) => {
  let service: CareerPlanningService
  let employee: Employee
  let careerPath: CareerPath

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new CareerPlanningService()
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

    const creator = await User.create({
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

    careerPath = await CareerPath.create({
      name: `Path ${uniqueId}`,
      description: 'Career path',
      departmentId: department.id,
      isActive: true,
      createdBy: creator.id,
    })

    await CareerPathLevel.create({
      careerPathId: careerPath.id,
      positionId: position.id,
      levelOrder: 1,
      title: 'Current Level',
      description: 'Current position',
      minExperienceMonths: 0,
      requiredSkills: ['Skill A'],
      salaryRangeMin: 3000,
      salaryRangeMax: 5000,
    })
  })

  test('deve retornar career path do employee baseado no position', async ({ assert }) => {
    // Act
    const result = await service.getEmployeeCareerPath(employee.id)

    // Assert
    assert.exists(result)
    assert.exists(result!.path)
    assert.equal(result!.path.id, careerPath.id)
    assert.exists(result!.currentLevel)
    assert.property(result!, 'nextLevel')
    assert.property(result!, 'currentLevelIndex')
    assert.property(result!, 'totalLevels')
  })
})

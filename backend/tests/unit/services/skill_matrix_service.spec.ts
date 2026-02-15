import { test } from '@japa/runner'
import SkillMatrixService from '#services/skill_matrix_service'
import Database from '@adonisjs/lucid/services/db'
import SkillCategory from '#models/skill_category'
import Skill from '#models/skill'
import EmployeeSkill from '#models/employee_skill'
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

test.group('SkillMatrixService - Categories', (group) => {
  let service: SkillMatrixService
  let user: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SkillMatrixService()
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
  })

  test('deve criar categoria', async ({ assert }) => {
    // Arrange
    const categoryData = {
      name: `Categoria ${generateUniqueId()}`,
      description: 'Categoria de teste',
      display_order: 1,
    }

    // Act
    const category = await service.createCategory(categoryData, user.id)

    // Assert
    assert.exists(category)
    assert.equal(category.name, categoryData.name)
    assert.equal(category.description, categoryData.description)
    assert.equal(category.displayOrder, 1)
    assert.isTrue(category.isActive)
  })

  test('deve listar categorias com skills', async ({ assert }) => {
    // Arrange
    const category = await SkillCategory.create({
      name: `Tech ${generateUniqueId()}`,
      description: 'Tecnologia',
      displayOrder: 1,
      isActive: true,
    })

    await Skill.create({
      categoryId: category.id,
      name: 'JavaScript',
      description: 'Linguagem de programação',
      levelDescriptors: JSON.stringify({ 1: 'Básico', 5: 'Expert' }),
      isActive: true,
    })

    // Act
    const categories = await service.listCategories()

    // Assert
    assert.isArray(categories)
    assert.isAtLeast(categories.length, 1)
    const found = categories.find((c) => c.id === category.id)
    assert.exists(found)
  })

  test('deve atualizar categoria', async ({ assert }) => {
    // Arrange
    const category = await SkillCategory.create({
      name: `Old Name ${generateUniqueId()}`,
      description: 'Descrição antiga',
      displayOrder: 1,
      isActive: true,
    })

    // Act
    const updated = await service.updateCategory(
      category.id,
      {
        name: 'New Name',
        description: 'Nova descrição',
        display_order: 2,
      },
      user.id
    )

    // Assert
    assert.equal(updated.name, 'New Name')
    assert.equal(updated.description, 'Nova descrição')
    assert.equal(updated.displayOrder, 2)
  })

  test('deve desativar categoria (soft delete)', async ({ assert }) => {
    // Arrange
    const category = await SkillCategory.create({
      name: `Categoria ${generateUniqueId()}`,
      description: 'Para desativar',
      displayOrder: 1,
      isActive: true,
    })

    // Act
    await service.deleteCategory(category.id, user.id)
    await category.refresh()

    // Assert
    assert.isFalse(category.isActive)
  })
})

test.group('SkillMatrixService - Skills', (group) => {
  let service: SkillMatrixService
  let category: SkillCategory

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SkillMatrixService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    category = await SkillCategory.create({
      name: `Categoria ${generateUniqueId()}`,
      description: 'Categoria de teste',
      displayOrder: 1,
      isActive: true,
    })
  })

  test('deve criar skill', async ({ assert }) => {
    // Arrange
    const skillData = {
      category_id: category.id,
      name: `Skill ${generateUniqueId()}`,
      description: 'Habilidade de teste',
      level_descriptors: null, // O service aceita null
    }

    // Act
    const skill = await service.createSkill(skillData)

    // Assert
    assert.exists(skill)
    assert.equal(skill.categoryId, category.id)
    assert.equal(skill.name, skillData.name)
    assert.isTrue(skill.isActive)
  })

  test('deve listar skills com filtro por categoria', async ({ assert }) => {
    // Arrange
    await Skill.create({
      categoryId: category.id,
      name: `Skill A ${generateUniqueId()}`,
      description: 'Skill A',
      levelDescriptors: JSON.stringify({ 1: 'Básico' }),
      isActive: true,
    })

    // Act
    const skills = await service.listSkills({ categoryId: category.id })

    // Assert
    assert.isArray(skills)
    assert.isAtLeast(skills.length, 1)
    skills.forEach((skill) => {
      assert.equal(skill.categoryId, category.id)
    })
  })

  test('deve listar skills com filtro por ativo', async ({ assert }) => {
    // Arrange
    await Skill.create({
      categoryId: category.id,
      name: `Active ${generateUniqueId()}`,
      description: 'Ativa',
      levelDescriptors: JSON.stringify({ 1: 'Básico' }),
      isActive: true,
    })

    await Skill.create({
      categoryId: category.id,
      name: `Inactive ${generateUniqueId()}`,
      description: 'Inativa',
      levelDescriptors: JSON.stringify({ 1: 'Básico' }),
      isActive: false,
    })

    // Act
    const activeSkills = await service.listSkills({ isActive: true })

    // Assert
    assert.isArray(activeSkills)
    activeSkills.forEach((skill) => {
      assert.isTrue(skill.isActive)
    })
  })

  test('deve atualizar skill', async ({ assert }) => {
    // Arrange
    const skill = await Skill.create({
      categoryId: category.id,
      name: `Old ${generateUniqueId()}`,
      description: 'Antiga',
      levelDescriptors: JSON.stringify({ 1: 'Básico' }),
      isActive: true,
    })

    // Act
    const updated = await service.updateSkill(skill.id, {
      name: 'New Name',
      description: 'Nova descrição',
    })

    // Assert
    assert.equal(updated.name, 'New Name')
    assert.equal(updated.description, 'Nova descrição')
  })

  test('deve desativar skill', async ({ assert }) => {
    // Arrange
    const skill = await Skill.create({
      categoryId: category.id,
      name: `To Deactivate ${generateUniqueId()}`,
      description: 'Para desativar',
      levelDescriptors: JSON.stringify({ 1: 'Básico' }),
      isActive: true,
    })

    // Act
    await service.deleteSkill(skill.id)
    await skill.refresh()

    // Assert
    assert.isFalse(skill.isActive)
  })
})

test.group('SkillMatrixService - Assessment', (group) => {
  let service: SkillMatrixService
  let employee: Employee
  let skill: Skill
  let assessor: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SkillMatrixService()
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

    assessor = await User.create({
      fullName: `Assessor ${uniqueId}`,
      email: `assessor${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'manager',
      isActive: true,
    })

    const department = await Department.create({
      name: `Dept ${uniqueId}`,
    })

    const position = await Position.create({
      title: `Cargo ${uniqueId}`,
      departmentId: department.id,
    })

    employee = await Employee.create({
      userId: user.id,
      registrationNumber: `REG${uniqueId}`,
      fullName: `Colaborador ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `colaborador${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const category = await SkillCategory.create({
      name: `Category ${uniqueId}`,
      description: 'Test',
      displayOrder: 1,
      isActive: true,
    })

    skill = await Skill.create({
      categoryId: category.id,
      name: `Skill ${uniqueId}`,
      description: 'Skill de teste',
      levelDescriptors: JSON.stringify({ 1: 'Básico', 5: 'Expert' }),
      isActive: true,
    })
  })

  test('deve avaliar skill de um employee', async ({ assert }) => {
    // Arrange
    const assessmentData = {
      employeeId: employee.id,
      skillId: skill.id,
      currentLevel: 3,
      targetLevel: 5,
      assessedBy: assessor.id,
      notes: 'Boa evolução',
    }

    // Act
    const assessment = await service.assessEmployeeSkill(assessmentData)

    // Assert
    assert.exists(assessment)
    assert.equal(assessment.employeeId, employee.id)
    assert.equal(assessment.skillId, skill.id)
    assert.equal(assessment.currentLevel, 3)
    assert.equal(assessment.targetLevel, 5)
    assert.equal(assessment.assessedBy, assessor.id)
  })

  test('deve atualizar avaliação existente (upsert)', async ({ assert }) => {
    // Arrange
    await EmployeeSkill.create({
      employeeId: employee.id,
      skillId: skill.id,
      currentLevel: 2,
      targetLevel: 4,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    // Act
    const updated = await service.assessEmployeeSkill({
      employeeId: employee.id,
      skillId: skill.id,
      currentLevel: 4,
      targetLevel: 5,
      assessedBy: assessor.id,
      notes: 'Atualizado',
    })

    // Assert
    assert.equal(updated.currentLevel, 4)
    assert.equal(updated.targetLevel, 5)
    assert.equal(updated.notes, 'Atualizado')
  })

  test('deve fazer avaliação em lote (bulk)', async ({ assert }) => {
    // Arrange
    const skill2 = await Skill.create({
      categoryId: skill.categoryId,
      name: `Skill 2 ${generateUniqueId()}`,
      description: 'Segunda skill',
      levelDescriptors: JSON.stringify({ 1: 'Básico' }),
      isActive: true,
    })

    const bulkData = [
      {
        skill_id: skill.id,
        current_level: 3,
        target_level: 5,
        notes: null,
      },
      {
        skill_id: skill2.id,
        current_level: 2,
        target_level: 4,
        notes: null,
      },
    ]

    // Act
    const assessments = await service.bulkAssessEmployeeSkills(
      employee.id,
      bulkData,
      assessor.id
    )

    // Assert
    assert.isArray(assessments)
    assert.equal(assessments.length, 2)
  })

  test('deve retornar skills do employee', async ({ assert }) => {
    // Arrange
    await EmployeeSkill.create({
      employeeId: employee.id,
      skillId: skill.id,
      currentLevel: 3,
      targetLevel: 5,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    // Act
    const skills = await service.getEmployeeSkills(employee.id)

    // Assert
    assert.isArray(skills)
    assert.isAtLeast(skills.length, 1)
    const found = skills.find((s) => s.skillId === skill.id)
    assert.exists(found)
    assert.equal(found?.currentLevel, 3)
  })

  test('deve validar níveis dentro do range válido (1-5)', async ({ assert }) => {
    // Arrange & Act - DB tem constraint check para 1-5
    const assessment = await service.assessEmployeeSkill({
      employeeId: employee.id,
      skillId: skill.id,
      currentLevel: 3,
      targetLevel: 5,
      assessedBy: assessor.id,
    })

    // Assert - Níveis válidos são aceitos
    assert.exists(assessment)
    assert.equal(assessment.currentLevel, 3)
    assert.equal(assessment.targetLevel, 5)
  })
})

test.group('SkillMatrixService - Reports', (group) => {
  let service: SkillMatrixService
  let employee1: Employee
  let employee2: Employee
  let skill1: Skill
  let skill2: Skill
  let department: Department
  let assessor: User

  group.setup(async () => {
    await Database.beginGlobalTransaction()
    service = new SkillMatrixService()
  })

  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  group.each.setup(async () => {
    const uniqueId = generateUniqueId()

    assessor = await User.create({
      fullName: `Assessor ${uniqueId}`,
      email: `assessor${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'manager',
      isActive: true,
    })

    department = await Department.create({
      name: `Dept ${uniqueId}`,
    })

    const position = await Position.create({
      title: `Cargo ${uniqueId}`,
      departmentId: department.id,
    })

    const user1 = await User.create({
      fullName: `User1 ${uniqueId}`,
      email: `user1${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'employee',
      isActive: true,
    })

    employee1 = await Employee.create({
      userId: user1.id,
      registrationNumber: `REG1${uniqueId}`,
      fullName: `Colaborador1 ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `colaborador1${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const user2 = await User.create({
      fullName: `User2 ${uniqueId}`,
      email: `user2${uniqueId}@empresa.com`,
      password: 'senha123',
      role: 'employee',
      isActive: true,
    })

    employee2 = await Employee.create({
      userId: user2.id,
      registrationNumber: `REG2${uniqueId}`,
      fullName: `Colaborador2 ${uniqueId}`,
      cpf: generateUniqueCPF(),
      email: `colaborador2${uniqueId}@empresa.com`,
      type: 'clt',
      departmentId: department.id,
      positionId: position.id,
      hireDate: DateTime.now(),
      status: 'active',
    })

    const category = await SkillCategory.create({
      name: `Category ${uniqueId}`,
      description: 'Test',
      displayOrder: 1,
      isActive: true,
    })

    skill1 = await Skill.create({
      categoryId: category.id,
      name: `Skill1 ${uniqueId}`,
      description: 'Skill 1',
      levelDescriptors: JSON.stringify({ 1: 'Básico', 5: 'Expert' }),
      isActive: true,
    })

    skill2 = await Skill.create({
      categoryId: category.id,
      name: `Skill2 ${uniqueId}`,
      description: 'Skill 2',
      levelDescriptors: JSON.stringify({ 1: 'Básico', 5: 'Expert' }),
      isActive: true,
    })
  })

  test('deve gerar skill gap report', async ({ assert }) => {
    // Arrange
    await EmployeeSkill.create({
      employeeId: employee1.id,
      skillId: skill1.id,
      currentLevel: 2,
      targetLevel: 5,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    // Act
    const report = await service.getSkillGapReport(employee1.id)

    // Assert
    assert.exists(report)
    assert.isArray(report)
    assert.isAtLeast(report.length, 1)
    assert.property(report[0], 'gap')
  })

  test('deve gerar matrix do departamento', async ({ assert }) => {
    // Arrange
    await EmployeeSkill.create({
      employeeId: employee1.id,
      skillId: skill1.id,
      currentLevel: 3,
      targetLevel: 5,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    await EmployeeSkill.create({
      employeeId: employee2.id,
      skillId: skill1.id,
      currentLevel: 4,
      targetLevel: 5,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    // Act
    const matrix = await service.getDepartmentSkillMatrix(department.id)

    // Assert
    assert.exists(matrix)
    assert.isArray(matrix)
    assert.isAtLeast(matrix.length, 2)
  })

  test('deve retornar distribuição de skills por nível', async ({ assert }) => {
    // Arrange
    await EmployeeSkill.create({
      employeeId: employee1.id,
      skillId: skill1.id,
      currentLevel: 3,
      targetLevel: 5,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    await EmployeeSkill.create({
      employeeId: employee2.id,
      skillId: skill1.id,
      currentLevel: 4,
      targetLevel: 5,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    // Act
    const distribution = await service.getSkillDistribution(skill1.id)

    // Assert
    assert.exists(distribution)
    assert.isArray(distribution)
    if (distribution.length > 0) {
      assert.property(distribution[0], 'level')
      assert.property(distribution[0], 'count')
    }
  })

  test('gap report deve incluir skills com gap > 0', async ({ assert }) => {
    // Arrange
    await EmployeeSkill.create({
      employeeId: employee1.id,
      skillId: skill1.id,
      currentLevel: 3,
      targetLevel: 5, // gap = 2
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    await EmployeeSkill.create({
      employeeId: employee1.id,
      skillId: skill2.id,
      currentLevel: 5,
      targetLevel: 5, // gap = 0
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    // Act
    const report = await service.getSkillGapReport(employee1.id)

    // Assert
    const gaps = report.filter((g) => g.gap > 0)
    assert.isAtLeast(gaps.length, 1)
  })

  test('matrix deve incluir apenas employees ativos do departamento', async ({ assert }) => {
    // Arrange
    await EmployeeSkill.create({
      employeeId: employee1.id,
      skillId: skill1.id,
      currentLevel: 3,
      targetLevel: 5,
      assessedBy: assessor.id,
      assessedAt: DateTime.now(),
    })

    employee2.status = 'terminated'
    await employee2.save()

    // Act
    const matrix = await service.getDepartmentSkillMatrix(department.id)

    // Assert
    const employeeIds = matrix.map((e) => e.employeeId)
    assert.include(employeeIds, employee1.id)
    assert.notInclude(employeeIds, employee2.id)
  })
})

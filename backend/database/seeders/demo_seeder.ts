import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import Employee from '#models/employee'
import TimeEntry from '#models/time_entry'
import Training from '#models/training'
import TrainingEnrollment from '#models/training_enrollment'
import Leave from '#models/leave'
import Notification from '#models/notification'
import SkillCategory from '#models/skill_category'
import Skill from '#models/skill'
import EmployeeSkill from '#models/employee_skill'
import CareerPath from '#models/career_path'
import CareerPathLevel from '#models/career_path_level'
import SuccessionPlan from '#models/succession_plan'
import OccupationalExam from '#models/occupational_exam'
import MedicalCertificate from '#models/medical_certificate'
import EngagementScore from '#models/engagement_score'
import TurnoverRecord from '#models/turnover_record'
import TalentPool from '#models/talent_pool'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    console.log('Iniciando seeder de demonstracao...')

    // ============================================================
    // 1. DEPARTAMENTOS E CARGOS
    // ============================================================
    console.log('Criando departamentos e cargos...')

    const deptTI = await Department.updateOrCreate(
      { name: 'Tecnologia da Informacao' },
      {
        name: 'Tecnologia da Informacao',
      }
    )

    const deptRH = await Department.updateOrCreate(
      { name: 'Recursos Humanos' },
      {
        name: 'Recursos Humanos',
      }
    )

    const deptFinanceiro = await Department.updateOrCreate(
      { name: 'Financeiro' },
      {
        name: 'Financeiro',
      }
    )

    // Cargos TI
    const posDevSenior = await Position.updateOrCreate(
      { title: 'Desenvolvedor Senior', departmentId: deptTI.id },
      {
        title: 'Desenvolvedor Senior',
        departmentId: deptTI.id,
      }
    )

    const posDevPleno = await Position.updateOrCreate(
      { title: 'Desenvolvedor Pleno', departmentId: deptTI.id },
      {
        title: 'Desenvolvedor Pleno',
        departmentId: deptTI.id,
      }
    )

    // Cargos RH
    const posAnalistaRH = await Position.updateOrCreate(
      { title: 'Analista de RH', departmentId: deptRH.id },
      {
        title: 'Analista de RH',
        departmentId: deptRH.id,
      }
    )

    // Cargos Financeiro
    const posContador = await Position.updateOrCreate(
      { title: 'Contador', departmentId: deptFinanceiro.id },
      {
        title: 'Contador',
        departmentId: deptFinanceiro.id,
      }
    )

    // ============================================================
    // 2. COLABORADORES
    // ============================================================
    console.log('Criando colaboradores...')

    // Busca usuarios existentes
    const users = await User.query().whereIn('email', [
      'joao.silva@sistema-rh.com',
      'ana.santos@sistema-rh.com',
      'carlos.oliveira@sistema-rh.com',
      'pedro.mendes@sistema-rh.com',
      'fernanda.lima@sistema-rh.com',
      'rafael.costa@sistema-rh.com',
      'patricia.alves@sistema-rh.com',
      'lucas.martins@sistema-rh.com',
      'juliana.rocha@sistema-rh.com',
      'bruno.fernandes@sistema-rh.com',
    ])

    const userMap = Object.fromEntries(users.map((u) => [u.email, u]))

    const employeesData = [
      {
        userId: userMap['joao.silva@sistema-rh.com']?.id,
        fullName: 'Joao Silva',
        email: 'joao.silva@sistema-rh.com',
        cpf: '123.456.789-01',
        type: 'clt' as const,
        departmentId: deptTI.id,
        positionId: posDevSenior.id,
        salary: 8000,
        hireDate: DateTime.now().minus({ months: 24 }),
      },
      {
        userId: userMap['ana.santos@sistema-rh.com']?.id,
        fullName: 'Ana Santos',
        email: 'ana.santos@sistema-rh.com',
        cpf: '234.567.890-12',
        type: 'clt' as const,
        departmentId: deptRH.id,
        positionId: posAnalistaRH.id,
        salary: 5500,
        hireDate: DateTime.now().minus({ months: 18 }),
      },
      {
        userId: userMap['carlos.oliveira@sistema-rh.com']?.id,
        fullName: 'Carlos Oliveira',
        email: 'carlos.oliveira@sistema-rh.com',
        cpf: '345.678.901-23',
        type: 'clt' as const,
        departmentId: deptTI.id,
        positionId: posDevPleno.id,
        salary: 6000,
        hireDate: DateTime.now().minus({ months: 12 }),
      },
      {
        userId: userMap['pedro.mendes@sistema-rh.com']?.id,
        fullName: 'Pedro Mendes',
        email: 'pedro.mendes@sistema-rh.com',
        cnpj: '12.345.678/0001-90',
        type: 'pj' as const,
        departmentId: deptTI.id,
        positionId: posDevSenior.id,
        salary: 10000,
        hireDate: DateTime.now().minus({ months: 36 }),
      },
      {
        userId: userMap['fernanda.lima@sistema-rh.com']?.id,
        fullName: 'Fernanda Lima',
        email: 'fernanda.lima@sistema-rh.com',
        cpf: '456.789.012-34',
        type: 'clt' as const,
        departmentId: deptFinanceiro.id,
        positionId: posContador.id,
        salary: 7000,
        hireDate: DateTime.now().minus({ months: 15 }),
      },
      {
        userId: userMap['rafael.costa@sistema-rh.com']?.id,
        fullName: 'Rafael Costa',
        email: 'rafael.costa@sistema-rh.com',
        cpf: '567.890.123-45',
        type: 'clt' as const,
        departmentId: deptTI.id,
        positionId: posDevPleno.id,
        salary: 5800,
        hireDate: DateTime.now().minus({ months: 9 }),
      },
      {
        userId: userMap['patricia.alves@sistema-rh.com']?.id,
        fullName: 'Patricia Alves',
        email: 'patricia.alves@sistema-rh.com',
        cpf: '678.901.234-56',
        type: 'clt' as const,
        departmentId: deptRH.id,
        positionId: posAnalistaRH.id,
        salary: 5200,
        hireDate: DateTime.now().minus({ months: 6 }),
      },
      {
        userId: userMap['lucas.martins@sistema-rh.com']?.id,
        fullName: 'Lucas Martins',
        email: 'lucas.martins@sistema-rh.com',
        cnpj: '23.456.789/0001-01',
        type: 'pj' as const,
        departmentId: deptTI.id,
        positionId: posDevSenior.id,
        salary: 11000,
        hireDate: DateTime.now().minus({ months: 48 }),
      },
      {
        userId: userMap['juliana.rocha@sistema-rh.com']?.id,
        fullName: 'Juliana Rocha',
        email: 'juliana.rocha@sistema-rh.com',
        cpf: '789.012.345-67',
        type: 'clt' as const,
        departmentId: deptFinanceiro.id,
        positionId: posContador.id,
        salary: 6800,
        hireDate: DateTime.now().minus({ months: 20 }),
      },
      {
        userId: userMap['bruno.fernandes@sistema-rh.com']?.id,
        fullName: 'Bruno Fernandes',
        email: 'bruno.fernandes@sistema-rh.com',
        cpf: '890.123.456-78',
        type: 'clt' as const,
        departmentId: deptTI.id,
        positionId: posDevPleno.id,
        salary: 5900,
        hireDate: DateTime.now().minus({ months: 8 }),
      },
    ]

    const employees: Employee[] = []
    for (const empData of employeesData) {
      const existing = await Employee.findBy('email', empData.email)
      if (!existing) {
        const emp = await Employee.create({
          ...empData,
          status: 'active',
          registrationNumber: `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        })
        employees.push(emp)
      } else {
        employees.push(existing)
      }
    }

    console.log(`${employees.length} colaboradores criados/existentes`)

    // ============================================================
    // 3. REGISTROS DE PONTO (ultimos 30 dias)
    // ============================================================
    console.log('Criando registros de ponto dos ultimos 30 dias...')

    let timeEntryCount = 0
    for (const employee of employees) {
      // Apenas colaboradores CLT tem ponto
      if (employee.type !== 'clt') continue

      for (let i = 29; i >= 0; i--) {
        const date = DateTime.now().minus({ days: i }).startOf('day')

        // Pula fins de semana
        if (date.weekday === 6 || date.weekday === 7) continue

        const clockIn = date.set({ hour: 8, minute: Math.floor(Math.random() * 15) })
        const lunchStart = date.set({ hour: 12, minute: 0 })
        const lunchEnd = date.set({ hour: 13, minute: 0 })
        const clockOut = date.set({ hour: 17, minute: Math.floor(Math.random() * 30) + 30 })

        const workedMinutes = (clockOut.diff(clockIn).as('minutes') - 60)
        const isLate = clockIn.hour > 8 || (clockIn.hour === 8 && clockIn.minute > 15)
        const lateMinutes = isLate ? Math.max(0, (clockIn.hour - 8) * 60 + clockIn.minute - 15) : 0

        const existing = await TimeEntry.query()
          .where('employeeId', employee.id)
          .where('date', date.toISODate()!)
          .first()

        if (!existing) {
          await TimeEntry.create({
            employeeId: employee.id,
            date: date,
            clockIn: clockIn,
            clockOut: clockOut,
            lunchStart: lunchStart,
            lunchEnd: lunchEnd,
            totalWorkedMinutes: Math.floor(workedMinutes),
            isLate: isLate,
            lateMinutes: lateMinutes,
            type: 'regular',
          })
          timeEntryCount++
        }
      }
    }

    console.log(`${timeEntryCount} registros de ponto criados`)

    // ============================================================
    // 4. TREINAMENTOS
    // ============================================================
    console.log('Criando treinamentos...')

    const admin = await User.findByOrFail('email', 'admin@sistema-rh.com')

    const training1 = await Training.updateOrCreate(
      { title: 'Seguranca da Informacao' },
      {
        title: 'Seguranca da Informacao',
        description: 'Treinamento obrigatorio sobre seguranca de dados e LGPD',
        type: 'online',
        category: 'Compliance',
        instructor: 'Carlos Seguranca',
        provider: 'InfoSec Academy',
        startDate: DateTime.now().minus({ days: 15 }),
        endDate: DateTime.now().plus({ days: 15 }),
        durationHours: 8,
        maxParticipants: 50,
        status: 'in_progress',
        isMandatory: true,
        createdBy: admin.id,
      }
    )

    const training2 = await Training.updateOrCreate(
      { title: 'TypeScript Avancado' },
      {
        title: 'TypeScript Avancado',
        description: 'Curso avancado de TypeScript para desenvolvedores',
        type: 'online',
        category: 'Tecnologia',
        instructor: 'Maria TypeScript',
        provider: 'Dev Academy',
        startDate: DateTime.now().minus({ days: 60 }),
        endDate: DateTime.now().minus({ days: 30 }),
        durationHours: 24,
        maxParticipants: 20,
        status: 'completed',
        isMandatory: false,
        createdBy: admin.id,
      }
    )

    // Inscricoes no treinamento 1 (em andamento)
    const empsTI = employees.filter((e) => e.departmentId === deptTI.id)
    for (const emp of empsTI) {
      const existing = await TrainingEnrollment.query()
        .where('trainingId', training1.id)
        .where('employeeId', emp.id)
        .first()

      if (!existing) {
        await TrainingEnrollment.create({
          trainingId: training1.id,
          employeeId: emp.id,
          status: Math.random() > 0.5 ? 'in_progress' : 'enrolled',
          enrolledAt: DateTime.now().minus({ days: 10 }),
          completedAt: null,
        })
      }
    }

    // Inscricoes no treinamento 2 (concluido)
    for (let i = 0; i < 3 && i < empsTI.length; i++) {
      const existing = await TrainingEnrollment.query()
        .where('trainingId', training2.id)
        .where('employeeId', empsTI[i].id)
        .first()

      if (!existing) {
        await TrainingEnrollment.create({
          trainingId: training2.id,
          employeeId: empsTI[i].id,
          status: 'completed',
          enrolledAt: DateTime.now().minus({ days: 65 }),
          completedAt: DateTime.now().minus({ days: 30 }),
          score: 8.5 + Math.random() * 1.5,
        })
      }
    }

    console.log('Treinamentos criados')

    // ============================================================
    // 5. SOLICITACOES DE FERIAS
    // ============================================================
    console.log('Criando solicitacoes de ferias...')

    const manager = await User.findByOrFail('email', 'gerente@sistema-rh.com')

    // Ferias aprovadas
    if (employees[0]) {
      const existing1 = await Leave.query()
        .where('employeeId', employees[0].id)
        .where('startDate', DateTime.now().plus({ days: 30 }).toISODate()!)
        .first()

      if (!existing1) {
        await Leave.create({
          employeeId: employees[0].id,
          type: 'vacation',
          status: 'approved',
          startDate: DateTime.now().plus({ days: 30 }),
          endDate: DateTime.now().plus({ days: 44 }),
          daysCount: 15,
          isPaid: true,
          sellDays: 0,
          requestedBy: employees[0].userId,
          approvedBy: manager.id,
          approvedAt: DateTime.now().minus({ days: 5 }),
        })
      }
    }

    // Ferias pendentes
    if (employees[1]) {
      const existing2 = await Leave.query()
        .where('employeeId', employees[1].id)
        .where('startDate', DateTime.now().plus({ days: 60 }).toISODate()!)
        .first()

      if (!existing2) {
        await Leave.create({
          employeeId: employees[1].id,
          type: 'vacation',
          status: 'pending',
          startDate: DateTime.now().plus({ days: 60 }),
          endDate: DateTime.now().plus({ days: 74 }),
          daysCount: 15,
          isPaid: true,
          sellDays: 5,
          requestedBy: employees[1].userId,
        })
      }
    }

    // Licenca rejeitada
    if (employees[2]) {
      const existing3 = await Leave.query()
        .where('employeeId', employees[2].id)
        .where('startDate', DateTime.now().plus({ days: 10 }).toISODate()!)
        .first()

      if (!existing3) {
        await Leave.create({
          employeeId: employees[2].id,
          type: 'medical',
          status: 'rejected',
          startDate: DateTime.now().plus({ days: 10 }),
          endDate: DateTime.now().plus({ days: 12 }),
          daysCount: 3,
          isPaid: true,
          sellDays: 0,
          requestedBy: employees[2].userId,
          approvedBy: manager.id,
          approvedAt: DateTime.now().minus({ days: 1 }),
          rejectionReason: 'Periodo incompativel com projeto em andamento',
        })
      }
    }

    console.log('Solicitacoes de ferias criadas')

    // ============================================================
    // 6. NOTIFICACOES DE EXEMPLO
    // ============================================================
    console.log('Criando notificacoes de exemplo...')

    const notificationsData = [
      {
        userId: employees[0]?.userId,
        type: 'leave_approved' as const,
        title: 'Ferias Aprovadas',
        message: 'Suas ferias foram aprovadas para o periodo de 30 dias a partir de hoje.',
      },
      {
        userId: employees[1]?.userId,
        type: 'general' as const,
        title: 'Novo Treinamento Obrigatorio',
        message: 'Voce foi inscrito no treinamento de Seguranca da Informacao.',
      },
      {
        userId: employees[2]?.userId,
        type: 'leave_rejected' as const,
        title: 'Licenca Rejeitada',
        message: 'Sua solicitacao de licenca medica foi rejeitada. Entre em contato com o RH.',
      },
      {
        userId: employees[0]?.userId,
        type: 'document_uploaded' as const,
        title: 'Novo Documento Disponivel',
        message: 'Um novo contracheque foi disponibilizado.',
      },
      {
        userId: employees[1]?.userId,
        type: 'general' as const,
        title: 'Atualizacao do Sistema',
        message: 'O sistema de RH passou por atualizacoes. Confira as novidades!',
      },
    ]

    for (const notif of notificationsData) {
      if (notif.userId) {
        try {
          const existing = await Notification.query()
            .where('userId', notif.userId)
            .where('type', notif.type)
            .where('title', notif.title)
            .first()

          if (!existing) {
            await Notification.create({
              userId: notif.userId,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              isRead: Math.random() > 0.5,
            })
          }
        } catch (error) {
          console.log(`Erro ao criar notificacao: ${error.message}`)
        }
      }
    }

    console.log('Notificacoes criadas')

    // ============================================================
    // 7. SKILL CATEGORIES E SKILLS
    // ============================================================
    console.log('Criando skill categories e skills...')

    const skillCategories = [
      { name: 'Programação', description: 'Linguagens e frameworks de programação' },
      { name: 'Soft Skills', description: 'Habilidades comportamentais' },
      { name: 'Vendas', description: 'Técnicas e processos de vendas' },
      { name: 'Financeiro', description: 'Conhecimentos financeiros e contábeis' },
      { name: 'Logística', description: 'Gestão de operações e supply chain' },
    ]

    const createdCategories: SkillCategory[] = []
    const createdSkills: Skill[] = []

    for (const [idx, catData] of skillCategories.entries()) {
      const category = await SkillCategory.updateOrCreate(
        { name: catData.name },
        {
          name: catData.name,
          description: catData.description,
          displayOrder: idx + 1,
          isActive: true,
        }
      )
      createdCategories.push(category)

      // 3-4 skills por categoria
      const skillsForCategory: Array<{ name: string; description: string }> = []

      if (catData.name === 'Programação') {
        skillsForCategory.push(
          { name: 'JavaScript', description: 'Linguagem JavaScript e TypeScript' },
          { name: 'Node.js', description: 'Backend com Node.js' },
          { name: 'Vue.js', description: 'Frontend com Vue.js' },
          { name: 'SQL', description: 'Bancos de dados relacionais' }
        )
      } else if (catData.name === 'Soft Skills') {
        skillsForCategory.push(
          { name: 'Comunicação', description: 'Habilidades de comunicação' },
          { name: 'Liderança', description: 'Liderança de equipes' },
          { name: 'Gestão de Tempo', description: 'Organização e priorização' },
          { name: 'Resolução de Problemas', description: 'Pensamento crítico' }
        )
      } else if (catData.name === 'Vendas') {
        skillsForCategory.push(
          { name: 'Prospecção', description: 'Identificação de leads' },
          { name: 'Negociação', description: 'Técnicas de negociação' },
          { name: 'CRM', description: 'Uso de ferramentas CRM' }
        )
      } else if (catData.name === 'Financeiro') {
        skillsForCategory.push(
          { name: 'Contabilidade', description: 'Princípios contábeis' },
          { name: 'Análise Financeira', description: 'Análise de balanços' },
          { name: 'Excel Avançado', description: 'Excel para finanças' }
        )
      } else if (catData.name === 'Logística') {
        skillsForCategory.push(
          { name: 'Supply Chain', description: 'Gestão da cadeia de suprimentos' },
          { name: 'Gestão de Estoque', description: 'Controle de inventário' },
          { name: 'Transporte', description: 'Logística de transporte' }
        )
      }

      for (const skillData of skillsForCategory) {
        const skill = await Skill.updateOrCreate(
          { categoryId: category.id, name: skillData.name },
          {
            categoryId: category.id,
            name: skillData.name,
            description: skillData.description,
            isActive: true,
          }
        )
        createdSkills.push(skill)
      }
    }

    console.log(
      `${createdCategories.length} categorias e ${createdSkills.length} skills criadas`
    )

    // ============================================================
    // 8. EMPLOYEE SKILLS (15 colaboradores aleatórios)
    // ============================================================
    console.log('Criando employee skills...')

    const selectedEmployees = employees.slice(0, Math.min(15, employees.length))

    for (const employee of selectedEmployees) {
      // Cada colaborador terá 2-4 skills aleatórias
      const numSkills = Math.floor(Math.random() * 3) + 2
      const randomSkills = createdSkills
        .sort(() => Math.random() - 0.5)
        .slice(0, numSkills)

      for (const skill of randomSkills) {
        const existing = await EmployeeSkill.query()
          .where('employeeId', employee.id)
          .where('skillId', skill.id)
          .first()

        if (!existing) {
          await EmployeeSkill.create({
            employeeId: employee.id,
            skillId: skill.id,
            currentLevel: Math.floor(Math.random() * 5) + 1, // 1-5
            targetLevel: Math.floor(Math.random() * 2) + 4, // 4-5
            assessedBy: admin.id,
            assessedAt: DateTime.now().minus({ days: Math.floor(Math.random() * 90) }),
          })
        }
      }
    }

    console.log('Employee skills criadas')

    // ============================================================
    // 9. CAREER PATHS E LEVELS
    // ============================================================
    console.log('Criando career paths...')

    const careerPathDev = await CareerPath.updateOrCreate(
      { name: 'Desenvolvimento de Software' },
      {
        name: 'Desenvolvimento de Software',
        description: 'Carreira técnica em desenvolvimento',
        departmentId: deptTI.id,
        isActive: true,
        createdBy: admin.id,
      }
    )

    const careerPathGestao = await CareerPath.updateOrCreate(
      { name: 'Gestão' },
      {
        name: 'Gestão',
        description: 'Carreira em liderança e gestão',
        departmentId: null,
        isActive: true,
        createdBy: admin.id,
      }
    )

    // Levels para Desenvolvimento
    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathDev.id, levelOrder: 1 },
      {
        careerPathId: careerPathDev.id,
        levelOrder: 1,
        title: 'Junior',
        description: 'Desenvolvedor iniciante - Conhecimentos básicos de programação',
        salaryRangeMin: 3000,
        salaryRangeMax: 5000,
        minExperienceMonths: 0,
      }
    )

    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathDev.id, levelOrder: 2 },
      {
        careerPathId: careerPathDev.id,
        levelOrder: 2,
        title: 'Pleno',
        description: 'Desenvolvedor intermediário - 2+ anos de experiência',
        salaryRangeMin: 6000,
        salaryRangeMax: 10000,
        minExperienceMonths: 24,
      }
    )

    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathDev.id, levelOrder: 3 },
      {
        careerPathId: careerPathDev.id,
        levelOrder: 3,
        title: 'Senior',
        description: 'Desenvolvedor avançado - 5+ anos de experiência',
        salaryRangeMin: 10000,
        salaryRangeMax: 15000,
        minExperienceMonths: 60,
      }
    )

    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathDev.id, levelOrder: 4 },
      {
        careerPathId: careerPathDev.id,
        levelOrder: 4,
        title: 'Tech Lead',
        description: 'Líder técnico - 7+ anos, liderança técnica',
        salaryRangeMin: 15000,
        salaryRangeMax: 25000,
        minExperienceMonths: 84,
      }
    )

    // Levels para Gestão
    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathGestao.id, levelOrder: 1 },
      {
        careerPathId: careerPathGestao.id,
        levelOrder: 1,
        title: 'Coordenador',
        description: 'Coordenador de equipe - Experiência técnica + liderança',
        salaryRangeMin: 8000,
        salaryRangeMax: 12000,
        minExperienceMonths: 36,
      }
    )

    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathGestao.id, levelOrder: 2 },
      {
        careerPathId: careerPathGestao.id,
        levelOrder: 2,
        title: 'Gerente',
        description: 'Gerente de área - 3+ anos em gestão',
        salaryRangeMin: 12000,
        salaryRangeMax: 18000,
        minExperienceMonths: 36,
      }
    )

    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathGestao.id, levelOrder: 3 },
      {
        careerPathId: careerPathGestao.id,
        levelOrder: 3,
        title: 'Diretor',
        description: 'Diretor de departamento - 5+ anos em gestão',
        salaryRangeMin: 18000,
        salaryRangeMax: 30000,
        minExperienceMonths: 60,
      }
    )

    await CareerPathLevel.updateOrCreate(
      { careerPathId: careerPathGestao.id, levelOrder: 4 },
      {
        careerPathId: careerPathGestao.id,
        levelOrder: 4,
        title: 'VP',
        description: 'Vice-Presidente - 10+ anos em liderança',
        salaryRangeMin: 30000,
        salaryRangeMax: 50000,
        minExperienceMonths: 120,
      }
    )

    console.log('Career paths criados')

    // ============================================================
    // 10. SUCCESSION PLANS (3)
    // ============================================================
    console.log('Criando succession plans...')

    if (employees.length >= 5) {
      await SuccessionPlan.updateOrCreate(
        { positionId: posDevSenior.id, successorId: employees[0].id },
        {
          positionId: posDevSenior.id,
          currentHolderId: employees[0].id,
          successorId: employees[2].id,
          readiness: 'ready_1_year',
          priority: 'high',
          developmentActions: 'Participação em decisões estratégicas, mentoria',
          createdBy: admin.id,
        }
      )

      await SuccessionPlan.updateOrCreate(
        { positionId: posAnalistaRH.id, successorId: employees[1].id },
        {
          positionId: posAnalistaRH.id,
          currentHolderId: employees[1].id,
          successorId: employees[6].id,
          readiness: 'ready_now',
          priority: 'medium',
          developmentActions: 'Acompanhamento de processos complexos',
          createdBy: admin.id,
        }
      )

      await SuccessionPlan.updateOrCreate(
        { positionId: posContador.id, successorId: employees[4].id },
        {
          positionId: posContador.id,
          currentHolderId: employees[4].id,
          successorId: employees[8].id,
          readiness: 'ready_2_years',
          priority: 'medium',
          developmentActions: 'Curso de liderança, gestão de equipes',
          createdBy: admin.id,
        }
      )
    }

    console.log('Succession plans criados')

    // ============================================================
    // 11. OCCUPATIONAL EXAMS (5)
    // ============================================================
    console.log('Criando occupational exams...')

    if (employees.length >= 5) {
      await OccupationalExam.updateOrCreate(
        { employeeId: employees[0].id, type: 'admission' },
        {
          employeeId: employees[0].id,
          type: 'admission',
          examDate: DateTime.now().minus({ years: 2 }),
          result: 'fit',
          status: 'completed',
          doctorName: 'Dr. Roberto Silva',
          crm: '123456',
          clinicName: 'Clínica Vida',
          createdBy: admin.id,
        }
      )

      await OccupationalExam.updateOrCreate(
        { employeeId: employees[1].id, type: 'periodic', examDate: DateTime.now().minus({ days: 30 }).toISODate()! },
        {
          employeeId: employees[1].id,
          type: 'periodic',
          examDate: DateTime.now().minus({ days: 30 }),
          expiryDate: DateTime.now().plus({ year: 1 }),
          result: 'fit',
          status: 'completed',
          doctorName: 'Dr. Roberto Silva',
          crm: '123456',
          clinicName: 'Clínica Vida',
          createdBy: admin.id,
        }
      )

      const scheduledDate = DateTime.now().plus({ days: 15 })
      await OccupationalExam.updateOrCreate(
        { employeeId: employees[2].id, type: 'periodic', examDate: scheduledDate.toISODate()! },
        {
          employeeId: employees[2].id,
          type: 'periodic',
          examDate: scheduledDate,
          result: 'fit',
          status: 'scheduled',
          doctorName: 'Dr. Roberto Silva',
          crm: '123456',
          clinicName: 'Clínica Vida',
          createdBy: admin.id,
        }
      )

      await OccupationalExam.updateOrCreate(
        { employeeId: employees[3].id, type: 'periodic', status: 'expired' },
        {
          employeeId: employees[3].id,
          type: 'periodic',
          examDate: DateTime.now().minus({ years: 2 }),
          expiryDate: DateTime.now().minus({ year: 1 }),
          result: 'fit',
          status: 'expired',
          doctorName: 'Dr. Roberto Silva',
          crm: '123456',
          clinicName: 'Clínica Vida',
          createdBy: admin.id,
        }
      )

      await OccupationalExam.updateOrCreate(
        { employeeId: employees[4].id, type: 'role_change' },
        {
          employeeId: employees[4].id,
          type: 'role_change',
          examDate: DateTime.now().minus({ days: 5 }),
          result: 'fit_with_restrictions',
          restrictions: 'Não carregar peso superior a 10kg',
          status: 'completed',
          doctorName: 'Dr. Roberto Silva',
          crm: '123456',
          clinicName: 'Clínica Vida',
          createdBy: admin.id,
        }
      )
    }

    console.log('Occupational exams criados')

    // ============================================================
    // 12. MEDICAL CERTIFICATES (3)
    // ============================================================
    console.log('Criando medical certificates...')

    if (employees.length >= 7) {
      await MedicalCertificate.updateOrCreate(
        { employeeId: employees[5].id, startDate: DateTime.now().minus({ days: 10 }).toISODate()! },
        {
          employeeId: employees[5].id,
          startDate: DateTime.now().minus({ days: 10 }),
          endDate: DateTime.now().minus({ days: 8 }),
          daysCount: 3,
          cidCode: 'J06.9',
          cidDescription: 'Infecção aguda das vias aéreas superiores',
          doctorName: 'Dr. Ana Paula',
          crm: '654321',
          status: 'approved',
          approvedBy: admin.id,
        }
      )

      await MedicalCertificate.updateOrCreate(
        { employeeId: employees[6].id, startDate: DateTime.now().minus({ days: 2 }).toISODate()! },
        {
          employeeId: employees[6].id,
          startDate: DateTime.now().minus({ days: 2 }),
          endDate: DateTime.now(),
          daysCount: 3,
          doctorName: 'Dr. Carlos Eduardo',
          crm: '789012',
          status: 'pending',
        }
      )

      if (employees.length >= 8) {
        await MedicalCertificate.updateOrCreate(
          { employeeId: employees[7].id, startDate: DateTime.now().minus({ days: 30 }).toISODate()! },
          {
            employeeId: employees[7].id,
            startDate: DateTime.now().minus({ days: 30 }),
            endDate: DateTime.now().minus({ days: 25 }),
            daysCount: 6,
            cidCode: 'A09',
            cidDescription: 'Gastroenterite',
            doctorName: 'Dr. Mariana Costa',
            crm: '345678',
            status: 'approved',
            approvedBy: admin.id,
          }
        )
      }
    }

    console.log('Medical certificates criados')

    // ============================================================
    // 13. ENGAGEMENT SCORES (10)
    // ============================================================
    console.log('Criando engagement scores...')

    const currentMonth = DateTime.now().month
    const currentYear = DateTime.now().year

    for (let i = 0; i < Math.min(10, employees.length); i++) {
      const employee = employees[i]
      const attendanceScore = Math.floor(Math.random() * 30) + 70
      const performanceScore = Math.floor(Math.random() * 30) + 70
      const trainingScore = Math.floor(Math.random() * 30) + 70
      const tenureScore = Math.floor(Math.random() * 30) + 70
      const leaveScore = Math.floor(Math.random() * 30) + 70

      const overallScore =
        (attendanceScore + performanceScore + trainingScore + tenureScore + leaveScore) / 5

      await EngagementScore.updateOrCreate(
        { employeeId: employee.id, referenceMonth: currentMonth, referenceYear: currentYear },
        {
          employeeId: employee.id,
          score: Math.round(overallScore),
          attendanceScore,
          performanceScore,
          trainingScore,
          tenureScore,
          leaveScore,
          referenceMonth: currentMonth,
          referenceYear: currentYear,
          calculatedAt: DateTime.now(),
        }
      )
    }

    console.log('Engagement scores criados')

    // ============================================================
    // 14. TURNOVER RECORDS (3)
    // ============================================================
    console.log('Criando turnover records...')

    if (employees.length >= 3) {
      await TurnoverRecord.updateOrCreate(
        { employeeId: employees[0].id, exitDate: DateTime.now().minus({ months: 2 }).toISODate()! },
        {
          employeeId: employees[0].id,
          type: 'voluntary',
          reason: 'Proposta melhor em outra empresa',
          exitDate: DateTime.now().minus({ months: 2 }),
          departmentId: employees[0].departmentId,
          positionId: employees[0].positionId,
          tenureMonths: 18,
          salaryAtExit: employees[0].salary,
          exitInterviewDone: true,
          exitInterviewNotes: 'Saiu em bons termos, busca crescimento profissional',
        }
      )

      await TurnoverRecord.updateOrCreate(
        { employeeId: employees[1].id, exitDate: DateTime.now().minus({ months: 1 }).toISODate()! },
        {
          employeeId: employees[1].id,
          type: 'involuntary',
          reason: 'Baixo desempenho',
          exitDate: DateTime.now().minus({ months: 1 }),
          departmentId: employees[1].departmentId,
          positionId: employees[1].positionId,
          tenureMonths: 6,
          salaryAtExit: employees[1].salary,
          exitInterviewDone: false,
        }
      )

      await TurnoverRecord.updateOrCreate(
        { employeeId: employees[2].id, exitDate: DateTime.now().minus({ months: 3 }).toISODate()! },
        {
          employeeId: employees[2].id,
          type: 'retirement',
          reason: 'Aposentadoria',
          exitDate: DateTime.now().minus({ months: 3 }),
          departmentId: employees[2].departmentId,
          positionId: employees[2].positionId,
          tenureMonths: 120,
          salaryAtExit: employees[2].salary,
          exitInterviewDone: true,
          exitInterviewNotes: 'Excelente colaborador, anos de casa',
        }
      )
    }

    console.log('Turnover records criados')

    // ============================================================
    // 15. TALENT POOL (5)
    // ============================================================
    console.log('Criando talent pool entries...')

    await TalentPool.updateOrCreate(
      { email: 'roberto.alves@email.com' },
      {
        fullName: 'Roberto Alves',
        email: 'roberto.alves@email.com',
        phone: '(11) 98888-7777',
        linkedinUrl: 'https://linkedin.com/in/roberto-alves',
        source: 'linkedin',
        status: 'active',
        notes: 'Desenvolvedor senior com experiência em Vue.js',
        experienceYears: 8,
        salaryExpectation: 13000,
        availability: '30_days',
        addedBy: admin.id,
      }
    )

    await TalentPool.updateOrCreate(
      { email: 'sandra.oliveira@email.com' },
      {
        fullName: 'Sandra Oliveira',
        email: 'sandra.oliveira@email.com',
        phone: '(11) 97777-6666',
        source: 'referral',
        status: 'contacted',
        notes: 'Especialista em vendas B2B',
        experienceYears: 5,
        salaryExpectation: 8000,
        availability: 'immediate',
        addedBy: admin.id,
      }
    )

    await TalentPool.updateOrCreate(
      { email: 'eduardo.campos@email.com' },
      {
        fullName: 'Eduardo Campos',
        email: 'eduardo.campos@email.com',
        phone: '(11) 96666-5555',
        linkedinUrl: 'https://linkedin.com/in/eduardo-campos',
        source: 'event',
        status: 'interviewing',
        notes: 'Conheceu em evento de tecnologia, interessado em posição de Tech Lead',
        experienceYears: 10,
        salaryExpectation: 18000,
        availability: '60_days',
        addedBy: admin.id,
      }
    )

    await TalentPool.updateOrCreate(
      { email: 'vanessa.lima@email.com' },
      {
        fullName: 'Vanessa Lima',
        email: 'vanessa.lima@email.com',
        phone: '(11) 95555-4444',
        source: 'spontaneous',
        status: 'active',
        notes: 'Candidatura espontânea, perfil interessante para RH',
        experienceYears: 3,
        salaryExpectation: 5500,
        availability: '15_days',
        addedBy: admin.id,
      }
    )

    await TalentPool.updateOrCreate(
      { email: 'henrique.costa@email.com' },
      {
        fullName: 'Henrique Costa',
        email: 'henrique.costa@email.com',
        phone: '(11) 94444-3333',
        linkedinUrl: 'https://linkedin.com/in/henrique-costa',
        source: 'recruitment',
        status: 'hired',
        notes: 'Contratado para posição de Analista Financeiro',
        experienceYears: 4,
        salaryExpectation: 7000,
        availability: 'immediate',
        addedBy: admin.id,
      }
    )

    console.log('Talent pool entries criados')

    console.log('Seeder de demonstracao concluido!')
  }
}

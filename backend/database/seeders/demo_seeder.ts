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
import TalentPoolTag from '#models/talent_pool_tag'
import ChecklistTemplate from '#models/checklist_template'
import ChecklistTemplateItem from '#models/checklist_template_item'
import EmployeeChecklist from '#models/employee_checklist'
import EmployeeChecklistItem from '#models/employee_checklist_item'
import Survey from '#models/survey'
import SurveyQuestion from '#models/survey_question'
import SurveyResponse from '#models/survey_response'
import SurveyAnswer from '#models/survey_answer'
import DocumentTemplate from '#models/document_template'
import AutomatedCommunication from '#models/automated_communication'
import CommunicationLog from '#models/communication_log'
import AnalyticsSnapshot from '#models/analytics_snapshot'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

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
        { employeeId: employees[1].id, type: 'periodic', examDate: DateTime.now().minus({ days: 30 }) },
        {
          employeeId: employees[1].id,
          type: 'periodic',
          examDate: DateTime.now().minus({ days: 30 }),
          expiryDate: DateTime.now().plus({ years: 1 }),
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
        { employeeId: employees[2].id, type: 'periodic', examDate: scheduledDate },
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
          expiryDate: DateTime.now().minus({ years: 1 }),
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
        { employeeId: employees[5].id, startDate: DateTime.now().minus({ days: 10 }) },
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
        { employeeId: employees[6].id, startDate: DateTime.now().minus({ days: 2 }) },
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
          { employeeId: employees[7].id, startDate: DateTime.now().minus({ days: 30 }) },
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
        { employeeId: employees[0].id, exitDate: DateTime.now().minus({ months: 2 }) },
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
        { employeeId: employees[1].id, exitDate: DateTime.now().minus({ months: 1 }) },
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
        { employeeId: employees[2].id, exitDate: DateTime.now().minus({ months: 3 }) },
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

    // ============================================================
    // 16. TALENT POOL TAGS + PIVOT
    // ============================================================
    console.log('Criando talent pool tags...')

    const tagDev = await TalentPoolTag.updateOrCreate(
      { name: 'Desenvolvimento' },
      { name: 'Desenvolvimento', color: '#3B82F6' }
    )

    const tagDesign = await TalentPoolTag.updateOrCreate(
      { name: 'Design' },
      { name: 'Design', color: '#8B5CF6' }
    )

    const tagGestao = await TalentPoolTag.updateOrCreate(
      { name: 'Gestao' },
      { name: 'Gestao', color: '#10B981' }
    )

    const tagFinanceiro = await TalentPoolTag.updateOrCreate(
      { name: 'Financeiro' },
      { name: 'Financeiro', color: '#F59E0B' }
    )

    const tagRH = await TalentPoolTag.updateOrCreate(
      { name: 'RH' },
      { name: 'RH', color: '#EF4444' }
    )

    const tagSenior = await TalentPoolTag.updateOrCreate(
      { name: 'Senior' },
      { name: 'Senior', color: '#6366F1' }
    )

    const tagRemoto = await TalentPoolTag.updateOrCreate(
      { name: 'Remoto' },
      { name: 'Remoto', color: '#14B8A6' }
    )

    // Associar tags aos talent pool entries
    const talentPools = await TalentPool.query().orderBy('id', 'asc').limit(5)
    const tagSets = [
      [tagDev.id, tagSenior.id, tagRemoto.id],
      [tagGestao.id, tagDesign.id],
      [tagDev.id, tagSenior.id],
      [tagRH.id],
      [tagFinanceiro.id],
    ]

    for (let i = 0; i < Math.min(talentPools.length, tagSets.length); i++) {
      const tp = talentPools[i]
      for (const tagId of tagSets[i]) {
        const existing = await Database.from('talent_pool_tag_pivot')
          .where('talent_pool_id', tp.id)
          .where('tag_id', tagId)
          .first()

        if (!existing) {
          await Database.table('talent_pool_tag_pivot').insert({
            talent_pool_id: tp.id,
            tag_id: tagId,
          })
        }
      }
    }

    console.log('Talent pool tags criados')

    // ============================================================
    // 17. CHECKLIST TEMPLATES + ITEMS
    // ============================================================
    console.log('Criando checklist templates...')

    const templateOnboarding = await ChecklistTemplate.updateOrCreate(
      { name: 'Onboarding Padrao' },
      {
        name: 'Onboarding Padrao',
        type: 'onboarding',
        description: 'Checklist padrao para integracao de novos colaboradores',
        isActive: true,
        createdBy: admin.id,
      }
    )

    const onboardingItems = [
      { title: 'Criar conta de email corporativo', responsibleRole: 'it' as const, dueDays: 1, order: 1, isRequired: true },
      { title: 'Configurar estacao de trabalho', responsibleRole: 'it' as const, dueDays: 1, order: 2, isRequired: true },
      { title: 'Entregar cracha e chaves', responsibleRole: 'hr' as const, dueDays: 1, order: 3, isRequired: true },
      { title: 'Apresentar equipe e areas', responsibleRole: 'manager' as const, dueDays: 2, order: 4, isRequired: true },
      { title: 'Assinar contrato de trabalho', responsibleRole: 'hr' as const, dueDays: 1, order: 5, isRequired: true },
      { title: 'Realizar treinamento de seguranca', responsibleRole: 'hr' as const, dueDays: 5, order: 6, isRequired: true },
      { title: 'Configurar acessos aos sistemas', responsibleRole: 'it' as const, dueDays: 2, order: 7, isRequired: true },
      { title: 'Reuniao de alinhamento com gestor', responsibleRole: 'manager' as const, dueDays: 3, order: 8, isRequired: true },
      { title: 'Preencher formulario de dados pessoais', responsibleRole: 'employee' as const, dueDays: 3, order: 9, isRequired: true },
      { title: 'Tour pelo escritorio', responsibleRole: 'hr' as const, dueDays: 1, order: 10, isRequired: false },
    ]

    for (const item of onboardingItems) {
      await ChecklistTemplateItem.updateOrCreate(
        { templateId: templateOnboarding.id, title: item.title },
        { ...item, templateId: templateOnboarding.id, description: null }
      )
    }

    const templateOffboarding = await ChecklistTemplate.updateOrCreate(
      { name: 'Offboarding Padrao' },
      {
        name: 'Offboarding Padrao',
        type: 'offboarding',
        description: 'Checklist padrao para desligamento de colaboradores',
        isActive: true,
        createdBy: admin.id,
      }
    )

    const offboardingItems = [
      { title: 'Revogar acessos aos sistemas', responsibleRole: 'it' as const, dueDays: 1, order: 1, isRequired: true },
      { title: 'Devolver equipamentos (notebook, monitor)', responsibleRole: 'it' as const, dueDays: 3, order: 2, isRequired: true },
      { title: 'Devolver cracha e chaves', responsibleRole: 'hr' as const, dueDays: 1, order: 3, isRequired: true },
      { title: 'Realizar entrevista de desligamento', responsibleRole: 'hr' as const, dueDays: 5, order: 4, isRequired: true },
      { title: 'Calcular rescisao', responsibleRole: 'hr' as const, dueDays: 10, order: 5, isRequired: true },
      { title: 'Transferir responsabilidades', responsibleRole: 'manager' as const, dueDays: 5, order: 6, isRequired: true },
      { title: 'Desativar email corporativo', responsibleRole: 'it' as const, dueDays: 1, order: 7, isRequired: true },
    ]

    for (const item of offboardingItems) {
      await ChecklistTemplateItem.updateOrCreate(
        { templateId: templateOffboarding.id, title: item.title },
        { ...item, templateId: templateOffboarding.id, description: null }
      )
    }

    const templateOnboardingTI = await ChecklistTemplate.updateOrCreate(
      { name: 'Onboarding TI' },
      {
        name: 'Onboarding TI',
        type: 'onboarding',
        description: 'Checklist especifico para profissionais de tecnologia',
        isActive: true,
        createdBy: admin.id,
      }
    )

    const onboardingTIItems = [
      { title: 'Setup do ambiente de desenvolvimento', responsibleRole: 'it' as const, dueDays: 2, order: 1, isRequired: true },
      { title: 'Acesso ao repositorio Git', responsibleRole: 'it' as const, dueDays: 1, order: 2, isRequired: true },
      { title: 'Acesso ao Jira/Trello', responsibleRole: 'it' as const, dueDays: 1, order: 3, isRequired: true },
      { title: 'Apresentacao da arquitetura do sistema', responsibleRole: 'manager' as const, dueDays: 5, order: 4, isRequired: true },
      { title: 'Code review do primeiro PR', responsibleRole: 'manager' as const, dueDays: 10, order: 5, isRequired: true },
      { title: 'Leitura da documentacao tecnica', responsibleRole: 'employee' as const, dueDays: 5, order: 6, isRequired: false },
    ]

    for (const item of onboardingTIItems) {
      await ChecklistTemplateItem.updateOrCreate(
        { templateId: templateOnboardingTI.id, title: item.title },
        { ...item, templateId: templateOnboardingTI.id, description: null }
      )
    }

    console.log('Checklist templates criados')

    // ============================================================
    // 18. EMPLOYEE CHECKLISTS + ITEMS (atribuidos a colaboradores)
    // ============================================================
    console.log('Criando employee checklists...')

    // Carregar items do template de onboarding
    const onbTemplateItems = await ChecklistTemplateItem.query()
      .where('templateId', templateOnboarding.id)
      .orderBy('order', 'asc')

    if (employees.length >= 4) {
      // Checklist completo para employee[5] (Patricia - contratada ha 6 meses)
      const checklist1 = await EmployeeChecklist.updateOrCreate(
        { employeeId: employees[6]?.id || employees[0].id, templateId: templateOnboarding.id },
        {
          employeeId: employees[6]?.id || employees[0].id,
          templateId: templateOnboarding.id,
          type: 'onboarding',
          status: 'completed',
          startedAt: DateTime.now().minus({ months: 6 }),
          completedAt: DateTime.now().minus({ months: 5, days: 20 }),
          createdBy: admin.id,
        }
      )

      // Criar items todos completos
      for (const tplItem of onbTemplateItems) {
        await EmployeeChecklistItem.updateOrCreate(
          { checklistId: checklist1.id, templateItemId: tplItem.id },
          {
            checklistId: checklist1.id,
            templateItemId: tplItem.id,
            title: tplItem.title,
            description: tplItem.description,
            responsibleRole: tplItem.responsibleRole,
            status: 'completed',
            completedBy: admin.id,
            completedAt: DateTime.now().minus({ months: 5, days: 20 }),
            order: tplItem.order,
          }
        )
      }

      // Checklist em andamento para employee[9] (Bruno - contratado ha 8 meses)
      const checklist2 = await EmployeeChecklist.updateOrCreate(
        { employeeId: employees[9]?.id || employees[1].id, templateId: templateOnboarding.id },
        {
          employeeId: employees[9]?.id || employees[1].id,
          templateId: templateOnboarding.id,
          type: 'onboarding',
          status: 'in_progress',
          startedAt: DateTime.now().minus({ days: 5 }),
          createdBy: admin.id,
        }
      )

      // Criar items parcialmente completos
      for (const [idx, tplItem] of onbTemplateItems.entries()) {
        const isCompleted = idx < 5 // Primeiros 5 completados
        await EmployeeChecklistItem.updateOrCreate(
          { checklistId: checklist2.id, templateItemId: tplItem.id },
          {
            checklistId: checklist2.id,
            templateItemId: tplItem.id,
            title: tplItem.title,
            description: tplItem.description,
            responsibleRole: tplItem.responsibleRole,
            status: isCompleted ? 'completed' : 'pending',
            completedBy: isCompleted ? admin.id : null,
            completedAt: isCompleted ? DateTime.now().minus({ days: 3 }) : null,
            dueDate: tplItem.dueDays ? DateTime.now().minus({ days: 5 }).plus({ days: tplItem.dueDays }) : null,
            order: tplItem.order,
          }
        )
      }

      // Checklist pendente para employee[5] (Rafael - contratado ha 9 meses)
      const checklist3 = await EmployeeChecklist.updateOrCreate(
        { employeeId: employees[5]?.id || employees[2].id, templateId: templateOnboarding.id },
        {
          employeeId: employees[5]?.id || employees[2].id,
          templateId: templateOnboarding.id,
          type: 'onboarding',
          status: 'pending',
          startedAt: DateTime.now(),
          createdBy: admin.id,
        }
      )

      for (const tplItem of onbTemplateItems) {
        await EmployeeChecklistItem.updateOrCreate(
          { checklistId: checklist3.id, templateItemId: tplItem.id },
          {
            checklistId: checklist3.id,
            templateItemId: tplItem.id,
            title: tplItem.title,
            description: tplItem.description,
            responsibleRole: tplItem.responsibleRole,
            status: 'pending',
            dueDate: tplItem.dueDays ? DateTime.now().plus({ days: tplItem.dueDays }) : null,
            order: tplItem.order,
          }
        )
      }
    }

    console.log('Employee checklists criados')

    // ============================================================
    // 19. SURVEYS + QUESTIONS + RESPONSES + ANSWERS
    // ============================================================
    console.log('Criando surveys...')

    // Limpar survey questions antigas que possam ter dados corrompidos
    try {
      await Database.rawQuery(`
        DELETE FROM survey_questions
        WHERE survey_id IN (
          SELECT id FROM surveys WHERE title LIKE '%Clima%2026%' OR title LIKE '%eNPS%'
        )
      `)
      await Database.rawQuery(`
        DELETE FROM surveys WHERE title LIKE '%Clima%2026%' OR title LIKE '%eNPS%'
      `)
    } catch (error) {
      console.log('Erro ao limpar surveys antigas:', error.message)
    }

    // Survey 1: Pesquisa de clima ativa
    const survey1 = await Survey.create({
      title: 'Pesquisa de Clima Organizacional 2026',
      description: 'Pesquisa anual para avaliar o clima organizacional da empresa',
      type: 'climate',
      status: 'active',
      isAnonymous: true,
      startDate: DateTime.now().minus({ days: 7 }),
      endDate: DateTime.now().plus({ days: 23 }),
      targetDepartments: null,
      createdBy: admin.id,
    })

    const s1Questions = [
      { text: 'Como voce avalia o ambiente de trabalho?', type: 'scale' as const, order: 1, isRequired: true },
      { text: 'Voce se sente valorizado pela empresa?', type: 'scale' as const, order: 2, isRequired: true },
      { text: 'Como avalia a comunicacao interna?', type: 'scale' as const, order: 3, isRequired: true },
      { text: 'Recomendaria a empresa como um bom lugar para trabalhar?', type: 'enps' as const, order: 4, isRequired: true },
      { text: 'O que podemos melhorar?', type: 'text' as const, order: 5, isRequired: false },
      { text: 'Voce tem as ferramentas necessarias para realizar seu trabalho?', type: 'yes_no' as const, order: 6, isRequired: true },
      { text: 'Qual area precisa de mais atencao?', type: 'multiple_choice' as const, order: 7, isRequired: false, options: ['Comunicacao', 'Beneficios', 'Treinamento', 'Infraestrutura', 'Gestao'] },
    ]

    const createdQuestions1: SurveyQuestion[] = []
    for (const q of s1Questions) {
      const existing = await SurveyQuestion.query()
        .where('surveyId', survey1.id)
        .where('text', q.text)
        .first()

      if (existing) {
        createdQuestions1.push(existing)
      } else {
        const question = await SurveyQuestion.create({
          surveyId: survey1.id,
          text: q.text,
          type: q.type,
          order: q.order,
          isRequired: q.isRequired,
          options: (q as any).options || null,
        })
        createdQuestions1.push(question)
      }
    }

    // Respostas de 5 colaboradores
    for (let i = 0; i < Math.min(5, employees.length); i++) {
      const emp = employees[i]
      const existingResponse = await SurveyResponse.query()
        .where('surveyId', survey1.id)
        .where('employeeId', emp.id)
        .first()

      if (!existingResponse) {
        const survResp = await SurveyResponse.create({
          surveyId: survey1.id,
          employeeId: emp.id,
          submittedAt: DateTime.now().minus({ days: Math.floor(Math.random() * 5) }),
        })

        for (const q of createdQuestions1) {
          let value: string | null = null
          let numericValue: number | null = null

          if (q.type === 'scale') {
            numericValue = Math.floor(Math.random() * 3) + 3 // 3-5
            value = String(numericValue)
          } else if (q.type === 'enps') {
            numericValue = Math.floor(Math.random() * 4) + 7 // 7-10
            value = String(numericValue)
          } else if (q.type === 'text') {
            value = ['Mais flexibilidade no horario', 'Melhorar o plano de saude', 'Investir em treinamentos', 'Nada a declarar', 'Mais confraternizacoes'][i]
          } else if (q.type === 'yes_no') {
            value = Math.random() > 0.3 ? 'sim' : 'nao'
          } else if (q.type === 'multiple_choice') {
            value = ['Comunicacao', 'Beneficios', 'Treinamento', 'Infraestrutura', 'Gestao'][i]
          }

          await SurveyAnswer.create({
            responseId: survResp.id,
            questionId: q.id,
            value,
            numericValue,
          })
        }
      }
    }

    // Survey 2: eNPS concluida
    const survey2 = await Survey.create({
      title: 'eNPS Q4 2025',
      description: 'Pesquisa de Employee Net Promoter Score do ultimo trimestre',
      type: 'enps',
      status: 'closed',
      isAnonymous: true,
      startDate: DateTime.now().minus({ months: 2 }),
      endDate: DateTime.now().minus({ months: 1 }),
      targetDepartments: null,
      createdBy: admin.id,
    })

    const s2Questions = [
      { text: 'De 0 a 10, qual a probabilidade de voce recomendar a empresa como um bom lugar para trabalhar?', type: 'enps' as const, order: 1, isRequired: true },
      { text: 'Qual o principal motivo da sua nota?', type: 'text' as const, order: 2, isRequired: false },
    ]

    const createdQuestions2: SurveyQuestion[] = []
    for (const q of s2Questions) {
      const existing = await SurveyQuestion.query()
        .where('surveyId', survey2.id)
        .where('text', q.text)
        .first()

      if (existing) {
        createdQuestions2.push(existing)
      } else {
        const question = await SurveyQuestion.create({
          surveyId: survey2.id,
          text: q.text,
          type: q.type,
          order: q.order,
          isRequired: q.isRequired,
          options: null,
        })
        createdQuestions2.push(question)
      }
    }

    // Respostas de 8 colaboradores
    for (let i = 0; i < Math.min(8, employees.length); i++) {
      const emp = employees[i]
      const existingResponse = await SurveyResponse.query()
        .where('surveyId', survey2.id)
        .where('employeeId', emp.id)
        .first()

      if (!existingResponse) {
        const survResp = await SurveyResponse.create({
          surveyId: survey2.id,
          employeeId: emp.id,
          submittedAt: DateTime.now().minus({ months: 1, days: Math.floor(Math.random() * 20) }),
        })

        for (const q of createdQuestions2) {
          let value: string | null = null
          let numericValue: number | null = null

          if (q.type === 'enps') {
            numericValue = Math.floor(Math.random() * 5) + 6 // 6-10
            value = String(numericValue)
          } else {
            value = ['Bom ambiente', 'Salario competitivo', 'Equipe otima', 'Crescimento', 'Flexibilidade', 'Bons beneficios', 'Cultura forte', 'Aprendizado'][i]
          }

          await SurveyAnswer.create({
            responseId: survResp.id,
            questionId: q.id,
            value,
            numericValue,
          })
        }
      }
    }

    // Survey 3: Pesquisa draft
    await Survey.updateOrCreate(
      { title: 'Pesquisa de Satisfacao - Beneficios' },
      {
        title: 'Pesquisa de Satisfacao - Beneficios',
        description: 'Pesquisa para avaliar a satisfacao dos colaboradores com os beneficios oferecidos',
        type: 'satisfaction',
        status: 'draft',
        isAnonymous: false,
        startDate: null,
        endDate: null,
        targetDepartments: null,
        createdBy: admin.id,
      }
    )

    console.log('Surveys criados')

    // ============================================================
    // 20. DOCUMENT TEMPLATES
    // ============================================================
    console.log('Criando document templates...')

    // Limpar document templates corrompidos
    try {
      await Database.rawQuery(`DELETE FROM document_templates WHERE name LIKE '%Contrato%' OR name LIKE '%Declaracao%' OR name LIKE '%NDA%' OR name LIKE '%Carta%' OR name LIKE '%Politica%'`)
    } catch (error) {
      console.log('Erro ao limpar document templates:', error.message)
    }

    const docTemplates = [
      {
        name: 'Contrato de Trabalho CLT',
        description: 'Modelo padrao de contrato de trabalho para regime CLT',
        type: 'contract' as const,
        content: 'CONTRATO INDIVIDUAL DE TRABALHO\n\nEMPREGADOR: {{company_name}}, CNPJ {{company_cnpj}}\nEMPREGADO: {{employee_name}}, CPF {{employee_cpf}}\n\nCARGO: {{position_title}}\nDEPARTAMENTO: {{department_name}}\nSALARIO: R$ {{salary}}\nDATA DE ADMISSAO: {{hire_date}}\n\nO presente contrato e regido pela CLT e legislacao complementar aplicavel.',
        variables: ['company_name', 'company_cnpj', 'employee_name', 'employee_cpf', 'position_title', 'department_name', 'salary', 'hire_date', 'current_date'],
      },
      {
        name: 'Declaracao de Vinculo Empregaticio',
        description: 'Declaracao confirmando vinculo empregaticio do colaborador',
        type: 'declaration' as const,
        content: 'DECLARACAO DE VINCULO EMPREGATICIO\n\nDeclaramos para os devidos fins que {{employee_name}}, portador(a) do CPF {{employee_cpf}}, e funcionario(a) desta empresa desde {{hire_date}}, exercendo o cargo de {{position_title}} no departamento de {{department_name}}, com remuneracao de R$ {{salary}}.\n\n{{company_name}}\nData: {{current_date}}',
        variables: ['employee_name', 'employee_cpf', 'hire_date', 'position_title', 'department_name', 'salary', 'company_name', 'current_date'],
      },
      {
        name: 'Termo de Confidencialidade (NDA)',
        description: 'Acordo de confidencialidade para protecao de informacoes da empresa',
        type: 'nda' as const,
        content: 'TERMO DE CONFIDENCIALIDADE\n\nEu, {{employee_name}}, CPF {{employee_cpf}}, me comprometo a manter sigilo absoluto sobre todas as informacoes confidenciais a que tiver acesso durante o exercicio de minhas funcoes na empresa {{company_name}}.\n\nEste termo permanece vigente durante e apos o vinculo empregaticio.',
        variables: ['employee_name', 'employee_cpf', 'company_name', 'current_date'],
      },
      {
        name: 'Carta de Recomendacao',
        description: 'Modelo de carta de recomendacao para ex-colaboradores',
        type: 'letter' as const,
        content: 'CARTA DE RECOMENDACAO\n\nA quem possa interessar,\n\nRecomendamos {{employee_name}}, que trabalhou conosco de {{hire_date}} a {{termination_date}} no cargo de {{position_title}}.\n\nDurante sua atuacao, demonstrou profissionalismo e competencia.\n\n{{company_name}}\nData: {{current_date}}',
        variables: ['employee_name', 'hire_date', 'termination_date', 'position_title', 'company_name', 'current_date'],
      },
      {
        name: 'Politica de Home Office',
        description: 'Politica interna para trabalho remoto',
        type: 'policy' as const,
        content: 'POLITICA DE HOME OFFICE\n\nA empresa {{company_name}} permite o regime de trabalho remoto conforme as diretrizes abaixo:\n\n1. O colaborador deve manter disponibilidade no horario comercial\n2. Reunioes presenciais podem ser convocadas com antecedencia minima de 24h\n3. O colaborador e responsavel por manter ambiente adequado de trabalho\n4. Equipamentos sao fornecidos pela empresa\n\nData de vigencia: {{current_date}}',
        variables: ['company_name', 'current_date'],
      },
    ]

    for (const tpl of docTemplates) {
      await DocumentTemplate.updateOrCreate(
        { name: tpl.name },
        {
          ...tpl,
          isActive: true,
          createdBy: admin.id,
        }
      )
    }

    console.log('Document templates criados')

    // ============================================================
    // 21. AUTOMATED COMMUNICATIONS
    // ============================================================
    console.log('Criando automated communications...')

    // Limpar automated communications corrompidos
    try {
      await Database.rawQuery(`DELETE FROM communication_logs`)
      await Database.rawQuery(`DELETE FROM automated_communications`)
    } catch (error) {
      console.log('Erro ao limpar automated communications:', error.message)
    }

    const comm1 = await AutomatedCommunication.updateOrCreate(
      { name: 'Feliz Aniversario' },
      {
        name: 'Feliz Aniversario',
        triggerType: 'birthday',
        triggerDaysBefore: 0,
        messageTemplate: 'Parabens pelo seu aniversario, {{employee_name}}! Desejamos muitas felicidades!',
        isActive: true,
        targetRoles: ['admin', 'manager', 'employee'],
        createdBy: admin.id,
      }
    )

    const comm2 = await AutomatedCommunication.updateOrCreate(
      { name: 'Aniversario de Empresa' },
      {
        name: 'Aniversario de Empresa',
        triggerType: 'work_anniversary',
        triggerDaysBefore: 0,
        messageTemplate: 'Parabens pelos seus anos de empresa, {{employee_name}}! Obrigado pela dedicacao!',
        isActive: true,
        targetRoles: ['admin', 'manager'],
        createdBy: admin.id,
      }
    )

    await AutomatedCommunication.updateOrCreate(
      { name: 'Documento Vencendo' },
      {
        name: 'Documento Vencendo',
        triggerType: 'document_expiring',
        triggerDaysBefore: 30,
        messageTemplate: 'Atencao: O documento {{document_type}} do colaborador {{employee_name}} vence em 30 dias.',
        isActive: true,
        targetRoles: ['admin', 'manager'],
        createdBy: admin.id,
      }
    )

    await AutomatedCommunication.updateOrCreate(
      { name: 'Fim do Periodo de Experiencia' },
      {
        name: 'Fim do Periodo de Experiencia',
        triggerType: 'probation_ending',
        triggerDaysBefore: 15,
        messageTemplate: 'O periodo de experiencia de {{employee_name}} termina em 15 dias. Avalie a efetivacao.',
        isActive: true,
        targetRoles: ['admin', 'manager'],
        createdBy: admin.id,
      }
    )

    await AutomatedCommunication.updateOrCreate(
      { name: 'Retorno de Ferias' },
      {
        name: 'Retorno de Ferias',
        triggerType: 'leave_returning',
        triggerDaysBefore: 1,
        messageTemplate: '{{employee_name}} retorna de ferias amanha. Prepare o acolhimento!',
        isActive: true,
        targetRoles: ['manager'],
        createdBy: admin.id,
      }
    )

    await AutomatedCommunication.updateOrCreate(
      { name: 'Onboarding Incompleto' },
      {
        name: 'Onboarding Incompleto',
        triggerType: 'onboarding_incomplete',
        triggerDaysBefore: 0,
        messageTemplate: 'O checklist de onboarding de {{employee_name}} ainda nao foi concluido. Por favor, verifique os itens pendentes.',
        isActive: false,
        targetRoles: ['admin', 'manager'],
        createdBy: admin.id,
      }
    )

    console.log('Automated communications criados')

    // ============================================================
    // 22. COMMUNICATION LOGS
    // ============================================================
    console.log('Criando communication logs...')

    if (employees.length >= 5) {
      await CommunicationLog.updateOrCreate(
        { communicationId: comm1.id, employeeId: employees[0].id },
        {
          communicationId: comm1.id,
          employeeId: employees[0].id,
          userId: employees[0].userId,
          message: `Parabens pelo seu aniversario, ${employees[0].fullName}! Desejamos muitas felicidades!`,
          sentAt: DateTime.now().minus({ days: 10 }),
          status: 'read',
        }
      )

      await CommunicationLog.updateOrCreate(
        { communicationId: comm1.id, employeeId: employees[2].id },
        {
          communicationId: comm1.id,
          employeeId: employees[2].id,
          userId: employees[2].userId,
          message: `Parabens pelo seu aniversario, ${employees[2].fullName}! Desejamos muitas felicidades!`,
          sentAt: DateTime.now().minus({ days: 5 }),
          status: 'sent',
        }
      )

      await CommunicationLog.updateOrCreate(
        { communicationId: comm2.id, employeeId: employees[0].id },
        {
          communicationId: comm2.id,
          employeeId: employees[0].id,
          userId: employees[0].userId,
          message: `Parabens pelos seus 2 anos de empresa, ${employees[0].fullName}! Obrigado pela dedicacao!`,
          sentAt: DateTime.now().minus({ days: 3 }),
          status: 'read',
        }
      )

      await CommunicationLog.updateOrCreate(
        { communicationId: comm2.id, employeeId: employees[1].id },
        {
          communicationId: comm2.id,
          employeeId: employees[1].id,
          userId: employees[1].userId,
          message: `Parabens pelos seus anos de empresa, ${employees[1].fullName}! Obrigado pela dedicacao!`,
          sentAt: DateTime.now().minus({ days: 1 }),
          status: 'sent',
        }
      )

      await CommunicationLog.updateOrCreate(
        { communicationId: comm1.id, employeeId: employees[4].id },
        {
          communicationId: comm1.id,
          employeeId: employees[4].id,
          userId: employees[4].userId,
          message: `Parabens pelo seu aniversario, ${employees[4].fullName}! Desejamos muitas felicidades!`,
          sentAt: DateTime.now().minus({ days: 15 }),
          status: 'read',
        }
      )
    }

    console.log('Communication logs criados')

    // ============================================================
    // 23. ANALYTICS SNAPSHOTS
    // ============================================================
    console.log('Criando analytics snapshots...')

    // Limpar snapshots corrompidos
    try {
      await Database.rawQuery(`DELETE FROM analytics_snapshots`)
    } catch (error) {
      console.log('Erro ao limpar analytics snapshots:', error.message)
    }

    const now = DateTime.now()

    // Snapshot mensal dos ultimos 3 meses
    for (let i = 0; i < 3; i++) {
      const refDate = now.minus({ months: i })
      const month = refDate.month
      const year = refDate.year

      await AnalyticsSnapshot.updateOrCreate(
        { type: 'monthly_summary', referenceMonth: month, referenceYear: year },
        {
          type: 'monthly_summary',
          referenceMonth: month,
          referenceYear: year,
          data: {
            totalEmployees: 20 - i,
            activeEmployees: 18 - i,
            newHires: Math.floor(Math.random() * 3),
            terminations: Math.floor(Math.random() * 2),
            averageSalary: 7200 + (i * 100),
            averageTenureMonths: 15 + i,
            absenteeismRate: (2.5 + Math.random() * 2).toFixed(1),
            overtimeHours: Math.floor(Math.random() * 100) + 50,
            trainingHoursTotal: Math.floor(Math.random() * 200) + 100,
          },
          generatedAt: refDate.endOf('month'),
        }
      )

      await AnalyticsSnapshot.updateOrCreate(
        { type: 'department_health', referenceMonth: month, referenceYear: year },
        {
          type: 'department_health',
          referenceMonth: month,
          referenceYear: year,
          data: {
            departments: [
              { name: 'Tecnologia da Informacao', headcount: 10, avgSalary: 8500, turnoverRate: 5, engagementScore: 82 },
              { name: 'Recursos Humanos', headcount: 4, avgSalary: 5500, turnoverRate: 0, engagementScore: 88 },
              { name: 'Financeiro', headcount: 3, avgSalary: 6800, turnoverRate: 0, engagementScore: 85 },
            ],
          },
          generatedAt: refDate.endOf('month'),
        }
      )

      await AnalyticsSnapshot.updateOrCreate(
        { type: 'engagement_trend', referenceMonth: month, referenceYear: year },
        {
          type: 'engagement_trend',
          referenceMonth: month,
          referenceYear: year,
          data: {
            overallScore: 84 - i,
            participationRate: 85 + Math.floor(Math.random() * 10),
            topFactors: ['Ambiente de trabalho', 'Remuneracao', 'Crescimento'],
            bottomFactors: ['Comunicacao', 'Beneficios'],
            trendDirection: i === 0 ? 'up' : 'stable',
          },
          generatedAt: refDate.endOf('month'),
        }
      )

      await AnalyticsSnapshot.updateOrCreate(
        { type: 'turnover_prediction', referenceMonth: month, referenceYear: year },
        {
          type: 'turnover_prediction',
          referenceMonth: month,
          referenceYear: year,
          data: {
            predictedTurnoverRate: (8 + Math.random() * 5).toFixed(1),
            highRiskEmployees: Math.floor(Math.random() * 3),
            mainRiskFactors: ['Salario abaixo do mercado', 'Tempo de empresa > 3 anos sem promocao'],
            recommendedActions: ['Ajustar remuneracao', 'Plano de carreira', 'Feedback regular'],
          },
          generatedAt: refDate.endOf('month'),
        }
      )
    }

    console.log('Analytics snapshots criados')

    // ============================================================
    // 24. NOTIFICAÇÕES ADICIONAIS (mais variadas)
    // ============================================================
    console.log('Criando notificações adicionais...')

    const additionalNotifications = [
      {
        userId: employees[3]?.userId,
        type: 'training_enrollment' as const,
        title: 'Nova Inscrição em Treinamento',
        message: 'Você foi inscrito no treinamento "Segurança da Informação". Início previsto para daqui a 5 dias.',
        metadata: { trainingId: 1, trainingTitle: 'Segurança da Informação' },
      },
      {
        userId: employees[4]?.userId,
        type: 'training_completed' as const,
        title: 'Treinamento Concluído com Sucesso',
        message: 'Parabéns! Você concluiu o treinamento "TypeScript Avançado" com nota 9.0.',
        metadata: { trainingId: 2, score: 9.0, trainingTitle: 'TypeScript Avançado' },
      },
      {
        userId: employees[5]?.userId,
        type: 'salary_changed' as const,
        title: 'Reajuste Salarial Aprovado',
        message: 'Seu salário foi reajustado. O novo valor já está disponível para consulta.',
        metadata: { adjustmentType: 'merit', effectiveDate: DateTime.now().toISODate() },
      },
      {
        userId: employees[6]?.userId,
        type: 'general' as const,
        title: 'Pesquisa de Clima - Participe!',
        message: 'A pesquisa de clima organizacional 2026 está aberta. Sua opinião é muito importante!',
        metadata: { surveyId: 1, deadline: DateTime.now().plus({ days: 20 }).toISODate() },
      },
      {
        userId: employees[7]?.userId,
        type: 'document_uploaded' as const,
        title: 'Holerite Disponível',
        message: 'O holerite referente ao mês de fevereiro/2026 está disponível para download.',
        metadata: { documentType: 'payslip', period: '2026-02' },
      },
      {
        userId: employees[8]?.userId,
        type: 'leave_approved' as const,
        title: 'Solicitação de Férias Aprovada',
        message: 'Suas férias foram aprovadas! Período: 15/03/2026 a 29/03/2026 (15 dias).',
        metadata: { leaveId: 1, startDate: '2026-03-15', endDate: '2026-03-29' },
      },
      {
        userId: employees[9]?.userId,
        type: 'general' as const,
        title: 'Atualização de Política Interna',
        message: 'A política de home office foi atualizada. Confira as novas diretrizes no portal.',
        metadata: { policyType: 'home_office', version: '2.0' },
      },
      {
        userId: employees[0]?.userId,
        type: 'training_enrollment' as const,
        title: 'Curso de Liderança Disponível',
        message: 'Novo curso "Liderança e Gestão de Equipes" disponível. Inscrições abertas!',
        metadata: { trainingId: 3, category: 'Liderança' },
      },
      {
        userId: employees[1]?.userId,
        type: 'general' as const,
        title: 'Novo Benefício - Gympass',
        message: 'A empresa agora oferece Gympass como benefício. Acesse academias em todo o Brasil!',
        metadata: { benefitType: 'gympass', startDate: DateTime.now().plus({ days: 10 }).toISODate() },
      },
      {
        userId: employees[2]?.userId,
        type: 'general' as const,
        title: 'Aniversário de Empresa Próximo',
        message: 'Você completa 1 ano de empresa na próxima semana. Parabéns pela dedicação!',
        metadata: { years: 1, anniversaryDate: DateTime.now().plus({ days: 7 }).toISODate() },
      },
      {
        userId: employees[3]?.userId,
        type: 'general' as const,
        title: 'Pesquisa eNPS Fechada',
        message: 'A pesquisa eNPS foi encerrada. Em breve divulgaremos os resultados.',
        metadata: { surveyId: 2, closedDate: DateTime.now().minus({ days: 30 }).toISODate() },
      },
      {
        userId: employees[4]?.userId,
        type: 'document_uploaded' as const,
        title: 'Novo Documento Disponível',
        message: 'Declaração de vínculo empregatício emitida e disponível para download.',
        metadata: { documentType: 'declaration', issuedDate: DateTime.now().toISODate() },
      },
      {
        userId: employees[5]?.userId,
        type: 'general' as const,
        title: 'Confraternização de Fim de Mês',
        message: 'Não esqueça! Sexta-feira teremos happy hour da empresa às 18h.',
        metadata: { eventDate: DateTime.now().plus({ days: 3 }).toISODate(), eventType: 'happy_hour' },
      },
      {
        userId: employees[6]?.userId,
        type: 'training_enrollment' as const,
        title: 'Treinamento Obrigatório - LGPD',
        message: 'Você foi inscrito no treinamento obrigatório sobre LGPD. Prazo: 7 dias.',
        metadata: { trainingId: 4, mandatory: true, deadline: DateTime.now().plus({ days: 7 }).toISODate() },
      },
      {
        userId: employees[7]?.userId,
        type: 'general' as const,
        title: 'Avaliação de Desempenho',
        message: 'Seu ciclo de avaliação de desempenho iniciará em breve. Prepare-se!',
        metadata: { cycleId: 1, startDate: DateTime.now().plus({ days: 15 }).toISODate() },
      },
    ]

    for (const notif of additionalNotifications) {
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
              isRead: Math.random() > 0.6, // 40% lidas
              readAt: Math.random() > 0.6 ? DateTime.now().minus({ hours: Math.floor(Math.random() * 48) }) : null,
              metadata: notif.metadata,
            })
          }
        } catch (error) {
          console.log(`Erro ao criar notificacao: ${error.message}`)
        }
      }
    }

    console.log('Notificações adicionais criadas')

    console.log('Seeder de demonstracao concluido!')
  }
}

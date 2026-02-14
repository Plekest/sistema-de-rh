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
            metadata: {},
          })
        }
      }
    }

    console.log('Notificacoes criadas')

    console.log('Seeder de demonstracao concluido!')
  }
}

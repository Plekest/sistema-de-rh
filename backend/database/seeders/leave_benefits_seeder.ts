import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Employee from '#models/employee'
import LeaveConfig from '#models/leave_config'
import LeaveBalance from '#models/leave_balance'
import Leave from '#models/leave'
import Benefit from '#models/benefit'
import BenefitPlan from '#models/benefit_plan'
import EmployeeBenefit from '#models/employee_benefit'
import BenefitDependent from '#models/benefit_dependent'

export default class extends BaseSeeder {
  async run() {
    console.log('Starting Leave and Benefits seeder...')

    // Create Leave Configurations
    await this.createLeaveConfigs()

    // Get active employees for seeding
    const employees = await Employee.query().where('status', 'active')
    const cltEmployees = employees.filter((emp) => emp.type === 'clt')

    console.log(`Found ${employees.length} active employees (${cltEmployees.length} CLT)`)

    // Create Leave Balances for CLT employees
    await this.createLeaveBalances(cltEmployees)

    // Create Leave Requests
    await this.createLeaveRequests(employees)

    // Create Benefits
    await this.createBenefits()

    // Create Benefit Plans
    await this.createBenefitPlans()

    // Enroll employees in benefits
    await this.enrollEmployeesInBenefits(cltEmployees)

    // Add dependents to some benefit enrollments
    await this.createBenefitDependents()

    console.log('Leave and Benefits seeder completed successfully!')
  }

  private async createLeaveConfigs() {
    console.log('Creating leave configurations...')

    const configs = [
      {
        leaveType: 'vacation',
        label: 'Férias',
        defaultDays: 30,
        requiresApproval: true,
        requiresDocument: false,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'medical',
        label: 'Atestado Médico',
        defaultDays: 15,
        requiresApproval: true,
        requiresDocument: true,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'maternity',
        label: 'Licença Maternidade',
        defaultDays: 120,
        requiresApproval: true,
        requiresDocument: true,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'paternity',
        label: 'Licença Paternidade',
        defaultDays: 20,
        requiresApproval: true,
        requiresDocument: false,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'bereavement',
        label: 'Licença Nojo',
        defaultDays: 5,
        requiresApproval: true,
        requiresDocument: false,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'wedding',
        label: 'Licença Casamento',
        defaultDays: 3,
        requiresApproval: true,
        requiresDocument: false,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'blood_donation',
        label: 'Doação de Sangue',
        defaultDays: 1,
        requiresApproval: false,
        requiresDocument: false,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'military',
        label: 'Serviço Militar',
        defaultDays: 90,
        requiresApproval: true,
        requiresDocument: false,
        isPaid: true,
        isActive: true,
      },
      {
        leaveType: 'other',
        label: 'Outras Licenças',
        defaultDays: 0,
        requiresApproval: true,
        requiresDocument: false,
        isPaid: false,
        isActive: true,
      },
    ]

    for (const config of configs) {
      await LeaveConfig.updateOrCreate({ leaveType: config.leaveType }, config)
    }

    console.log(`Created ${configs.length} leave configurations`)
  }

  private async createLeaveBalances(cltEmployees: Employee[]) {
    console.log('Creating leave balances for CLT employees...')

    let balanceCount = 0

    for (const employee of cltEmployees) {
      const hireDate = employee.hireDate
      const today = DateTime.now()
      const monthsSinceHire = today.diff(hireDate, 'months').months

      // Create accrual periods (12 months each)
      const periodsToCreate = Math.floor(monthsSinceHire / 12)

      for (let i = 0; i < periodsToCreate; i++) {
        const accrualStartDate = hireDate.plus({ months: i * 12 })
        const accrualEndDate = accrualStartDate.plus({ months: 12 })

        // Randomize usage for realism
        const isUsed = Math.random() > 0.3 // 70% chance of some usage
        const usedDays = isUsed ? Math.floor(Math.random() * 25) + 5 : 0 // 5-30 days
        const soldDays = isUsed && Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0 // Up to 10 days sold
        const availableDays = 30 - usedDays - soldDays

        await LeaveBalance.updateOrCreate(
          {
            employeeId: employee.id,
            accrualStartDate: accrualStartDate,
          },
          {
            employeeId: employee.id,
            accrualStartDate: accrualStartDate,
            accrualEndDate: accrualEndDate,
            totalDays: 30,
            usedDays,
            soldDays,
            remainingDays: availableDays,
            status: availableDays === 30 ? 'available' : availableDays === 0 ? 'used' : 'partially_used',
          }
        )

        balanceCount++
      }
    }

    console.log(`Created ${balanceCount} leave balance records`)
  }

  private async createLeaveRequests(employees: Employee[]) {
    console.log('Creating leave requests...')

    const leaveRequests = [
      // Vacation requests (most common)
      {
        employeeIndex: 0,
        type: 'vacation',
        startDate: DateTime.now().minus({ months: 2 }),
        endDate: DateTime.now().minus({ months: 2 }).plus({ days: 14 }),
        status: 'completed',
        reason: 'Férias programadas',
      },
      {
        employeeIndex: 1,
        type: 'vacation',
        startDate: DateTime.now().plus({ months: 1 }),
        endDate: DateTime.now().plus({ months: 1, days: 20 }),
        status: 'approved',
        reason: 'Férias de fim de ano',
      },
      {
        employeeIndex: 2,
        type: 'vacation',
        startDate: DateTime.now().plus({ days: 10 }),
        endDate: DateTime.now().plus({ days: 24 }),
        status: 'pending',
        reason: 'Viagem com a família',
      },
      {
        employeeIndex: 3,
        type: 'vacation',
        startDate: DateTime.now().minus({ months: 1 }),
        endDate: DateTime.now().minus({ months: 1 }).plus({ days: 9 }),
        status: 'completed',
        reason: 'Descanso',
      },
      {
        employeeIndex: 4,
        type: 'vacation',
        startDate: DateTime.now().plus({ months: 2 }),
        endDate: DateTime.now().plus({ months: 2, days: 29 }),
        status: 'approved',
        reason: 'Férias anuais completas',
      },

      // Medical leave
      {
        employeeIndex: 5,
        type: 'medical',
        startDate: DateTime.now().minus({ days: 5 }),
        endDate: DateTime.now().minus({ days: 3 }),
        status: 'completed',
        reason: 'Gripe forte',
        documentUrl: '/documents/medical-certificate-001.pdf',
      },
      {
        employeeIndex: 6,
        type: 'medical',
        startDate: DateTime.now().minus({ days: 1 }),
        endDate: DateTime.now(),
        status: 'approved',
        reason: 'Consulta médica',
        documentUrl: '/documents/medical-certificate-002.pdf',
      },
      {
        employeeIndex: 7,
        type: 'medical',
        startDate: DateTime.now().minus({ months: 3 }),
        endDate: DateTime.now().minus({ months: 3 }).plus({ days: 7 }),
        status: 'completed',
        reason: 'Cirurgia menor',
        documentUrl: '/documents/medical-certificate-003.pdf',
      },

      // Paternity leave
      {
        employeeIndex: 8,
        type: 'paternity',
        startDate: DateTime.now().minus({ months: 1 }),
        endDate: DateTime.now().minus({ months: 1 }).plus({ days: 19 }),
        status: 'completed',
        reason: 'Nascimento do filho',
      },
      {
        employeeIndex: 9,
        type: 'paternity',
        startDate: DateTime.now().plus({ days: 5 }),
        endDate: DateTime.now().plus({ days: 24 }),
        status: 'approved',
        reason: 'Nascimento do segundo filho',
      },

      // Bereavement
      {
        employeeIndex: 10,
        type: 'bereavement',
        startDate: DateTime.now().minus({ months: 2, days: 10 }),
        endDate: DateTime.now().minus({ months: 2, days: 6 }),
        status: 'completed',
        reason: 'Falecimento de familiar',
      },

      // Wedding leave
      {
        employeeIndex: 11,
        type: 'wedding',
        startDate: DateTime.now().minus({ months: 4 }),
        endDate: DateTime.now().minus({ months: 4 }).plus({ days: 2 }),
        status: 'completed',
        reason: 'Casamento',
      },

      // Blood donation
      {
        employeeIndex: 12,
        type: 'blood_donation',
        startDate: DateTime.now().minus({ months: 1, days: 15 }),
        endDate: DateTime.now().minus({ months: 1, days: 15 }),
        status: 'completed',
        reason: 'Doação de sangue',
      },
      {
        employeeIndex: 13,
        type: 'blood_donation',
        startDate: DateTime.now().minus({ days: 20 }),
        endDate: DateTime.now().minus({ days: 20 }),
        status: 'completed',
        reason: 'Doação de sangue',
      },

      // Other leave types
      {
        employeeIndex: 14,
        type: 'other',
        startDate: DateTime.now().plus({ days: 3 }),
        endDate: DateTime.now().plus({ days: 5 }),
        status: 'pending',
        reason: 'Assuntos pessoais',
      },
      {
        employeeIndex: 15,
        type: 'other',
        startDate: DateTime.now().minus({ months: 5 }),
        endDate: DateTime.now().minus({ months: 5 }).plus({ days: 2 }),
        status: 'rejected',
        reason: 'Viagem particular',
        rejectionReason: 'Período de alta demanda de trabalho',
      },

      // More vacation requests for variety
      {
        employeeIndex: 0,
        type: 'vacation',
        startDate: DateTime.now().plus({ months: 3 }),
        endDate: DateTime.now().plus({ months: 3, days: 14 }),
        status: 'pending',
        reason: 'Férias de meio de ano',
      },
      {
        employeeIndex: 1,
        type: 'vacation',
        startDate: DateTime.now().minus({ months: 6 }),
        endDate: DateTime.now().minus({ months: 6 }).plus({ days: 19 }),
        status: 'completed',
        reason: 'Férias primeiro semestre',
      },
      {
        employeeIndex: 4,
        type: 'medical',
        startDate: DateTime.now().minus({ days: 10 }),
        endDate: DateTime.now().minus({ days: 7 }),
        status: 'completed',
        reason: 'Exames médicos',
        documentUrl: '/documents/medical-certificate-004.pdf',
      },
      {
        employeeIndex: 5,
        type: 'vacation',
        startDate: DateTime.now().plus({ months: 4 }),
        endDate: DateTime.now().plus({ months: 4, days: 9 }),
        status: 'approved',
        reason: 'Férias programadas',
      },
    ]

    let createdCount = 0

    for (const request of leaveRequests) {
      if (request.employeeIndex >= employees.length) continue

      const employee = employees[request.employeeIndex]
      const days = Math.ceil(request.endDate.diff(request.startDate, 'days').days) + 1

      // For vacation leaves, try to find a corresponding balance
      let leaveBalanceId = null
      if (request.type === 'vacation') {
        const balance = await LeaveBalance.query()
          .where('employee_id', employee.id)
          .where('remaining_days', '>=', days)
          .first()

        if (balance) {
          leaveBalanceId = balance.id
        }
      }

      const leaveData: any = {
        employeeId: employee.id,
        type: request.type,
        startDate: request.startDate.toSQLDate(),
        endDate: request.endDate.toSQLDate(),
        daysCount: days,
        status: request.status,
        notes: request.reason,
        leaveBalanceId,
        isPaid: true,
        sellDays: 0,
        requestedBy: employee.userId,
      }

      if (request.rejectionReason) {
        leaveData.rejectionReason = request.rejectionReason
      }

      if (request.status === 'approved' || request.status === 'completed') {
        leaveData.approvedAt = request.startDate.minus({ days: 5 }).toSQL()
        leaveData.approvedBy = 1 // Assuming admin user ID
      }

      await Leave.create(leaveData)
      createdCount++
    }

    console.log(`Created ${createdCount} leave requests`)
  }

  private async createBenefits() {
    console.log('Creating benefits...')

    const benefits: Array<{ name: string; type: 'vt' | 'vr' | 'va' | 'health' | 'dental' | 'life_insurance' | 'daycare' | 'gym' | 'other'; provider: string | null; description: string; isActive: boolean }> = [
      {
        name: 'Vale Transporte',
        type: 'vt',
        provider: 'SPTrans',
        description: 'Vale transporte para deslocamento casa-trabalho',
        isActive: true,
      },
      {
        name: 'Vale Refeição',
        type: 'vr',
        provider: 'Sodexo',
        description: 'Vale refeição para alimentação durante expediente',
        isActive: true,
      },
      {
        name: 'Vale Alimentação',
        type: 'va',
        provider: 'Alelo',
        description: 'Vale alimentação para compras em supermercados',
        isActive: true,
      },
      {
        name: 'Plano de Saúde',
        type: 'health',
        provider: 'Unimed',
        description: 'Plano de saúde com cobertura nacional',
        isActive: true,
      },
      {
        name: 'Plano Odontológico',
        type: 'dental',
        provider: 'Odontoprev',
        description: 'Plano odontológico com rede credenciada',
        isActive: true,
      },
      {
        name: 'Seguro de Vida',
        type: 'life_insurance',
        provider: 'Porto Seguro',
        description: 'Seguro de vida em grupo',
        isActive: true,
      },
      {
        name: 'Auxílio Creche',
        type: 'daycare',
        provider: null,
        description: 'Auxílio creche para filhos até 5 anos',
        isActive: true,
      },
      {
        name: 'Gympass',
        type: 'gym',
        provider: 'Gympass',
        description: 'Acesso a rede de academias',
        isActive: true,
      },
    ]

    for (const benefit of benefits) {
      await Benefit.updateOrCreate({ type: benefit.type as any }, benefit)
    }

    console.log(`Created ${benefits.length} benefits`)
  }

  private async createBenefitPlans() {
    console.log('Creating benefit plans...')

    const benefits = await Benefit.all()
    const benefitMap = new Map(benefits.map((b) => [b.type, b]))

    const plans = [
      // Vale Transporte
      {
        benefitCode: 'vt',
        name: 'Plano Padrão',
        description: 'Vale transporte padrão',
        monthlyCost: 220.0,
        employeeDiscount: 6.0, // 6% of salary
        employeeDiscountType: 'percentage' as const,
        companyCost: 0,
      },

      // Vale Refeição
      {
        benefitCode: 'vr',
        name: 'Básico',
        description: 'R$ 30,00 por dia útil',
        monthlyCost: 600.0,
        employeeDiscount: 0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 600.0,
      },
      {
        benefitCode: 'vr',
        name: 'Premium',
        description: 'R$ 45,00 por dia útil',
        monthlyCost: 900.0,
        employeeDiscount: 0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 900.0,
      },

      // Vale Alimentação
      {
        benefitCode: 'va',
        name: 'Padrão',
        description: 'R$ 500,00 mensais',
        monthlyCost: 500.0,
        employeeDiscount: 0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 500.0,
      },

      // Plano de Saúde
      {
        benefitCode: 'health',
        name: 'Básico',
        description: 'Cobertura básica nacional',
        monthlyCost: 450.0,
        employeeDiscount: 150.0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 300.0,
      },
      {
        benefitCode: 'health',
        name: 'Plus',
        description: 'Cobertura ampliada com reembolso',
        monthlyCost: 750.0,
        employeeDiscount: 300.0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 450.0,
      },
      {
        benefitCode: 'health',
        name: 'Premium',
        description: 'Cobertura total com hospitais de referência',
        monthlyCost: 1200.0,
        employeeDiscount: 500.0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 700.0,
      },

      // Plano Odontológico
      {
        benefitCode: 'dental',
        name: 'Básico',
        description: 'Cobertura básica',
        monthlyCost: 80.0,
        employeeDiscount: 20.0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 60.0,
      },
      {
        benefitCode: 'dental',
        name: 'Premium',
        description: 'Cobertura completa com ortodontia',
        monthlyCost: 150.0,
        employeeDiscount: 50.0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 100.0,
      },

      // Seguro de Vida
      {
        benefitCode: 'life',
        name: 'Padrão',
        description: 'Cobertura de 100x o salário',
        monthlyCost: 50.0,
        employeeDiscount: 0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 50.0,
      },

      // Auxílio Creche
      {
        benefitCode: 'daycare',
        name: 'Padrão',
        description: 'Auxílio mensal por filho',
        monthlyCost: 500.0,
        employeeDiscount: 0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 500.0,
      },

      // Gympass
      {
        benefitCode: 'gym',
        name: 'Básico',
        description: 'Acesso a academias parceiras',
        monthlyCost: 80.0,
        employeeDiscount: 30.0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 50.0,
      },
      {
        benefitCode: 'gym',
        name: 'Premium',
        description: 'Acesso total com academias premium',
        monthlyCost: 150.0,
        employeeDiscount: 70.0,
        employeeDiscountType: 'fixed' as const,
        companyCost: 80.0,
      },
    ]

    for (const plan of plans) {
      const benefit = benefitMap.get(plan.benefitCode as any)
      if (!benefit) continue

      await BenefitPlan.create({
        benefitId: benefit.id,
        name: plan.name,
        monthlyValue: plan.monthlyCost,
        employeeDiscountValue: plan.employeeDiscountType === 'fixed' ? plan.employeeDiscount : null,
        employeeDiscountPercentage: plan.employeeDiscountType === 'percentage' ? plan.employeeDiscount : null,
        isActive: true,
      })
    }

    console.log(`Created ${plans.length} benefit plans`)
  }

  private async enrollEmployeesInBenefits(cltEmployees: Employee[]) {
    console.log('Enrolling employees in benefits...')

    const benefits = await Benefit.all()
    const benefitMap = new Map(benefits.map((b) => [b.type, b]))

    // Get all benefit plans
    const allPlans = await BenefitPlan.query().preload('benefit')
    const plansByBenefit = new Map<number, BenefitPlan[]>()

    for (const plan of allPlans) {
      const plans = plansByBenefit.get(plan.benefitId) || []
      plans.push(plan)
      plansByBenefit.set(plan.benefitId, plans)
    }

    let enrollmentCount = 0

    for (const employee of cltEmployees) {
      await employee.load('position')
      const enrollmentDate = employee.hireDate.plus({ days: 30 }) // Benefits start after 30 days

      // All CLT employees get VT and VR (basic)
      const vtBenefit = benefitMap.get('vt')
      if (vtBenefit) {
        const vtPlans = plansByBenefit.get(vtBenefit.id) || []
        if (vtPlans.length > 0) {
          await EmployeeBenefit.updateOrCreate(
            { employeeId: employee.id, benefitPlanId: vtPlans[0].id },
            {
              enrollmentDate: enrollmentDate,
              status: 'active',
            }
          )
          enrollmentCount++
        }
      }

      const vrBenefit = benefitMap.get('vr')
      if (vrBenefit) {
        const vrPlans = plansByBenefit.get(vrBenefit.id) || []
        if (vrPlans.length > 0) {
          // Most get basic, some get premium
          const planIndex = Math.random() > 0.7 ? 1 : 0
          const selectedPlan = vrPlans[Math.min(planIndex, vrPlans.length - 1)]
          await EmployeeBenefit.updateOrCreate(
            { employeeId: employee.id, benefitPlanId: selectedPlan.id },
            {
              enrollmentDate: enrollmentDate,
              status: 'active',
            }
          )
          enrollmentCount++
        }
      }

      // Most get health insurance
      if (Math.random() > 0.2) {
        const healthBenefit = benefitMap.get('health')
        if (healthBenefit) {
          const healthPlans = plansByBenefit.get(healthBenefit.id) || []
          if (healthPlans.length > 0) {
            // Junior employees get basic, senior get plus or premium
            let planIndex = 0
            const positionTitle = employee.position?.title || ''
            if (positionTitle.includes('Senior') || positionTitle.includes('Gerente')) {
              planIndex = Math.random() > 0.5 ? 2 : 1 // Premium or Plus
            } else {
              planIndex = Math.random() > 0.7 ? 1 : 0 // Plus or Basic
            }
            const selectedPlan = healthPlans[Math.min(planIndex, healthPlans.length - 1)]
            await EmployeeBenefit.updateOrCreate(
              { employeeId: employee.id, benefitPlanId: selectedPlan.id },
              {
                enrollmentDate: enrollmentDate,
                status: 'active',
              }
            )
            enrollmentCount++
          }
        }
      }

      // Most get dental
      if (Math.random() > 0.3) {
        const dentalBenefit = benefitMap.get('dental')
        if (dentalBenefit) {
          const dentalPlans = plansByBenefit.get(dentalBenefit.id) || []
          if (dentalPlans.length > 0) {
            const planIndex = Math.random() > 0.8 ? 1 : 0 // Mostly basic
            const selectedPlan = dentalPlans[Math.min(planIndex, dentalPlans.length - 1)]
            await EmployeeBenefit.updateOrCreate(
              { employeeId: employee.id, benefitPlanId: selectedPlan.id },
              {
                enrollmentDate: enrollmentDate,
                status: 'active',
              }
            )
            enrollmentCount++
          }
        }
      }

      // All get life insurance
      const lifeBenefit = benefitMap.get('life_insurance')
      if (lifeBenefit) {
        const lifePlans = plansByBenefit.get(lifeBenefit.id) || []
        if (lifePlans.length > 0) {
          await EmployeeBenefit.updateOrCreate(
            { employeeId: employee.id, benefitPlanId: lifePlans[0].id },
            {
              enrollmentDate: enrollmentDate,
              status: 'active',
            }
          )
          enrollmentCount++
        }
      }

      // Some get gym
      if (Math.random() > 0.5) {
        const gymBenefit = benefitMap.get('gym')
        if (gymBenefit) {
          const gymPlans = plansByBenefit.get(gymBenefit.id) || []
          if (gymPlans.length > 0) {
            const planIndex = Math.random() > 0.7 ? 1 : 0
            const selectedPlan = gymPlans[Math.min(planIndex, gymPlans.length - 1)]
            await EmployeeBenefit.updateOrCreate(
              { employeeId: employee.id, benefitPlanId: selectedPlan.id },
              {
                enrollmentDate: enrollmentDate,
                status: 'active',
              }
            )
            enrollmentCount++
          }
        }
      }

      // Few get daycare (only those who might have young children)
      if (Math.random() > 0.85) {
        const daycareBenefit = benefitMap.get('daycare')
        if (daycareBenefit) {
          const daycarePlans = plansByBenefit.get(daycareBenefit.id) || []
          if (daycarePlans.length > 0) {
            await EmployeeBenefit.updateOrCreate(
              { employeeId: employee.id, benefitPlanId: daycarePlans[0].id },
              {
                enrollmentDate: enrollmentDate,
                status: 'active',
              }
            )
            enrollmentCount++
          }
        }
      }
    }

    // Create 1-2 cancelled enrollments for variety
    if (cltEmployees.length > 5) {
      const employee = cltEmployees[0]
      const gymBenefit = benefitMap.get('gym')
      if (gymBenefit) {
        const gymPlans = plansByBenefit.get(gymBenefit.id) || []
        if (gymPlans.length > 0) {
          await EmployeeBenefit.updateOrCreate(
            { employeeId: employee.id, benefitPlanId: gymPlans[0].id },
            {
              enrollmentDate: employee.hireDate.plus({ days: 30 }),
              status: 'cancelled',
              cancellationDate: DateTime.now().minus({ months: 2 }),
              notes: 'Solicitado pelo funcionário',
            }
          )
          enrollmentCount++
        }
      }
    }

    console.log(`Created ${enrollmentCount} employee benefit enrollments`)
  }

  private async createBenefitDependents() {
    console.log('Creating benefit dependents...')

    // Get some health plan enrollments
    const healthEnrollments = await EmployeeBenefit.query()
      .whereHas('benefitPlan', (query) => {
        query.whereHas('benefit', (benefitQuery) => {
          benefitQuery.where('type', 'health')
        })
      })
      .where('status', 'active')
      .preload('employee')
      .limit(6)

    let dependentCount = 0

    // Add spouse dependents to first 3-4 enrollments
    for (let i = 0; i < Math.min(4, healthEnrollments.length); i++) {
      const enrollment = healthEnrollments[i]

      await BenefitDependent.create({
        employeeBenefitId: enrollment.id,
        name: `Cônjuge de ${enrollment.employee.fullName}`,
        relationship: 'spouse',
        cpf: this.generateRandomCPF(),
        birthDate: DateTime.now().minus({ years: 30 + Math.floor(Math.random() * 15) }),
      })
      dependentCount++
    }

    // Add child dependents to 2 enrollments
    for (let i = 0; i < Math.min(2, healthEnrollments.length); i++) {
      const enrollment = healthEnrollments[i]

      // Add 1-2 children
      const childrenCount = Math.floor(Math.random() * 2) + 1
      for (let j = 0; j < childrenCount; j++) {
        await BenefitDependent.create({
          employeeBenefitId: enrollment.id,
          name: `Filho(a) ${j + 1} de ${enrollment.employee.fullName}`,
          relationship: 'child',
          cpf: this.generateRandomCPF(),
          birthDate: DateTime.now().minus({ years: 2 + Math.floor(Math.random() * 15) }),
        })
        dependentCount++
      }
    }

    console.log(`Created ${dependentCount} benefit dependents`)
  }

  private generateRandomCPF(): string {
    // Generate a valid-looking CPF (not necessarily mathematically valid)
    const randomDigits = () =>
      Math.floor(Math.random() * 10)
        .toString()
        .padStart(1, '0')

    return `${randomDigits()}${randomDigits()}${randomDigits()}.${randomDigits()}${randomDigits()}${randomDigits()}.${randomDigits()}${randomDigits()}${randomDigits()}-${randomDigits()}${randomDigits()}`
  }
}

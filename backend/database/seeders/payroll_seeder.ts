import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import TaxTable from '#models/tax_table'
import PayrollPeriod from '#models/payroll_period'
import PayrollComponent from '#models/payroll_component'
import PayrollEntry from '#models/payroll_entry'
import PaySlip from '#models/pay_slip'
import Employee from '#models/employee'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    console.log('Iniciando seed da folha de pagamento...')

    // ============================================================
    // 1. TAX TABLES (Tabelas de Impostos - 2024)
    // ============================================================
    console.log('Criando tabelas de impostos...')

    // INSS 2024
    await TaxTable.updateOrCreate(
      { type: 'inss', bracketMin: 0, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'inss',
        bracketMin: 0,
        bracketMax: 1412.0,
        rate: 7.5,
        deductionValue: 0,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    await TaxTable.updateOrCreate(
      { type: 'inss', bracketMin: 1412.01, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'inss',
        bracketMin: 1412.01,
        bracketMax: 2666.68,
        rate: 9.0,
        deductionValue: 0,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    await TaxTable.updateOrCreate(
      { type: 'inss', bracketMin: 2666.69, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'inss',
        bracketMin: 2666.69,
        bracketMax: 4000.03,
        rate: 12.0,
        deductionValue: 0,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    await TaxTable.updateOrCreate(
      { type: 'inss', bracketMin: 4000.04, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'inss',
        bracketMin: 4000.04,
        bracketMax: 7786.02,
        rate: 14.0,
        deductionValue: 0,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    // IRRF 2024
    await TaxTable.updateOrCreate(
      { type: 'irrf', bracketMin: 0, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'irrf',
        bracketMin: 0,
        bracketMax: 2259.2,
        rate: 0,
        deductionValue: 0,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    await TaxTable.updateOrCreate(
      { type: 'irrf', bracketMin: 2259.21, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'irrf',
        bracketMin: 2259.21,
        bracketMax: 2826.65,
        rate: 7.5,
        deductionValue: 169.44,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    await TaxTable.updateOrCreate(
      { type: 'irrf', bracketMin: 2826.66, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'irrf',
        bracketMin: 2826.66,
        bracketMax: 3751.05,
        rate: 15.0,
        deductionValue: 381.44,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    await TaxTable.updateOrCreate(
      { type: 'irrf', bracketMin: 3751.06, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'irrf',
        bracketMin: 3751.06,
        bracketMax: 4664.68,
        rate: 22.5,
        deductionValue: 662.77,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    await TaxTable.updateOrCreate(
      { type: 'irrf', bracketMin: 4664.69, effectiveFrom: DateTime.fromISO('2024-01-01') },
      {
        type: 'irrf',
        bracketMin: 4664.69,
        bracketMax: 999999999.99,
        rate: 27.5,
        deductionValue: 896.0,
        effectiveFrom: DateTime.fromISO('2024-01-01'),
        effectiveUntil: null,
      }
    )

    console.log('Tabelas de impostos criadas com sucesso!')

    // ============================================================
    // 2. PAYROLL PERIODS (Períodos de Folha - Out 2025 a Fev 2026)
    // ============================================================
    console.log('Criando períodos de folha de pagamento...')

    const admin = await User.findByOrFail('email', 'admin@sistema-rh.com')

    const periodOct2025 = await PayrollPeriod.updateOrCreate(
      { referenceMonth: 10, referenceYear: 2025 },
      {
        referenceMonth: 10,
        referenceYear: 2025,
        status: 'closed',
        closedBy: admin.id,
        closedAt: DateTime.fromISO('2025-11-05T10:30:00'),
      }
    )

    const periodNov2025 = await PayrollPeriod.updateOrCreate(
      { referenceMonth: 11, referenceYear: 2025 },
      {
        referenceMonth: 11,
        referenceYear: 2025,
        status: 'closed',
        closedBy: admin.id,
        closedAt: DateTime.fromISO('2025-12-05T11:15:00'),
      }
    )

    const periodDec2025 = await PayrollPeriod.updateOrCreate(
      { referenceMonth: 12, referenceYear: 2025 },
      {
        referenceMonth: 12,
        referenceYear: 2025,
        status: 'closed',
        closedBy: admin.id,
        closedAt: DateTime.fromISO('2026-01-05T09:45:00'),
      }
    )

    const periodJan2026 = await PayrollPeriod.updateOrCreate(
      { referenceMonth: 1, referenceYear: 2026 },
      {
        referenceMonth: 1,
        referenceYear: 2026,
        status: 'closed',
        closedBy: admin.id,
        closedAt: DateTime.fromISO('2026-02-05T10:00:00'),
      }
    )

    await PayrollPeriod.updateOrCreate(
      { referenceMonth: 2, referenceYear: 2026 },
      {
        referenceMonth: 2,
        referenceYear: 2026,
        status: 'open',
        closedBy: null,
        closedAt: null,
      }
    )

    console.log('Períodos de folha criados com sucesso!')

    // ============================================================
    // 3. EMPLOYEES - Buscar funcionários CLT ativos
    // ============================================================
    console.log('Buscando funcionários CLT ativos...')

    const employees = await Employee.query().where('type', 'clt').where('status', 'active')

    console.log(`Encontrados ${employees.length} funcionários CLT ativos`)

    // ============================================================
    // 4. PAYROLL COMPONENTS (Componentes de Folha)
    // ============================================================
    console.log('Criando componentes de folha...')

    // Mapeamento de bônus fixos por nome de funcionário
    const fixedBonuses: Record<string, { amount: number; description: string }> = {
      'Joao Silva': { amount: 1500.0, description: 'Bonus Tecnico' },
      'Maria Oliveira': { amount: 2000.0, description: 'Bonus Gestao' },
      'Patricia Souza': { amount: 1000.0, description: 'Bonus Controller' },
      'Juliana Ferreira': { amount: 800.0, description: 'Comissao Fixa' },
    }

    for (const employee of employees) {
      // Salário base
      await PayrollComponent.updateOrCreate(
        { employeeId: employee.id, type: 'base_salary' },
        {
          employeeId: employee.id,
          type: 'base_salary',
          description: 'Salario Base',
          amount: employee.salary || 0,
          isActive: true,
          effectiveFrom: employee.hireDate,
          effectiveUntil: null,
        }
      )

      // Bônus fixo (se aplicável)
      const bonus = fixedBonuses[employee.fullName]
      if (bonus) {
        await PayrollComponent.updateOrCreate(
          { employeeId: employee.id, type: 'fixed_bonus' },
          {
            employeeId: employee.id,
            type: 'fixed_bonus',
            description: bonus.description,
            amount: bonus.amount,
            isActive: true,
            effectiveFrom: employee.hireDate,
            effectiveUntil: null,
          }
        )
        console.log(
          `  - Bonus fixo criado para ${employee.fullName}: R$ ${bonus.amount.toFixed(2)}`
        )
      }
    }

    console.log('Componentes de folha criados com sucesso!')

    // ============================================================
    // 5. PAYROLL ENTRIES & PAY SLIPS (Fechados)
    // ============================================================
    console.log('Criando lançamentos e holerites para períodos fechados...')

    const closedPeriods = [periodOct2025, periodNov2025, periodDec2025, periodJan2026]

    for (const period of closedPeriods) {
      console.log(
        `\nProcessando período: ${period.referenceMonth.toString().padStart(2, '0')}/${period.referenceYear}`
      )

      for (const employee of employees) {
        // Buscar componentes ativos do funcionário
        const components = await PayrollComponent.query()
          .where('employee_id', employee.id)
          .where('is_active', true)

        let grossSalary = 0
        const earningsMap: Record<string, number> = {}

        // Criar entries de proventos
        for (const component of components) {
          grossSalary += Number(component.amount)

          const code =
            component.type === 'base_salary'
              ? 'base_salary'
              : component.type === 'fixed_bonus'
                ? 'fixed_bonus'
                : 'other'

          earningsMap[code] = (earningsMap[code] || 0) + Number(component.amount)

          await PayrollEntry.updateOrCreate(
            {
              payrollPeriodId: period.id,
              employeeId: employee.id,
              componentType: 'earning',
              code: code,
            },
            {
              payrollPeriodId: period.id,
              employeeId: employee.id,
              componentType: 'earning',
              code: code,
              description: component.description,
              referenceValue: null,
              quantity: null,
              amount: Number(component.amount),
            }
          )
        }

        // Calcular descontos
        const inssAmount = this.calculateINSS(grossSalary)
        const taxableIncome = grossSalary - inssAmount
        const irrfAmount = this.calculateIRRF(taxableIncome)
        const fgtsAmount = grossSalary * 0.08
        const vtDiscount = Math.min(grossSalary * 0.06, 200.0) // VT máximo de R$ 200

        // Criar entry INSS
        await PayrollEntry.updateOrCreate(
          {
            payrollPeriodId: period.id,
            employeeId: employee.id,
            componentType: 'deduction',
            code: 'inss',
          },
          {
            payrollPeriodId: period.id,
            employeeId: employee.id,
            componentType: 'deduction',
            code: 'inss',
            description: 'INSS',
            referenceValue: grossSalary,
            quantity: null,
            amount: inssAmount,
          }
        )

        // Criar entry IRRF (se aplicável)
        if (irrfAmount > 0) {
          await PayrollEntry.updateOrCreate(
            {
              payrollPeriodId: period.id,
              employeeId: employee.id,
              componentType: 'deduction',
              code: 'irrf',
            },
            {
              payrollPeriodId: period.id,
              employeeId: employee.id,
              componentType: 'deduction',
              code: 'irrf',
              description: 'Imposto de Renda',
              referenceValue: taxableIncome,
              quantity: null,
              amount: irrfAmount,
            }
          )
        }

        // Criar entry FGTS (informativo, não é descontado)
        await PayrollEntry.updateOrCreate(
          {
            payrollPeriodId: period.id,
            employeeId: employee.id,
            componentType: 'deduction',
            code: 'fgts',
          },
          {
            payrollPeriodId: period.id,
            employeeId: employee.id,
            componentType: 'deduction',
            code: 'fgts',
            description: 'FGTS (informativo)',
            referenceValue: grossSalary,
            quantity: null,
            amount: fgtsAmount,
          }
        )

        // Criar entry VT
        await PayrollEntry.updateOrCreate(
          {
            payrollPeriodId: period.id,
            employeeId: employee.id,
            componentType: 'deduction',
            code: 'vt_discount',
          },
          {
            payrollPeriodId: period.id,
            employeeId: employee.id,
            componentType: 'deduction',
            code: 'vt_discount',
            description: 'Vale Transporte',
            referenceValue: grossSalary,
            quantity: null,
            amount: vtDiscount,
          }
        )

        // Calcular totais
        const totalEarnings = grossSalary
        const totalDeductions = inssAmount + irrfAmount + vtDiscount
        const netSalary = totalEarnings - totalDeductions

        // Criar holerite
        await PaySlip.updateOrCreate(
          { payrollPeriodId: period.id, employeeId: employee.id },
          {
            payrollPeriodId: period.id,
            employeeId: employee.id,
            grossSalary: grossSalary,
            totalEarnings: totalEarnings,
            totalDeductions: totalDeductions,
            netSalary: netSalary,
            inssAmount: inssAmount,
            irrfAmount: irrfAmount,
            fgtsAmount: fgtsAmount,
            details: null,
            status: 'final',
          }
        )

        console.log(
          `  - ${employee.fullName}: Bruto R$ ${grossSalary.toFixed(2)} | Líquido R$ ${netSalary.toFixed(2)}`
        )
      }
    }

    console.log('\n✓ Seed da folha de pagamento concluído com sucesso!')
  }

  /**
   * Calcula INSS progressivo conforme tabela 2024
   * Usa sistema de faixas progressivas
   */
  private calculateINSS(salary: number): number {
    const brackets = [
      { min: 0, max: 1412.0, rate: 0.075 },
      { min: 1412.01, max: 2666.68, rate: 0.09 },
      { min: 2666.69, max: 4000.03, rate: 0.12 },
      { min: 4000.04, max: 7786.02, rate: 0.14 },
    ]

    let inss = 0

    for (const bracket of brackets) {
      if (salary <= bracket.min) break

      const taxableInBracket = Math.min(salary, bracket.max) - bracket.min
      inss += taxableInBracket * bracket.rate

      if (salary <= bracket.max) break
    }

    return Math.round(inss * 100) / 100
  }

  /**
   * Calcula IRRF conforme tabela 2024
   * Base de cálculo = Salário Bruto - INSS
   */
  private calculateIRRF(taxableIncome: number): number {
    const brackets = [
      { min: 0, max: 2259.2, rate: 0.0, deduction: 0 },
      { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
      { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
      { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
      { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.0 },
    ]

    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        const irrf = taxableIncome * bracket.rate - bracket.deduction
        return Math.max(0, Math.round(irrf * 100) / 100)
      }
    }

    return 0
  }
}

import PayrollPeriod from '#models/payroll_period'
import PayrollComponent from '#models/payroll_component'
import PayrollEntry from '#models/payroll_entry'
import PaySlip from '#models/pay_slip'
import TaxTable from '#models/tax_table'
import Employee from '#models/employee'
import EmployeeHistoryService from '#services/employee_history_service'
import { toNumber } from '#utils/number_helper'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

interface ListPeriodsFilters {
  page?: number
  limit?: number
  year?: number
  status?: string
}

interface CreatePeriodData {
  referenceMonth: number
  referenceYear: number
}

interface CreateComponentData {
  employeeId: number
  type: 'base_salary' | 'fixed_bonus' | 'hazard_pay' | 'unhealthy_pay' | 'other'
  description: string
  amount: number
  effectiveFrom: string
  effectiveUntil?: string | null
}

interface UpdateComponentData {
  description?: string
  amount?: number
  isActive?: boolean
  effectiveUntil?: string | null
}

interface CreateEntryData {
  payrollPeriodId: number
  employeeId: number
  componentType: 'earning' | 'deduction' | 'employer_charge'
  code:
    | 'base_salary'
    | 'overtime_50'
    | 'overtime_100'
    | 'night_shift'
    | 'bonus'
    | 'commission'
    | 'fixed_bonus'
    | 'hazard_pay'
    | 'unhealthy_pay'
    | 'inss'
    | 'irrf'
    | 'fgts'
    | 'vt_discount'
    | 'benefit_discount'
    | 'absence'
    | 'advance'
    | 'other'
  description: string
  referenceValue?: number | null
  quantity?: number | null
  amount: number
}

interface ListSlipsFilters {
  page?: number
  limit?: number
  employeeId?: number
  status?: string
}

const COMPONENT_TYPE_LABELS: Record<string, string> = {
  base_salary: 'Salario Base',
  fixed_bonus: 'Adicional Fixo',
  hazard_pay: 'Periculosidade',
  unhealthy_pay: 'Insalubridade',
  other: 'Outros',
}

export default class PayrollService {
  private historyService = new EmployeeHistoryService()
  /**
   * Lista periodos de folha com filtros e paginacao
   */
  async listPeriods(filters: ListPeriodsFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = PayrollPeriod.query()
      .preload('closer')
      .orderBy('referenceYear', 'desc')
      .orderBy('referenceMonth', 'desc')

    if (filters.year) {
      query.where('referenceYear', filters.year)
    }
    if (filters.status) {
      query.where('status', filters.status)
    }

    return await query.paginate(page, limit)
  }

  /**
   * Cria um novo periodo de folha
   * Valida se ja existe periodo para o mes/ano
   */
  async createPeriod(data: CreatePeriodData) {
    const existing = await PayrollPeriod.query()
      .where('referenceMonth', data.referenceMonth)
      .where('referenceYear', data.referenceYear)
      .first()

    if (existing) {
      throw new Error(
        `Ja existe um periodo de folha para ${data.referenceMonth}/${data.referenceYear}`
      )
    }

    const period = await PayrollPeriod.create({
      referenceMonth: data.referenceMonth,
      referenceYear: data.referenceYear,
      status: 'open',
    })

    return period
  }

  /**
   * Fecha um periodo de folha
   */
  async closePeriod(periodId: number, userId: number) {
    const period = await PayrollPeriod.findOrFail(periodId)

    if (period.status === 'closed') {
      throw new Error('Este periodo ja esta fechado')
    }

    period.status = 'closed'
    period.closedBy = userId
    period.closedAt = DateTime.now()
    await period.save()

    await period.load('closer')
    return period
  }

  // ==========================================
  // Componentes Salariais
  // ==========================================

  /**
   * Lista componentes salariais de um colaborador
   */
  async getComponents(employeeId: number) {
    return await PayrollComponent.query()
      .where('employeeId', employeeId)
      .preload('employee')
      .orderBy('effectiveFrom', 'desc')
  }

  /**
   * Cria um novo componente salarial
   */
  async createComponent(data: CreateComponentData) {
    const employee = await Employee.findOrFail(data.employeeId)
    if (employee.status !== 'active') {
      throw new Error('Colaborador nao esta ativo')
    }

    const component = await PayrollComponent.create({
      employeeId: data.employeeId,
      type: data.type,
      description: data.description,
      amount: data.amount,
      isActive: true,
      effectiveFrom: DateTime.fromISO(data.effectiveFrom),
      effectiveUntil: data.effectiveUntil ? DateTime.fromISO(data.effectiveUntil) : null,
    })

    await component.load('employee')

    // Registra no historico do colaborador
    const typeLabel = COMPONENT_TYPE_LABELS[data.type] || data.type
    await this.historyService.recordPayrollComponent(
      data.employeeId,
      typeLabel,
      data.description,
      data.amount
    ).catch(() => {})

    return component
  }

  /**
   * Atualiza um componente salarial
   */
  async updateComponent(id: number, data: UpdateComponentData) {
    const component = await PayrollComponent.findOrFail(id)

    if (data.description !== undefined) {
      component.description = data.description
    }
    if (data.amount !== undefined) {
      component.amount = data.amount
    }
    if (data.isActive !== undefined) {
      component.isActive = data.isActive
    }
    if (data.effectiveUntil !== undefined) {
      component.effectiveUntil = data.effectiveUntil
        ? DateTime.fromISO(data.effectiveUntil)
        : null
    }

    await component.save()
    await component.load('employee')
    return component
  }

  // ==========================================
  // Calculo de Folha de Pagamento
  // ==========================================

  /**
   * Calcula a folha de pagamento para um periodo
   * Metodo principal que processa todos os colaboradores ativos
   */
  async calculatePayroll(periodId: number) {
    // Fase 1: Adquirir lock atomico via UPDATE condicional (fora da transacao longa)
    // Isso garante que apenas um processamento ocorra por vez para o mesmo periodo
    const lockResult = await db
      .from('payroll_periods')
      .where('id', periodId)
      .where('status', 'open')
      .update({ status: 'calculating', updated_at: DateTime.now().toSQL() })

    if (!lockResult) {
      // Verifica o motivo da falha para retornar mensagem adequada
      const period = await PayrollPeriod.find(periodId)
      if (!period) {
        throw new Error('Periodo de folha nao encontrado')
      }
      if (period.status === 'closed') {
        throw new Error('Nao e possivel calcular folha em periodo fechado')
      }
      if (period.status === 'calculating') {
        throw new Error('Calculo de folha ja esta em andamento para este periodo')
      }
      throw new Error('Periodo nao esta mais aberto para calculo')
    }

    // Fase 2: Processar dentro de transacao
    const trx = await db.transaction()

    try {
      const period = await PayrollPeriod.query({ client: trx })
        .where('id', periodId)
        .forUpdate()
        .firstOrFail()

      const employees = await Employee.query({ client: trx })
        .where('status', 'active')
        .preload('employeeBenefits', (query) => {
          query.where('status', 'active').preload('benefitPlan', (q) => q.preload('benefit'))
        })

      const results = []

      for (const employee of employees) {
        const slip = await this.calculateEmployeePayroll(period, employee, trx)
        results.push(slip)
      }

      // Volta status para 'open' apos processamento bem-sucedido
      await db
        .from('payroll_periods')
        .where('id', periodId)
        .update({ status: 'open', updated_at: DateTime.now().toSQL() })
        .useTransaction(trx)

      await trx.commit()

      return results
    } catch (error) {
      // Rollback da transacao
      try {
        await trx.rollback()
      } catch (_rollbackError) {
        // Transacao pode ja ter sido encerrada
      }

      // Fase 3: Cleanup - garante que status volta para 'open' em caso de erro
      // Usa uma nova conexao (fora da transacao que falhou)
      try {
        await db
          .from('payroll_periods')
          .where('id', periodId)
          .where('status', 'calculating')
          .update({ status: 'open', updated_at: DateTime.now().toSQL() })
      } catch (_cleanupError) {
        // Log silencioso - em producao deveria usar logger
      }

      throw error
    }
  }

  /**
   * Calcula a folha de um colaborador especifico
   */
  private async calculateEmployeePayroll(period: PayrollPeriod, employee: Employee, trx?: TransactionClientContract) {
    const queryOptions = trx ? { client: trx } : {}

    // Remove entries e slips anteriores desse periodo e colaborador
    await PayrollEntry.query(queryOptions)
      .where('payrollPeriodId', period.id)
      .where('employeeId', employee.id)
      .delete()

    await PaySlip.query(queryOptions)
      .where('payrollPeriodId', period.id)
      .where('employeeId', employee.id)
      .delete()

    // Busca componentes salariais ativos do colaborador
    // Usa ultimo dia do mes para incluir componentes criados durante o mes
    const referenceDate = DateTime.fromObject({
      year: period.referenceYear,
      month: period.referenceMonth,
      day: 1,
    }).endOf('month')

    const firstDayOfMonth = DateTime.fromObject({
      year: period.referenceYear,
      month: period.referenceMonth,
      day: 1,
    })

    const components = await PayrollComponent.query(queryOptions)
      .where('employeeId', employee.id)
      .where('isActive', true)
      .where('effectiveFrom', '<=', referenceDate.toISODate()!)
      .where((query) => {
        query.whereNull('effectiveUntil').orWhere('effectiveUntil', '>=', firstDayOfMonth.toISODate()!)
      })

    let grossSalary = 0
    const entries: PayrollEntry[] = []

    // Cria entries de proventos (earnings)
    // Nota: toNumber() necessario pois PostgreSQL retorna decimal como string
    for (const component of components) {
      const amount = toNumber(component.amount)
      const entry = await PayrollEntry.create({
        payrollPeriodId: period.id,
        employeeId: employee.id,
        componentType: 'earning',
        code: component.type === 'base_salary' ? 'base_salary' : (component.type as any),
        description: component.description,
        referenceValue: null,
        quantity: null,
        amount,
      }, trx ? { client: trx } : undefined)
      entries.push(entry)
      grossSalary += amount
    }

    // Calcula INSS (progressivo)
    const inssAmount = await this.calculateINSS(grossSalary)
    if (inssAmount > 0) {
      const inssEntry = await PayrollEntry.create({
        payrollPeriodId: period.id,
        employeeId: employee.id,
        componentType: 'deduction',
        code: 'inss',
        description: 'INSS - Contribuicao Previdenciaria',
        referenceValue: grossSalary,
        quantity: null,
        amount: inssAmount,
      }, trx ? { client: trx } : undefined)
      entries.push(inssEntry)
    }

    // Calcula IRRF (progressivo) - busca dependentes do colaborador
    const dependents = employee.irrfDependents || 0
    const irrfAmount = await this.calculateIRRF(grossSalary, inssAmount, dependents)
    if (irrfAmount > 0) {
      const irrfEntry = await PayrollEntry.create({
        payrollPeriodId: period.id,
        employeeId: employee.id,
        componentType: 'deduction',
        code: 'irrf',
        description: 'IRRF - Imposto de Renda Retido na Fonte',
        referenceValue: grossSalary - inssAmount,
        quantity: null,
        amount: irrfAmount,
      }, trx ? { client: trx } : undefined)
      entries.push(irrfEntry)
    }

    // Calcula FGTS (8% sobre bruto) - encargo patronal, NAO desconta do colaborador
    const fgtsAmount = Math.round(grossSalary * 0.08 * 100) / 100
    if (fgtsAmount > 0) {
      const fgtsEntry = await PayrollEntry.create({
        payrollPeriodId: period.id,
        employeeId: employee.id,
        componentType: 'employer_charge',
        code: 'fgts',
        description: 'FGTS - Fundo de Garantia (8%) - Encargo Patronal',
        referenceValue: grossSalary,
        quantity: null,
        amount: fgtsAmount,
      }, trx ? { client: trx } : undefined)
      entries.push(fgtsEntry)
    }

    // Calcula desconto de beneficios
    let benefitDiscountTotal = 0
    if (employee.employeeBenefits && employee.employeeBenefits.length > 0) {
      for (const empBenefit of employee.employeeBenefits) {
        const plan = empBenefit.benefitPlan
        let discount = 0

        if (plan.employeeDiscountValue) {
          discount = toNumber(plan.employeeDiscountValue)
        } else if (plan.employeeDiscountPercentage) {
          discount = Math.round((grossSalary * toNumber(plan.employeeDiscountPercentage)) / 100 * 100) / 100
        }

        if (discount > 0) {
          const benefitEntry = await PayrollEntry.create({
            payrollPeriodId: period.id,
            employeeId: employee.id,
            componentType: 'deduction',
            code: 'benefit_discount',
            description: `Desconto ${plan.name}`,
            referenceValue: null,
            quantity: null,
            amount: discount,
          }, trx ? { client: trx } : undefined)
          entries.push(benefitEntry)
          benefitDiscountTotal += discount
        }
      }
    }

    // Calcula desconto de VT (6% do salario BASE, nao do bruto)
    // CLT: VT desconta 6% apenas sobre o salario base, nao sobre adicionais
    const hasVT = employee.employeeBenefits?.some(
      (eb) => eb.status === 'active' && eb.benefitPlan?.benefit?.type === 'vt'
    )
    let vtDiscount = 0
    if (hasVT) {
      const baseSalaryComponent = components.find((c) => c.type === 'base_salary')
      const baseSalary = baseSalaryComponent ? toNumber(baseSalaryComponent.amount) : grossSalary
      vtDiscount = Math.round(baseSalary * 0.06 * 100) / 100
      const vtEntry = await PayrollEntry.create({
        payrollPeriodId: period.id,
        employeeId: employee.id,
        componentType: 'deduction',
        code: 'vt_discount',
        description: 'Desconto Vale Transporte (6% do salario base)',
        referenceValue: baseSalary,
        quantity: null,
        amount: vtDiscount,
      }, trx ? { client: trx } : undefined)
      entries.push(vtEntry)
    }

    // Calcula totais (toNumber() para garantir soma numerica)
    const totalEarnings = entries
      .filter((e) => e.componentType === 'earning')
      .reduce((sum, e) => sum + toNumber(e.amount), 0)

    const totalDeductions = entries
      .filter((e) => e.componentType === 'deduction')
      .reduce((sum, e) => sum + toNumber(e.amount), 0)

    const netSalary = totalEarnings - totalDeductions

    // Cria o contracheque (pay slip)
    const slip = await PaySlip.create({
      payrollPeriodId: period.id,
      employeeId: employee.id,
      grossSalary,
      totalEarnings,
      totalDeductions,
      netSalary,
      inssAmount,
      irrfAmount,
      fgtsAmount,
      details: {
        benefitDiscountTotal,
        vtDiscount,
      },
      status: 'draft',
    }, trx ? { client: trx } : undefined)

    return slip
  }

  /**
   * Calcula INSS progressivo brasileiro
   * Tabela 2024 (busca da tabela tax_tables)
   *
   * O calculo e PROGRESSIVO: cada faixa tributa apenas a parcela do salario
   * que se encontra dentro dela, nao o salario total.
   */
  private async calculateINSS(grossSalary: number): Promise<number> {
    const today = DateTime.now().toISODate()!

    const brackets = await TaxTable.query()
      .where('type', 'inss')
      .where('effectiveFrom', '<=', today)
      .where((query) => {
        query.whereNull('effectiveUntil').orWhere('effectiveUntil', '>=', today)
      })
      .orderBy('bracketMin', 'asc')

    if (brackets.length === 0) {
      return this.calculateINSSFallback(grossSalary)
    }

    const salary = toNumber(grossSalary)
    if (salary <= 0) return 0

    // Teto do INSS: usa o bracketMax da ultima faixa
    const lastBracket = brackets[brackets.length - 1]
    const ceiling = lastBracket.bracketMax ? toNumber(lastBracket.bracketMax) : Infinity
    const cappedSalary = Math.min(salary, ceiling)

    let totalINSS = 0
    let previousMax = 0

    for (const bracket of brackets) {
      const max = bracket.bracketMax ? toNumber(bracket.bracketMax) : Infinity
      const rate = toNumber(bracket.rate)

      // A base tributavel de cada faixa vai do teto da faixa anterior ate o teto desta faixa
      const bracketFloor = previousMax
      const bracketCeiling = max

      if (cappedSalary <= bracketFloor) break

      const taxableInBracket = Math.min(cappedSalary, bracketCeiling) - bracketFloor

      if (taxableInBracket > 0) {
        totalINSS += taxableInBracket * (rate / 100)
      }

      previousMax = bracketCeiling
    }

    return Math.round(totalINSS * 100) / 100
  }

  /**
   * Fallback: Calcula INSS progressivo usando tabela 2024
   * Faixas INSS 2024:
   *   Ate R$1.412,00         -> 7,5%
   *   De R$1.412,01 a R$2.666,68 -> 9,0%
   *   De R$2.666,69 a R$4.000,03 -> 12,0%
   *   De R$4.000,04 a R$7.786,02 -> 14,0%
   */
  private calculateINSSFallback(grossSalary: number): number {
    const brackets = [
      { max: 1412.00, rate: 7.5 },
      { max: 2666.68, rate: 9.0 },
      { max: 4000.03, rate: 12.0 },
      { max: 7786.02, rate: 14.0 },
    ]

    const salary = toNumber(grossSalary)
    if (salary <= 0) return 0

    const cappedSalary = Math.min(salary, 7786.02)
    let totalINSS = 0
    let previousMax = 0

    for (const bracket of brackets) {
      if (cappedSalary <= previousMax) break

      const taxableInBracket = Math.min(cappedSalary, bracket.max) - previousMax

      if (taxableInBracket > 0) {
        totalINSS += taxableInBracket * (bracket.rate / 100)
      }

      previousMax = bracket.max
    }

    return Math.round(totalINSS * 100) / 100
  }

  /**
   * Calcula IRRF progressivo brasileiro
   * Tabela 2024
   *
   * IRRF usa metodo de aliquota efetiva: aplica aliquota da faixa sobre
   * a base de calculo total e subtrai a parcela a deduzir.
   */
  private async calculateIRRF(
    grossSalary: number,
    inssAmount: number,
    dependents: number
  ): Promise<number> {
    const today = DateTime.now().toISODate()!

    const dependentDeduction = 189.59 * dependents
    const taxableBase = toNumber(grossSalary) - toNumber(inssAmount) - dependentDeduction

    if (taxableBase <= 0) return 0

    const brackets = await TaxTable.query()
      .where('type', 'irrf')
      .where('effectiveFrom', '<=', today)
      .where((query) => {
        query.whereNull('effectiveUntil').orWhere('effectiveUntil', '>=', today)
      })
      .orderBy('bracketMin', 'asc')

    if (brackets.length === 0) {
      return this.calculateIRRFFallback(taxableBase)
    }

    // IRRF: encontra a faixa correspondente e aplica aliquota - parcela a deduzir
    for (let i = brackets.length - 1; i >= 0; i--) {
      const bracket = brackets[i]
      const min = toNumber(bracket.bracketMin)

      if (taxableBase >= min) {
        const rate = toNumber(bracket.rate)
        const deduction = toNumber(bracket.deductionValue)
        const irrfGross = taxableBase * (rate / 100)
        const irrfNet = irrfGross - deduction
        return Math.max(0, Math.round(irrfNet * 100) / 100)
      }
    }

    return 0
  }

  /**
   * Fallback: Calcula IRRF usando tabela 2024
   * Faixas IRRF 2024:
   *   Ate R$2.259,20          -> Isento
   *   De R$2.259,21 a R$2.826,65 -> 7,5%  (deduzir R$169,44)
   *   De R$2.826,66 a R$3.751,05 -> 15,0% (deduzir R$381,44)
   *   De R$3.751,06 a R$4.664,68 -> 22,5% (deduzir R$662,77)
   *   Acima de R$4.664,68       -> 27,5% (deduzir R$896,00)
   */
  private calculateIRRFFallback(taxableBase: number): number {
    const brackets = [
      { min: 0, rate: 0, deduction: 0 },
      { min: 2259.21, rate: 7.5, deduction: 169.44 },
      { min: 2826.66, rate: 15.0, deduction: 381.44 },
      { min: 3751.06, rate: 22.5, deduction: 662.77 },
      { min: 4664.69, rate: 27.5, deduction: 896.0 },
    ]

    // Percorre de tras para frente para encontrar a faixa correta
    for (let i = brackets.length - 1; i >= 0; i--) {
      if (taxableBase >= brackets[i].min) {
        const irrfGross = taxableBase * (brackets[i].rate / 100)
        const irrfNet = irrfGross - brackets[i].deduction
        return Math.max(0, Math.round(irrfNet * 100) / 100)
      }
    }

    return 0
  }

  // ==========================================
  // Lancamentos Manuais
  // ==========================================

  /**
   * Cria um lancamento manual na folha
   */
  async createEntry(data: CreateEntryData) {
    const period = await PayrollPeriod.findOrFail(data.payrollPeriodId)

    if (period.status === 'closed') {
      throw new Error('Nao e possivel adicionar lancamentos em periodo fechado')
    }

    const employee = await Employee.findOrFail(data.employeeId)
    if (employee.status !== 'active') {
      throw new Error('Colaborador nao esta ativo')
    }

    const entry = await PayrollEntry.create({
      payrollPeriodId: data.payrollPeriodId,
      employeeId: data.employeeId,
      componentType: data.componentType,
      code: data.code,
      description: data.description,
      referenceValue: data.referenceValue || null,
      quantity: data.quantity || null,
      amount: data.amount,
    })

    await entry.load('employee')
    await entry.load('period')
    return entry
  }

  // ==========================================
  // Contracheques
  // ==========================================

  /**
   * Lista contracheques de um periodo
   * Se employeeId for fornecido, filtra apenas os contracheques desse colaborador
   */
  async getPaySlips(periodId: number, employeeId?: number) {
    const query = PaySlip.query()
      .where('payrollPeriodId', periodId)
      .preload('employee', (q) => {
        q.preload('department').preload('position')
      })
      .orderBy('employeeId', 'asc')

    if (employeeId) {
      query.where('employeeId', employeeId)
    }

    return await query
  }

  /**
   * Lista contracheques de um colaborador com paginacao
   */
  async getEmployeePaySlips(filters: ListSlipsFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = PaySlip.query()
      .preload('period')
      .preload('employee', (q) => {
        q.preload('department').preload('position')
      })
      .orderBy('payrollPeriodId', 'desc')

    if (filters.employeeId) {
      query.where('employeeId', filters.employeeId)
    }
    if (filters.status) {
      query.where('status', filters.status)
    }

    return await query.paginate(page, limit)
  }

  /**
   * Retorna detalhes de um contracheque especifico com entries
   */
  async getPaySlipDetail(slipId: number) {
    const slip = await PaySlip.query()
      .where('id', slipId)
      .preload('period')
      .preload('employee', (query) => {
        query.preload('department').preload('position')
      })
      .firstOrFail()

    const entries = await PayrollEntry.query()
      .where('payrollPeriodId', slip.payrollPeriodId)
      .where('employeeId', slip.employeeId)
      .orderBy('componentType', 'asc')
      .orderBy('code', 'asc')

    return {
      slip,
      entries,
    }
  }

  /**
   * Retorna um contracheque por ID (para PDF)
   */
  async getPaySlipById(slipId: number) {
    const slip = await PaySlip.query().where('id', slipId).firstOrFail()
    return slip
  }
}

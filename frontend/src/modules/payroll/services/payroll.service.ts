import api from '@/services/api'
import type {
  PayrollPeriod,
  PayrollComponent,
  PayrollEntry,
  PaySlip,
  CreatePeriodData,
  CreateComponentData,
  CreateEntryData,
  PeriodFilters,
} from '../types'

/**
 * Servico de folha de pagamento - gerencia chamadas a API de payroll
 */
class PayrollService {
  // --- Períodos ---

  /**
   * Lista periodos da folha com paginacao
   */
  async listPeriods(filters: PeriodFilters = {}): Promise<{ data: PayrollPeriod[]; meta: any }> {
    const response = await api.get('/payroll/periods', { params: filters })
    return response.data
  }

  /**
   * Cria novo periodo da folha
   */
  async createPeriod(data: CreatePeriodData): Promise<PayrollPeriod> {
    const response = await api.post<{ data: PayrollPeriod }>('/payroll/periods', data)
    return response.data.data
  }

  /**
   * Calcula folha de um periodo
   */
  async calculatePayroll(periodId: number): Promise<PaySlip[]> {
    const response = await api.post<{ data: PaySlip[] }>(`/payroll/periods/${periodId}/calculate`)
    return response.data.data
  }

  /**
   * Fecha periodo da folha
   */
  async closePeriod(periodId: number): Promise<PayrollPeriod> {
    const response = await api.patch<{ data: PayrollPeriod }>(`/payroll/periods/${periodId}/close`)
    return response.data.data
  }

  // --- Componentes ---

  /**
   * Lista componentes salariais de um colaborador
   */
  async getComponents(employeeId: number): Promise<PayrollComponent[]> {
    const response = await api.get<{ data: PayrollComponent[] }>(`/employees/${employeeId}/payroll-components`)
    return response.data.data
  }

  /**
   * Cria componente salarial
   */
  async createComponent(data: CreateComponentData): Promise<PayrollComponent> {
    const response = await api.post<{ data: PayrollComponent }>('/payroll/components', data)
    return response.data.data
  }

  /**
   * Atualiza componente salarial
   */
  async updateComponent(id: number, data: Partial<CreateComponentData>): Promise<PayrollComponent> {
    const response = await api.put<{ data: PayrollComponent }>(`/payroll/components/${id}`, data)
    return response.data.data
  }

  // --- Contracheques ---

  /**
   * Lista contracheques de um periodo
   */
  async getPaySlips(periodId: number): Promise<PaySlip[]> {
    const response = await api.get<{ data: PaySlip[] }>(`/payroll/periods/${periodId}/slips`)
    return response.data.data
  }

  /**
   * Lista contracheques de um colaborador
   */
  async getEmployeePaySlips(employeeId: number): Promise<{ data: PaySlip[]; meta: any }> {
    const response = await api.get('/payroll/slips', { params: { employeeId } })
    return response.data
  }

  /**
   * Detalhe de um contracheque
   */
  async getPaySlipDetail(slipId: number): Promise<PaySlip> {
    const response = await api.get<{ data: { slip: PaySlip; entries: PayrollEntry[] } }>(`/payroll/slips/${slipId}`)
    const { slip, entries } = response.data.data
    return { ...slip, entries }
  }

  // --- Lançamentos ---

  /**
   * Cria lancamento manual na folha
   */
  async createEntry(data: CreateEntryData): Promise<PayrollEntry> {
    const response = await api.post<{ data: PayrollEntry }>('/payroll/entries', data)
    return response.data.data
  }

  /**
   * Baixa contracheque em PDF
   */
  async downloadPDF(slipId: number): Promise<Blob> {
    const response = await api.get(`/payroll/slips/${slipId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  }
}

export default new PayrollService()

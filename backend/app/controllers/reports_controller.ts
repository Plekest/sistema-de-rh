import type { HttpContext } from '@adonisjs/core/http'
import ReportService from '#services/report_service'
import { DateTime } from 'luxon'

export default class ReportsController {
  private service: ReportService

  constructor() {
    this.service = new ReportService()
  }

  /**
   * Exporta colaboradores para CSV
   */
  async employeesCSV({ request, response }: HttpContext) {
    try {
      const filters = {
        type: request.input('type'),
        status: request.input('status'),
        departmentId: request.input('departmentId')
          ? Number.parseInt(request.input('departmentId'))
          : undefined,
      }

      const csv = await this.service.exportEmployeesCSV(filters)

      return response
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="relatorio_colaboradores.csv"')
        .send(csv)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar relatorio de colaboradores',
      })
    }
  }

  /**
   * Exporta registros de ponto para CSV
   */
  async attendanceCSV({ request, response }: HttpContext) {
    try {
      const month = Number.parseInt(request.input('month', DateTime.now().month))
      const year = Number.parseInt(request.input('year', DateTime.now().year))
      const employeeId = request.input('employeeId')
        ? Number.parseInt(request.input('employeeId'))
        : undefined

      if (!month || month < 1 || month > 12) {
        return response.badRequest({ message: 'Mes invalido' })
      }

      if (!year || year < 2000 || year > 2100) {
        return response.badRequest({ message: 'Ano invalido' })
      }

      const csv = await this.service.exportAttendanceCSV(month, year, employeeId)

      const filename = employeeId
        ? `relatorio_ponto_${month}_${year}_colaborador_${employeeId}.csv`
        : `relatorio_ponto_${month}_${year}.csv`

      return response
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(csv)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar relatorio de ponto',
      })
    }
  }

  /**
   * Exporta folha de pagamento para CSV
   */
  async payrollCSV({ request, response }: HttpContext) {
    try {
      const periodId = Number.parseInt(request.input('periodId'))

      if (!periodId) {
        return response.badRequest({ message: 'Periodo nao informado' })
      }

      const csv = await this.service.exportPayrollCSV(periodId)

      return response
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="relatorio_folha_periodo_${periodId}.csv"`)
        .send(csv)
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Periodo nao encontrado' })
      }
      return response.badRequest({
        message: error.message || 'Erro ao gerar relatorio de folha',
      })
    }
  }

  /**
   * Exporta solicitacoes de ferias/licencas para CSV
   */
  async leaveCSV({ request, response }: HttpContext) {
    try {
      const filters = {
        type: request.input('type'),
        status: request.input('status'),
        startDate: request.input('startDate'),
        endDate: request.input('endDate'),
      }

      const csv = await this.service.exportLeaveCSV(filters)

      return response
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="relatorio_ferias_licencas.csv"')
        .send(csv)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar relatorio de ferias/licencas',
      })
    }
  }

  /**
   * Exporta treinamentos para CSV
   */
  async trainingsCSV({ request, response }: HttpContext) {
    try {
      const filters = {
        type: request.input('type'),
        status: request.input('status'),
        category: request.input('category'),
      }

      const csv = await this.service.exportTrainingsCSV(filters)

      return response
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="relatorio_treinamentos.csv"')
        .send(csv)
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erro ao gerar relatorio de treinamentos',
      })
    }
  }
}

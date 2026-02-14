import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class LeaveUpdateStatus extends BaseCommand {
  static commandName = 'leave:update-status'
  static description = 'Atualiza status de ferias/licencas baseado nas datas (approved -> in_progress -> completed)'
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { default: Leave } = await import('#models/leave')
    const { default: EmployeeHistoryService } = await import('#services/employee_history_service')
    const { DateTime } = await import('luxon')

    const historyService = new EmployeeHistoryService()
    const today = DateTime.now().toISODate()!

    this.logger.info('Iniciando atualizacao de status de ferias/licencas...')

    // 1. Approved -> In Progress: start_date <= today
    const toInProgress = await Leave.query()
      .where('status', 'approved')
      .where('startDate', '<=', today)
      .preload('employee')

    let inProgressCount = 0
    for (const leave of toInProgress) {
      leave.status = 'in_progress'
      await leave.save()
      inProgressCount++

      // Registra no historico
      try {
        await historyService.create(leave.employeeId, {
          type: 'other',
          title: `Inicio de ${leave.type === 'vacation' ? 'ferias' : 'licenca'}`,
          description: `Periodo iniciado: ${leave.startDate.toISODate()} a ${leave.endDate.toISODate()} (${leave.daysCount} dias)`,
          eventDate: today,
        })
      } catch (_error) {
        // Nao interrompe o processamento
      }
    }

    // 2. In Progress -> Completed: end_date < today
    const toCompleted = await Leave.query()
      .where('status', 'in_progress')
      .where('endDate', '<', today)
      .preload('employee')

    let completedCount = 0
    for (const leave of toCompleted) {
      leave.status = 'completed'
      await leave.save()
      completedCount++

      // Registra no historico
      try {
        await historyService.create(leave.employeeId, {
          type: 'other',
          title: `Fim de ${leave.type === 'vacation' ? 'ferias' : 'licenca'}`,
          description: `Periodo concluido: ${leave.startDate.toISODate()} a ${leave.endDate.toISODate()} (${leave.daysCount} dias)`,
          eventDate: today,
        })
      } catch (_error) {
        // Nao interrompe o processamento
      }
    }

    this.logger.info(`Transicoes realizadas: ${inProgressCount} para in_progress, ${completedCount} para completed`)
    this.logger.success('Atualizacao de status de ferias/licencas concluida')
  }
}

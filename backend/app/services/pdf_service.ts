import PDFDocument from 'pdfkit'
import PaySlip from '#models/pay_slip'
import { Readable } from 'node:stream'

export default class PdfService {
  /**
   * Gera PDF de contracheque
   */
  async generatePaySlipPdf(paySlip: PaySlip): Promise<Readable> {
    await paySlip.load('employee', (query) => {
      query.preload('department').preload('position')
    })
    await paySlip.load('period')

    const doc = new PDFDocument({ size: 'A4', margin: 50 })

    // Titulo
    doc.fontSize(18).text('CONTRACHEQUE', { align: 'center' }).moveDown(0.5)

    // Informacoes da empresa (placeholder)
    doc
      .fontSize(10)
      .text('Sistema de RH LTDA', { align: 'center' })
      .text('CNPJ: 00.000.000/0001-00', { align: 'center' })
      .moveDown(1)

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(1)

    // Dados do colaborador
    doc.fontSize(12).text('DADOS DO COLABORADOR', { underline: true }).moveDown(0.5)

    doc
      .fontSize(10)
      .text(`Nome: ${paySlip.employee.fullName}`)
      .text(`Departamento: ${paySlip.employee.department?.name || 'N/A'}`)
      .text(`Cargo: ${paySlip.employee.position?.title || 'N/A'}`)
      .moveDown(1)

    // Periodo
    doc
      .fontSize(12)
      .text('PERÍODO DE REFERÊNCIA', { underline: true })
      .moveDown(0.5)

    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]
    const month = monthNames[paySlip.period.referenceMonth - 1]

    doc
      .fontSize(10)
      .text(`Mês/Ano: ${month}/${paySlip.period.referenceYear}`)
      .moveDown(1)

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(1)

    // Vencimentos e Descontos
    const leftColumn = 50
    const rightColumn = 300

    doc.fontSize(12).text('VENCIMENTOS', leftColumn, doc.y).text('DESCONTOS', rightColumn, doc.y)
    doc.moveDown(0.5)

    const startY = doc.y

    // Coluna Vencimentos
    doc.fontSize(10)
    let yPos = startY
    doc.text('Salário Bruto', leftColumn, yPos)
    doc.text(this.formatCurrency(paySlip.grossSalary), leftColumn + 150, yPos, { align: 'right' })
    yPos += 20

    if (paySlip.totalEarnings > paySlip.grossSalary) {
      const additionalEarnings = paySlip.totalEarnings - paySlip.grossSalary
      doc.text('Outros Vencimentos', leftColumn, yPos)
      doc.text(this.formatCurrency(additionalEarnings), leftColumn + 150, yPos, { align: 'right' })
      yPos += 20
    }

    // Coluna Descontos
    yPos = startY
    doc.text('INSS', rightColumn, yPos)
    doc.text(this.formatCurrency(paySlip.inssAmount), rightColumn + 150, yPos, { align: 'right' })
    yPos += 20

    doc.text('IRRF', rightColumn, yPos)
    doc.text(this.formatCurrency(paySlip.irrfAmount), rightColumn + 150, yPos, { align: 'right' })
    yPos += 20

    if (paySlip.totalDeductions > paySlip.inssAmount + paySlip.irrfAmount) {
      const otherDeductions =
        paySlip.totalDeductions - paySlip.inssAmount - paySlip.irrfAmount
      doc.text('Outros Descontos', rightColumn, yPos)
      doc.text(this.formatCurrency(otherDeductions), rightColumn + 150, yPos, {
        align: 'right',
      })
      yPos += 20
    }

    // Move cursor para baixo
    doc.y = Math.max(doc.y, yPos) + 20

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(1)

    // Totais
    doc.fontSize(12)
    doc.text('TOTAL DE VENCIMENTOS:', leftColumn, doc.y)
    doc.text(this.formatCurrency(paySlip.totalEarnings), leftColumn + 150, doc.y, {
      align: 'right',
    })
    doc.moveDown(0.5)

    doc.text('TOTAL DE DESCONTOS:', leftColumn, doc.y)
    doc.text(this.formatCurrency(paySlip.totalDeductions), leftColumn + 150, doc.y, {
      align: 'right',
    })
    doc.moveDown(1)

    // Salário Líquido
    doc.fontSize(14).fillColor('#008000')
    doc.text('SALÁRIO LÍQUIDO:', leftColumn, doc.y, { continued: false })
    doc.text(this.formatCurrency(paySlip.netSalary), leftColumn + 150, doc.y - 14, {
      align: 'right',
    })

    doc.fillColor('#000000')
    doc.moveDown(2)

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown(1)

    // FGTS
    doc.fontSize(10)
    doc.text(`FGTS do período: ${this.formatCurrency(paySlip.fgtsAmount)}`)
    doc.moveDown(2)

    // Rodapé
    doc
      .fontSize(8)
      .text(
        'Este documento é um comprovante de pagamento. Guarde-o para futuras referências.',
        { align: 'center' }
      )

    doc.end()

    return doc as unknown as Readable
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }
}

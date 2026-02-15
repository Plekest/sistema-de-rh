import { ref } from 'vue'
import payrollService from '../services/payroll.service'

export function usePDFDownload() {
  const isDownloading = ref(false)
  const error = ref('')

  /**
   * Baixa contracheque em PDF
   */
  async function downloadPaySlipPDF(slipId: number, fileName?: string) {
    isDownloading.value = true
    error.value = ''

    try {
      const blob = await payrollService.downloadPDF(slipId)

      // Cria link temporario para download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `contracheque-${slipId}.pdf`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Erro ao baixar PDF'
      throw err
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    error,
    downloadPaySlipPDF,
  }
}

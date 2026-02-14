import { ref } from 'vue'
import api from '@/services/api'

export function useExport() {
  const exporting = ref(false)

  async function exportCSV(endpoint: string, filename: string) {
    exporting.value = true
    try {
      const response = await api.get(endpoint, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Erro ao exportar CSV:', error)
      throw new Error(error?.response?.data?.message || 'Erro ao exportar arquivo')
    } finally {
      exporting.value = false
    }
  }

  return { exporting, exportCSV }
}

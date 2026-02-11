export interface EmployeeDocument {
  id: number
  employeeId: number
  employee?: { id: number; fullName: string }
  title: string
  type: string
  fileName: string
  filePath: string
  fileSize?: number
  mimeType?: string
  notes?: string
  uploadedAt: string
  createdAt?: string
  updatedAt?: string
}

export interface DocumentFormData {
  employeeId: number
  title: string
  type: string
  file: File | null
  notes?: string
}

export interface DocumentListParams {
  employeeId?: number | null
  type?: string
  page?: number
  limit?: number
}

export const DOCUMENT_TYPES = [
  { value: 'rg', label: 'RG' },
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'ctps', label: 'CTPS' },
  { value: 'contract', label: 'Contrato' },
  { value: 'certificate', label: 'Certificado' },
  { value: 'medical', label: 'Atestado Medico' },
  { value: 'address_proof', label: 'Comprovante de Residencia' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'other', label: 'Outro' },
] as const

import Document from '#models/document'
import Employee from '#models/employee'
import EmployeeHistoryService from '#services/employee_history_service'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface ListFilters {
  page?: number
  limit?: number
  type?: string
}

interface CreateDocumentData {
  title: string
  type: string
  notes?: string | null
}

export default class DocumentService {
  private historyService: EmployeeHistoryService

  constructor() {
    this.historyService = new EmployeeHistoryService()
  }

  async list(employeeId: number, filters: ListFilters = {}) {
    await Employee.findOrFail(employeeId)

    const page = filters.page || 1
    const limit = filters.limit || 20

    const query = Document.query()
      .where('employeeId', employeeId)
      .orderBy('uploaded_at', 'desc')

    if (filters.type) {
      query.where('type', filters.type)
    }

    const result = await query.paginate(page, limit)
    return result
  }

  async upload(
    employeeId: number,
    file: MultipartFile,
    data: CreateDocumentData,
    currentUserId?: number
  ) {
    await Employee.findOrFail(employeeId)

    const uploadsDir = path.join(app.makePath('storage/uploads/documents'), String(employeeId))

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const fileName = `${cuid()}-${file.clientName}`
    await file.move(uploadsDir, { name: fileName })

    if (!file.isValid) {
      throw new Error(file.errors.map((e) => e.message).join(', '))
    }

    const document = await Document.create({
      employeeId,
      title: data.title,
      type: data.type,
      fileName: file.clientName,
      filePath: path.join('storage/uploads/documents', String(employeeId), fileName),
      fileSize: file.size,
      mimeType: file.extname ? `${file.type}/${file.subtype}` : null,
      notes: data.notes || null,
      uploadedAt: DateTime.now(),
    })

    await this.historyService.recordDocument(employeeId, data.title, currentUserId)

    return document
  }

  async findById(id: number) {
    const document = await Document.query()
      .where('id', id)
      .preload('employee')
      .firstOrFail()
    return document
  }

  async download(id: number) {
    const document = await Document.findOrFail(id)
    const absolutePath = app.makePath(document.filePath)

    if (!fs.existsSync(absolutePath)) {
      throw new Error('Arquivo nao encontrado no servidor')
    }

    return {
      path: absolutePath,
      fileName: document.fileName,
      mimeType: document.mimeType,
    }
  }

  async delete(id: number) {
    const document = await Document.findOrFail(id)
    const absolutePath = app.makePath(document.filePath)

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath)
    }

    await document.delete()
  }
}

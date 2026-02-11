import type { HttpContext } from '@adonisjs/core/http'
import DocumentService from '#services/document_service'
import { createDocumentValidator, listDocumentValidator } from '#validators/document_validator'

export default class DocumentsController {
  private service: DocumentService

  constructor() {
    this.service = new DocumentService()
  }

  async index({ params, request, response }: HttpContext) {
    try {
      const filters = await request.validateUsing(listDocumentValidator)
      const result = await this.service.list(params.employeeId, filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar documentos' })
    }
  }

  async store({ params, request, auth, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createDocumentValidator)

      const file = request.file('file', {
        size: '10mb',
        extnames: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
      })

      if (!file) {
        return response.badRequest({ message: 'Arquivo e obrigatorio' })
      }

      if (!file.isValid) {
        return response.unprocessableEntity({
          message: 'Arquivo invalido',
          errors: file.errors,
        })
      }

      const currentUserId = auth.user?.id
      const document = await this.service.upload(params.employeeId, file, data, currentUserId)
      return response.created({ data: document })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao fazer upload do documento',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const document = await this.service.findById(params.id)
      return response.ok({ data: document })
    } catch {
      return response.notFound({ message: 'Documento nao encontrado' })
    }
  }

  async download({ params, response }: HttpContext) {
    try {
      const fileInfo = await this.service.download(params.id)
      response.header('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`)
      if (fileInfo.mimeType) {
        response.header('Content-Type', fileInfo.mimeType)
      }
      return response.download(fileInfo.path)
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Documento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao baixar documento' })
    }
  }

  async view({ params, response }: HttpContext) {
    try {
      const fileInfo = await this.service.download(params.id)
      response.header('Content-Disposition', `inline; filename="${fileInfo.fileName}"`)
      if (fileInfo.mimeType) {
        response.header('Content-Type', fileInfo.mimeType)
      }
      return response.download(fileInfo.path)
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Documento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao visualizar documento' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.service.delete(params.id)
      return response.noContent()
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Documento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao remover documento' })
    }
  }
}

import type { HttpContext } from '@adonisjs/core/http'
import DocumentService from '#services/document_service'
import { createDocumentValidator, listDocumentValidator } from '#validators/document_validator'
import { resolveEmployeeId, canAccessEmployee } from '#helpers/rbac_helper'

export default class DocumentsController {
  private service: DocumentService

  constructor() {
    this.service = new DocumentService()
  }

  async index(ctx: HttpContext) {
    const { params, request, response } = ctx
    try {
      const employeeId = await resolveEmployeeId(ctx, params.employeeId)
      const filters = await request.validateUsing(listDocumentValidator)
      const result = await this.service.list(employeeId, filters)
      return response.ok({
        data: result.all(),
        meta: result.getMeta(),
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.message?.includes('permissao')) {
        return response.forbidden({ message: error.message })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({ message: error.message || 'Erro ao listar documentos' })
    }
  }

  async store(ctx: HttpContext) {
    const { params, request, auth, response } = ctx
    try {
      const employeeId = await resolveEmployeeId(ctx, params.employeeId)
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
      const document = await this.service.upload(employeeId, file, data, currentUserId)
      return response.created({ data: document })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Colaborador nao encontrado' })
      }
      if (error.message?.includes('permissao')) {
        return response.forbidden({ message: error.message })
      }
      if (error.messages) {
        return response.unprocessableEntity({ message: 'Dados invalidos', errors: error.messages })
      }
      return response.badRequest({
        message: error.message || 'Erro ao fazer upload do documento',
      })
    }
  }

  async show(ctx: HttpContext) {
    const { params, response } = ctx
    try {
      const document = await this.service.findById(params.id)
      const canAccess = await canAccessEmployee(ctx, document.employeeId)
      if (!canAccess) {
        return response.forbidden({
          message: 'Voce nao tem permissao para acessar este documento',
        })
      }
      return response.ok({ data: document })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Documento nao encontrado' })
      }
      return response.badRequest({ message: error.message || 'Erro ao buscar documento' })
    }
  }

  async download(ctx: HttpContext) {
    const { params, response } = ctx
    try {
      const document = await this.service.findById(params.id)
      const canAccess = await canAccessEmployee(ctx, document.employeeId)
      if (!canAccess) {
        return response.forbidden({
          message: 'Voce nao tem permissao para acessar este documento',
        })
      }
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

  async view(ctx: HttpContext) {
    const { params, response } = ctx
    try {
      const document = await this.service.findById(params.id)
      const canAccess = await canAccessEmployee(ctx, document.employeeId)
      if (!canAccess) {
        return response.forbidden({
          message: 'Voce nao tem permissao para acessar este documento',
        })
      }
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

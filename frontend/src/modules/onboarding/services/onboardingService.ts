import api from '@/services/api'
import type {
  OnboardingTemplate,
  OnboardingTemplateItem,
  OnboardingChecklist,
  CreateTemplateData,
  CreateTemplateItemData,
  ChecklistFilters,
} from '../types'

/**
 * Servico de onboarding - gerencia chamadas a API de onboarding/offboarding
 */
class OnboardingService {
  // ========== Templates ==========

  /**
   * Lista templates de onboarding
   */
  async listTemplates(): Promise<OnboardingTemplate[]> {
    const response = await api.get<{ data: OnboardingTemplate[] }>('/onboarding/templates')
    return response.data.data
  }

  /**
   * Busca template por ID
   */
  async getTemplate(id: number): Promise<OnboardingTemplate> {
    const response = await api.get<{ data: OnboardingTemplate }>(`/onboarding/templates/${id}`)
    return response.data.data
  }

  /**
   * Cria novo template
   */
  async createTemplate(data: CreateTemplateData): Promise<OnboardingTemplate> {
    const response = await api.post<{ data: OnboardingTemplate }>('/onboarding/templates', data)
    return response.data.data
  }

  /**
   * Atualiza template
   */
  async updateTemplate(id: number, data: Partial<CreateTemplateData>): Promise<OnboardingTemplate> {
    const response = await api.put<{ data: OnboardingTemplate }>(`/onboarding/templates/${id}`, data)
    return response.data.data
  }

  /**
   * Remove template
   */
  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/onboarding/templates/${id}`)
  }

  // ========== Template Items ==========

  /**
   * Lista items de um template
   */
  async listTemplateItems(templateId: number): Promise<OnboardingTemplateItem[]> {
    const response = await api.get<{ data: OnboardingTemplateItem[] }>(
      `/onboarding/templates/${templateId}/items`
    )
    return response.data.data
  }

  /**
   * Cria item de template
   */
  async createTemplateItem(
    templateId: number,
    data: CreateTemplateItemData
  ): Promise<OnboardingTemplateItem> {
    const response = await api.post<{ data: OnboardingTemplateItem }>(
      `/onboarding/templates/${templateId}/items`,
      data
    )
    return response.data.data
  }

  /**
   * Atualiza item de template
   */
  async updateTemplateItem(
    templateId: number,
    itemId: number,
    data: Partial<CreateTemplateItemData>
  ): Promise<OnboardingTemplateItem> {
    const response = await api.put<{ data: OnboardingTemplateItem }>(
      `/onboarding/templates/${templateId}/items/${itemId}`,
      data
    )
    return response.data.data
  }

  /**
   * Remove item de template
   */
  async deleteTemplateItem(templateId: number, itemId: number): Promise<void> {
    await api.delete(`/onboarding/templates/${templateId}/items/${itemId}`)
  }

  /**
   * Reordena items de um template
   */
  async reorderTemplateItems(
    templateId: number,
    itemIds: number[]
  ): Promise<OnboardingTemplateItem[]> {
    const response = await api.post<{ data: OnboardingTemplateItem[] }>(
      `/onboarding/templates/${templateId}/items/reorder`,
      { itemIds }
    )
    return response.data.data
  }

  // ========== Checklists ==========

  /**
   * Lista checklists com filtros
   */
  async listChecklists(filters: ChecklistFilters = {}): Promise<{ data: OnboardingChecklist[]; meta: any }> {
    const response = await api.get('/onboarding/checklists', { params: filters })
    return response.data
  }

  /**
   * Busca checklist por ID
   */
  async getChecklist(id: number): Promise<OnboardingChecklist> {
    const response = await api.get<{ data: OnboardingChecklist }>(`/onboarding/checklists/${id}`)
    return response.data.data
  }

  /**
   * Cria checklist para um colaborador
   */
  async createChecklist(employeeId: number, templateId: number): Promise<OnboardingChecklist> {
    const response = await api.post<{ data: OnboardingChecklist }>('/onboarding/checklists', {
      employeeId,
      templateId,
    })
    return response.data.data
  }

  /**
   * Marca item da checklist como completo
   */
  async completeChecklistItem(checklistId: number, itemId: number, notes?: string): Promise<void> {
    await api.put(`/onboarding/checklists/${checklistId}/items/${itemId}/complete`, { notes })
  }

  /**
   * Pula item da checklist
   */
  async skipChecklistItem(checklistId: number, itemId: number, notes?: string): Promise<void> {
    await api.put(`/onboarding/checklists/${checklistId}/items/${itemId}/skip`, { notes })
  }

  /**
   * Cancela checklist
   */
  async cancelChecklist(id: number): Promise<void> {
    await api.patch(`/onboarding/checklists/${id}/cancel`)
  }
}

export default new OnboardingService()

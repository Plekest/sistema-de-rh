import api from '@/services/api'
import type {
  TalentPoolEntry,
  TalentPoolTag,
  CreateTalentPoolEntryData,
  UpdateTalentPoolEntryData,
  TalentPoolFilters,
} from '../types'

class TalentPoolService {
  /**
   * Lista entradas do talent pool com filtros
   */
  async list(filters: TalentPoolFilters = {}): Promise<{ data: TalentPoolEntry[]; meta: any }> {
    const response = await api.get('/talent-pool', { params: filters })
    return response.data
  }

  /**
   * Busca entrada por ID
   */
  async show(id: number): Promise<TalentPoolEntry> {
    const response = await api.get<{ data: TalentPoolEntry }>(`/talent-pool/${id}`)
    return response.data.data
  }

  /**
   * Cria nova entrada
   */
  async create(data: CreateTalentPoolEntryData): Promise<TalentPoolEntry> {
    const response = await api.post<{ data: TalentPoolEntry }>('/talent-pool', data)
    return response.data.data
  }

  /**
   * Atualiza entrada
   */
  async update(id: number, data: UpdateTalentPoolEntryData): Promise<TalentPoolEntry> {
    const response = await api.put<{ data: TalentPoolEntry }>(`/talent-pool/${id}`, data)
    return response.data.data
  }

  /**
   * Arquiva entrada
   */
  async archive(id: number): Promise<TalentPoolEntry> {
    const response = await api.patch<{ data: TalentPoolEntry }>(`/talent-pool/${id}/archive`)
    return response.data.data
  }

  /**
   * Importa candidato rejeitado para o talent pool
   */
  async importFromCandidate(candidateId: number): Promise<TalentPoolEntry> {
    const response = await api.post<{ data: TalentPoolEntry }>('/talent-pool/import', { candidateId })
    return response.data.data
  }

  /**
   * Lista tags
   */
  async listTags(): Promise<TalentPoolTag[]> {
    const response = await api.get<{ data: TalentPoolTag[] }>('/talent-pool/tags')
    return response.data.data
  }

  /**
   * Cria tag
   */
  async createTag(name: string, color?: string): Promise<TalentPoolTag> {
    const response = await api.post<{ data: TalentPoolTag }>('/talent-pool/tags', { name, color })
    return response.data.data
  }

  /**
   * Deleta tag
   */
  async deleteTag(id: number): Promise<void> {
    await api.delete(`/talent-pool/tags/${id}`)
  }

  /**
   * Adiciona tags a uma entrada
   */
  async addTags(entryId: number, tagIds: number[]): Promise<TalentPoolEntry> {
    const response = await api.post<{ data: TalentPoolEntry }>(`/talent-pool/${entryId}/tags`, { tagIds })
    return response.data.data
  }

  /**
   * Remove tags de uma entrada
   */
  async removeTags(entryId: number, tagIds: number[]): Promise<TalentPoolEntry> {
    const response = await api.delete(`/talent-pool/${entryId}/tags`, { data: { tagIds } })
    return response.data.data
  }
}

export default new TalentPoolService()

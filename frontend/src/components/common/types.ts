/**
 * Tipos compartilhados dos componentes comuns
 */

/**
 * Definicao de coluna da DataTable
 */
export interface DataTableColumn {
  /** Chave do campo no objeto de dados (usado para acessar o valor) */
  key: string
  /** Label exibido no header da coluna */
  label: string
  /** Se a coluna suporta ordenacao */
  sortable?: boolean
  /** Alinhamento do conteudo (padrao: left) */
  align?: 'left' | 'center' | 'right'
  /** Largura fixa ou minima (ex: '120px', '15%') */
  width?: string
}

/**
 * Informacao de ordenacao atual
 */
export interface SortInfo {
  key: string
  direction: 'asc' | 'desc'
}

/**
 * Converte um valor para number de forma segura.
 * PostgreSQL retorna campos numeric/decimal como strings;
 * esta funcao garante a conversao correta.
 */
export function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  if (isNaN(num)) return 0
  return num
}

/**
 * Converte valor de campos PostgreSQL numeric/decimal para number.
 * Alias semantico de toNumber() para uso em contextos financeiros.
 * PostgreSQL retorna campos `numeric` e `decimal` como strings
 * (ex: "1500.00" em vez de 1500). Esta funcao garante a conversao segura.
 */
export function toDecimal(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const trimmed = String(value).trim()
  if (trimmed === '') return 0
  const num = Number(trimmed)
  if (isNaN(num)) return 0
  return num
}

/**
 * Converte e arredonda para 2 casas decimais (monetario).
 */
export function toMoney(value: any): number {
  const num = toNumber(value)
  return Math.round(num * 100) / 100
}

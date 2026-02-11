export function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  if (isNaN(num)) return 0
  return num
}

export function toMoney(value: any): number {
  const num = toNumber(value)
  return Math.round(num * 100) / 100
}

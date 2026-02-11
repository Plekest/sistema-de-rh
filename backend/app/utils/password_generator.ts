import { randomBytes } from 'node:crypto'

export function generateRandomPassword(): string {
  const length = 12
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
  const randomBytesBuffer = randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[randomBytesBuffer[i] % chars.length]
  }
  const hasNumber = /\d/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasSymbol = /[!@#$%&*]/.test(password)
  if (!hasNumber || !hasUpper || !hasLower || !hasSymbol) {
    return generateRandomPassword()
  }
  return password
}

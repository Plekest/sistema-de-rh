import vine from '@vinejs/vine'

export const updateRolePermissionsValidator = vine.compile(
  vine.object({
    permissions: vine.array(
      vine.object({
        role: vine.enum(['admin', 'manager', 'employee']),
        module: vine.enum(['employees', 'attendance', 'hours_bank', 'documents', 'history']),
        canAccess: vine.boolean(),
      })
    ).minLength(1),
  })
)

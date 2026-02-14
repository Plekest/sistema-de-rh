import vine from '@vinejs/vine'

export const listNotificationValidator = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    isRead: vine.boolean().optional(),
    type: vine
      .enum(['leave_approved', 'leave_rejected', 'document_uploaded', 'salary_changed', 'general'])
      .optional(),
  })
)

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  isRead: boolean
  readAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

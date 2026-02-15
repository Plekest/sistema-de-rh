import RolePermission from '#models/role_permission'

type Role = 'admin' | 'manager' | 'employee'
type Module =
  | 'employees'
  | 'attendance'
  | 'hours_bank'
  | 'documents'
  | 'history'
  | 'leave'
  | 'benefits'
  | 'payroll'
  | 'performance'
  | 'recruitment'
  | 'training'
  | 'calendar'
  | 'onboarding'
  | 'surveys'
  | 'orgchart'
  | 'dashboard'
  | 'skills'
  | 'career'
  | 'health'
  | 'analytics'

interface PermissionEntry {
  role: Role
  module: Module
  canAccess: boolean
}

interface PermissionsMap {
  [key: string]: boolean
  employees: boolean
  attendance: boolean
  hours_bank: boolean
  documents: boolean
  history: boolean
  leave: boolean
  benefits: boolean
  payroll: boolean
  performance: boolean
  recruitment: boolean
  training: boolean
  calendar: boolean
  onboarding: boolean
  surveys: boolean
  orgchart: boolean
  dashboard: boolean
  skills: boolean
  career: boolean
  health: boolean
  analytics: boolean
}

interface GroupedPermissions {
  [key: string]: PermissionsMap
  admin: PermissionsMap
  manager: PermissionsMap
  employee: PermissionsMap
}

const DEFAULT_PERMISSIONS: Record<Role, PermissionsMap> = {
  admin: {
    employees: true,
    attendance: true,
    hours_bank: true,
    documents: true,
    history: true,
    leave: true,
    benefits: true,
    payroll: true,
    performance: true,
    recruitment: true,
    training: true,
    calendar: true,
    onboarding: true,
    surveys: true,
    orgchart: true,
    dashboard: true,
    skills: true,
    career: true,
    health: true,
    analytics: true,
  },
  manager: {
    employees: true,
    attendance: true,
    hours_bank: true,
    documents: true,
    history: true,
    leave: true,
    benefits: true,
    payroll: true,
    performance: true,
    recruitment: true,
    training: true,
    calendar: true,
    onboarding: true,
    surveys: true,
    orgchart: true,
    dashboard: true,
    skills: true,
    career: true,
    health: true,
    analytics: false,
  },
  employee: {
    employees: false,
    attendance: true,
    hours_bank: true,
    documents: true,
    history: false,
    leave: true,
    benefits: true,
    payroll: true,
    performance: true,
    recruitment: false,
    training: true,
    calendar: true,
    onboarding: true,
    surveys: true,
    orgchart: true,
    dashboard: true,
    skills: true,
    career: true,
    health: true,
    analytics: false,
  },
}

export default class RolePermissionService {
  async getAll(): Promise<GroupedPermissions> {
    const permissions = await RolePermission.query().orderBy('role').orderBy('module')

    const grouped: GroupedPermissions = {
      admin: { ...DEFAULT_PERMISSIONS.admin },
      manager: { ...DEFAULT_PERMISSIONS.manager },
      employee: { ...DEFAULT_PERMISSIONS.employee },
    }

    for (const perm of permissions) {
      grouped[perm.role][perm.module] = perm.canAccess
    }

    return grouped
  }

  async getByRole(role: Role): Promise<PermissionsMap> {
    const permissions = await RolePermission.query().where('role', role)

    if (permissions.length === 0) {
      return { ...DEFAULT_PERMISSIONS[role] }
    }

    const result: PermissionsMap = { ...DEFAULT_PERMISSIONS[role] }

    for (const perm of permissions) {
      result[perm.module] = perm.canAccess
    }

    return result
  }

  async update(permissions: PermissionEntry[]): Promise<GroupedPermissions> {
    for (const perm of permissions) {
      await RolePermission.updateOrCreate(
        { role: perm.role, module: perm.module },
        { canAccess: perm.canAccess }
      )
    }

    return this.getAll()
  }
}

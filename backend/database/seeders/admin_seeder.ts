import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import Employee from '#models/employee'
import EmployeeHistory from '#models/employee_history'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // --- Usuarios ---
    const admin = await User.updateOrCreate(
      { email: 'admin@sistema-rh.com' },
      {
        fullName: 'Administrador',
        email: 'admin@sistema-rh.com',
        password: 'admin123456',
        role: 'admin',
        isActive: true,
      }
    )

    const manager = await User.updateOrCreate(
      { email: 'gerente@sistema-rh.com' },
      {
        fullName: 'Maria Gerente',
        email: 'gerente@sistema-rh.com',
        password: 'gerente123456',
        role: 'manager',
        isActive: true,
      }
    )

    const employeeUser = await User.updateOrCreate(
      { email: 'joao.silva@sistema-rh.com' },
      {
        fullName: 'Joao Silva',
        email: 'joao.silva@sistema-rh.com',
        password: 'employee123456',
        role: 'employee',
        isActive: true,
      }
    )

    // --- Departamentos ---
    const depTI = await Department.updateOrCreate(
      { name: 'Tecnologia da Informacao' },
      { name: 'Tecnologia da Informacao' }
    )

    const depRH = await Department.updateOrCreate(
      { name: 'Recursos Humanos' },
      { name: 'Recursos Humanos' }
    )

    const depFinanceiro = await Department.updateOrCreate(
      { name: 'Financeiro' },
      { name: 'Financeiro' }
    )

    const depComercial = await Department.updateOrCreate(
      { name: 'Comercial' },
      { name: 'Comercial' }
    )

    await Department.updateOrCreate(
      { name: 'Juridico' },
      { name: 'Juridico' }
    )

    // --- Cargos ---
    const cargoDevSr = await Position.updateOrCreate(
      { title: 'Desenvolvedor Senior', departmentId: depTI.id },
      { title: 'Desenvolvedor Senior', departmentId: depTI.id }
    )

    const cargoDevPl = await Position.updateOrCreate(
      { title: 'Desenvolvedor Pleno', departmentId: depTI.id },
      { title: 'Desenvolvedor Pleno', departmentId: depTI.id }
    )

    await Position.updateOrCreate(
      { title: 'Desenvolvedor Junior', departmentId: depTI.id },
      { title: 'Desenvolvedor Junior', departmentId: depTI.id }
    )

    const cargoGerenteRH = await Position.updateOrCreate(
      { title: 'Gerente de RH', departmentId: depRH.id },
      { title: 'Gerente de RH', departmentId: depRH.id }
    )

    const cargoAnalistaFin = await Position.updateOrCreate(
      { title: 'Analista Financeiro', departmentId: depFinanceiro.id },
      { title: 'Analista Financeiro', departmentId: depFinanceiro.id }
    )

    await Position.updateOrCreate(
      { title: 'Vendedor', departmentId: depComercial.id },
      { title: 'Vendedor', departmentId: depComercial.id }
    )

    await Position.updateOrCreate(
      { title: 'Tech Lead', departmentId: depTI.id },
      { title: 'Tech Lead', departmentId: depTI.id }
    )

    // --- Colaboradores ---
    const emp1 = await Employee.updateOrCreate(
      { email: 'joao.silva@sistema-rh.com' },
      {
        userId: employeeUser.id,
        registrationNumber: 'MAT-001',
        fullName: 'Joao Silva',
        cpf: '123.456.789-00',
        email: 'joao.silva@sistema-rh.com',
        phone: '(11) 99999-0001',
        type: 'clt',
        departmentId: depTI.id,
        positionId: cargoDevSr.id,
        hireDate: DateTime.fromISO('2023-03-15'),
        salary: 12000.0,
        status: 'active',
        birthDate: DateTime.fromISO('1990-05-20'),
        addressCity: 'Sao Paulo',
        addressState: 'SP',
      }
    )

    const emp2 = await Employee.updateOrCreate(
      { email: 'gerente@sistema-rh.com' },
      {
        userId: manager.id,
        registrationNumber: 'MAT-002',
        fullName: 'Maria Gerente',
        cpf: '987.654.321-00',
        email: 'gerente@sistema-rh.com',
        phone: '(11) 99999-0002',
        type: 'clt',
        departmentId: depRH.id,
        positionId: cargoGerenteRH.id,
        hireDate: DateTime.fromISO('2022-01-10'),
        salary: 15000.0,
        status: 'active',
        birthDate: DateTime.fromISO('1985-08-12'),
        addressCity: 'Sao Paulo',
        addressState: 'SP',
      }
    )

    await Employee.updateOrCreate(
      { email: 'carlos.dev@sistema-rh.com' },
      {
        registrationNumber: 'MAT-003',
        fullName: 'Carlos Oliveira',
        cpf: '111.222.333-44',
        email: 'carlos.dev@sistema-rh.com',
        phone: '(11) 99999-0003',
        type: 'clt',
        departmentId: depTI.id,
        positionId: cargoDevPl.id,
        hireDate: DateTime.fromISO('2024-06-01'),
        salary: 8500.0,
        status: 'active',
        birthDate: DateTime.fromISO('1995-11-30'),
        addressCity: 'Campinas',
        addressState: 'SP',
      }
    )

    await Employee.updateOrCreate(
      { email: 'ana.financeiro@sistema-rh.com' },
      {
        registrationNumber: 'MAT-004',
        fullName: 'Ana Santos',
        cpf: '555.666.777-88',
        email: 'ana.financeiro@sistema-rh.com',
        phone: '(11) 99999-0004',
        type: 'clt',
        departmentId: depFinanceiro.id,
        positionId: cargoAnalistaFin.id,
        hireDate: DateTime.fromISO('2023-09-01'),
        salary: 7500.0,
        status: 'active',
        birthDate: DateTime.fromISO('1992-03-25'),
        addressCity: 'Sao Paulo',
        addressState: 'SP',
      }
    )

    await Employee.updateOrCreate(
      { email: 'pedro.pj@sistema-rh.com' },
      {
        registrationNumber: 'MAT-005',
        fullName: 'Pedro Consultor',
        cnpj: '12.345.678/0001-90',
        email: 'pedro.pj@sistema-rh.com',
        phone: '(11) 99999-0005',
        type: 'pj',
        departmentId: depTI.id,
        positionId: cargoDevSr.id,
        hireDate: DateTime.fromISO('2024-01-15'),
        salary: 18000.0,
        status: 'active',
        addressCity: 'Rio de Janeiro',
        addressState: 'RJ',
      }
    )

    // --- Historico de admissao ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: emp1.id, type: 'hire' },
      {
        employeeId: emp1.id,
        type: 'hire',
        title: 'Admissao de Joao Silva',
        description: 'Colaborador admitido na empresa',
        eventDate: DateTime.fromISO('2023-03-15'),
        createdBy: admin.id,
      }
    )

    await EmployeeHistory.updateOrCreate(
      { employeeId: emp2.id, type: 'hire' },
      {
        employeeId: emp2.id,
        type: 'hire',
        title: 'Admissao de Maria Gerente',
        description: 'Colaborador admitido na empresa',
        eventDate: DateTime.fromISO('2022-01-10'),
        createdBy: admin.id,
      }
    )
  }
}

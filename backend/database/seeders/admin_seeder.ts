import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Department from '#models/department'
import Position from '#models/position'
import Employee from '#models/employee'
import EmployeeHistory from '#models/employee_history'
import TimeEntry from '#models/time_entry'
import HoursBank from '#models/hours_bank'
import Document from '#models/document'
import RolePermission from '#models/role_permission'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    console.log('Iniciando seed...')

    // ============================================================
    // 1. USUARIOS
    // ============================================================
    console.log('Criando usuarios...')

    const admin = await User.updateOrCreate(
      { email: 'admin@sistema-rh.com' },
      {
        fullName: 'Administrador',
        email: 'admin@sistema-rh.com',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      }
    )

    const manager = await User.updateOrCreate(
      { email: 'gerente@sistema-rh.com' },
      {
        fullName: 'Maria Oliveira',
        email: 'gerente@sistema-rh.com',
        password: 'gerente123456',
        role: 'manager',
        isActive: true,
      }
    )

    const userJoao = await User.updateOrCreate(
      { email: 'joao.silva@sistema-rh.com' },
      {
        fullName: 'Joao Silva',
        email: 'joao.silva@sistema-rh.com',
        password: 'employee123456',
        role: 'employee',
        isActive: true,
      }
    )

    const userAna = await User.updateOrCreate(
      { email: 'ana.santos@sistema-rh.com' },
      {
        fullName: 'Ana Santos',
        email: 'ana.santos@sistema-rh.com',
        password: 'employee123456',
        role: 'employee',
        isActive: true,
      }
    )

    const userCarlos = await User.updateOrCreate(
      { email: 'carlos.oliveira@sistema-rh.com' },
      {
        fullName: 'Carlos Oliveira',
        email: 'carlos.oliveira@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userPedro = await User.updateOrCreate(
      { email: 'pedro.mendes@sistema-rh.com' },
      {
        fullName: 'Pedro Mendes',
        email: 'pedro.mendes@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userFernanda = await User.updateOrCreate(
      { email: 'fernanda.lima@sistema-rh.com' },
      {
        fullName: 'Fernanda Lima',
        email: 'fernanda.lima@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userRafael = await User.updateOrCreate(
      { email: 'rafael.costa@sistema-rh.com' },
      {
        fullName: 'Rafael Costa',
        email: 'rafael.costa@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userJuliana = await User.updateOrCreate(
      { email: 'juliana.ferreira@sistema-rh.com' },
      {
        fullName: 'Juliana Ferreira',
        email: 'juliana.ferreira@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userBruno = await User.updateOrCreate(
      { email: 'bruno.almeida@sistema-rh.com' },
      {
        fullName: 'Bruno Almeida',
        email: 'bruno.almeida@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userCamila = await User.updateOrCreate(
      { email: 'camila.rodrigues@sistema-rh.com' },
      {
        fullName: 'Camila Rodrigues',
        email: 'camila.rodrigues@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userLucas = await User.updateOrCreate(
      { email: 'lucas.nascimento@sistema-rh.com' },
      {
        fullName: 'Lucas Nascimento',
        email: 'lucas.nascimento@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userPatricia = await User.updateOrCreate(
      { email: 'patricia.souza@sistema-rh.com' },
      {
        fullName: 'Patricia Souza',
        email: 'patricia.souza@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userThiago = await User.updateOrCreate(
      { email: 'thiago.martins@sistema-rh.com' },
      {
        fullName: 'Thiago Martins',
        email: 'thiago.martins@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userRenata = await User.updateOrCreate(
      { email: 'renata.barbosa@sistema-rh.com' },
      {
        fullName: 'Renata Barbosa',
        email: 'renata.barbosa@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userGustavo = await User.updateOrCreate(
      { email: 'gustavo.pereira@sistema-rh.com' },
      {
        fullName: 'Gustavo Pereira',
        email: 'gustavo.pereira@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: true,
      }
    )

    const userMariana = await User.updateOrCreate(
      { email: 'mariana.araujo@sistema-rh.com' },
      {
        fullName: 'Mariana Araujo',
        email: 'mariana.araujo@sistema-rh.com',
        password: 'Mudar@123',
        role: 'employee',
        isActive: false,
      }
    )

    // ============================================================
    // 2. DEPARTAMENTOS
    // ============================================================
    console.log('Criando departamentos...')

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

    const depJuridico = await Department.updateOrCreate(
      { name: 'Juridico' },
      { name: 'Juridico' }
    )

    const depMarketing = await Department.updateOrCreate(
      { name: 'Marketing' },
      { name: 'Marketing' }
    )

    const depOperacoes = await Department.updateOrCreate(
      { name: 'Operacoes' },
      { name: 'Operacoes' }
    )

    const depAdministrativo = await Department.updateOrCreate(
      { name: 'Administrativo' },
      { name: 'Administrativo' }
    )

    // ============================================================
    // 3. CARGOS
    // ============================================================
    console.log('Criando cargos...')

    // TI
    const cargoDevSr = await Position.updateOrCreate(
      { title: 'Desenvolvedor Senior', departmentId: depTI.id },
      { title: 'Desenvolvedor Senior', departmentId: depTI.id }
    )

    const cargoDevPl = await Position.updateOrCreate(
      { title: 'Desenvolvedor Pleno', departmentId: depTI.id },
      { title: 'Desenvolvedor Pleno', departmentId: depTI.id }
    )

    const cargoDevJr = await Position.updateOrCreate(
      { title: 'Desenvolvedor Junior', departmentId: depTI.id },
      { title: 'Desenvolvedor Junior', departmentId: depTI.id }
    )

    const cargoTechLead = await Position.updateOrCreate(
      { title: 'Tech Lead', departmentId: depTI.id },
      { title: 'Tech Lead', departmentId: depTI.id }
    )

    const cargoQA = await Position.updateOrCreate(
      { title: 'Analista de QA', departmentId: depTI.id },
      { title: 'Analista de QA', departmentId: depTI.id }
    )

    const cargoDBA = await Position.updateOrCreate(
      { title: 'DBA', departmentId: depTI.id },
      { title: 'DBA', departmentId: depTI.id }
    )

    // RH
    const cargoGerenteRH = await Position.updateOrCreate(
      { title: 'Gerente de RH', departmentId: depRH.id },
      { title: 'Gerente de RH', departmentId: depRH.id }
    )

    const cargoAnalistaRH = await Position.updateOrCreate(
      { title: 'Analista de RH', departmentId: depRH.id },
      { title: 'Analista de RH', departmentId: depRH.id }
    )

    // Financeiro
    const cargoAnalistaFin = await Position.updateOrCreate(
      { title: 'Analista Financeiro', departmentId: depFinanceiro.id },
      { title: 'Analista Financeiro', departmentId: depFinanceiro.id }
    )

    const cargoController = await Position.updateOrCreate(
      { title: 'Controller', departmentId: depFinanceiro.id },
      { title: 'Controller', departmentId: depFinanceiro.id }
    )

    // Comercial
    const cargoVendedorSr = await Position.updateOrCreate(
      { title: 'Vendedor Senior', departmentId: depComercial.id },
      { title: 'Vendedor Senior', departmentId: depComercial.id }
    )

    const cargoVendedor = await Position.updateOrCreate(
      { title: 'Vendedor', departmentId: depComercial.id },
      { title: 'Vendedor', departmentId: depComercial.id }
    )

    await Position.updateOrCreate(
      { title: 'Gerente Comercial', departmentId: depComercial.id },
      { title: 'Gerente Comercial', departmentId: depComercial.id }
    )

    // Juridico
    const cargoAdvogado = await Position.updateOrCreate(
      { title: 'Advogado', departmentId: depJuridico.id },
      { title: 'Advogado', departmentId: depJuridico.id }
    )

    // Marketing
    const cargoAnalistaMarketing = await Position.updateOrCreate(
      { title: 'Analista de Marketing', departmentId: depMarketing.id },
      { title: 'Analista de Marketing', departmentId: depMarketing.id }
    )

    // Operacoes
    const cargoCoordenadorOps = await Position.updateOrCreate(
      { title: 'Coordenador de Operacoes', departmentId: depOperacoes.id },
      { title: 'Coordenador de Operacoes', departmentId: depOperacoes.id }
    )

    // Administrativo
    const cargoAssistAdmin = await Position.updateOrCreate(
      { title: 'Assistente Administrativo', departmentId: depAdministrativo.id },
      { title: 'Assistente Administrativo', departmentId: depAdministrativo.id }
    )

    // ============================================================
    // 4. COLABORADORES
    // ============================================================
    console.log('Criando colaboradores...')

    // MAT-001 - Joao Silva - Dev Senior - TI - CLT
    const empJoao = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-001' },
      {
        userId: userJoao.id,
        registrationNumber: 'MAT-001',
        fullName: 'Joao Silva',
        cpf: '341.285.917-06',
        email: 'joao.silva@sistema-rh.com',
        phone: '(11) 98432-1567',
        type: 'clt',
        departmentId: depTI.id,
        positionId: cargoDevSr.id,
        hireDate: DateTime.fromISO('2022-03-15'),
        salary: 14500.0,
        status: 'active',
        birthDate: DateTime.fromISO('1990-05-20'),
        addressStreet: 'Rua Augusta',
        addressNumber: '1247',
        addressComplement: 'Apto 82',
        addressNeighborhood: 'Consolacao',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '01305-100',
      }
    )

    // MAT-002 - Maria Oliveira - Gerente de RH - CLT
    const empMaria = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-002' },
      {
        userId: manager.id,
        registrationNumber: 'MAT-002',
        fullName: 'Maria Oliveira',
        cpf: '782.451.963-34',
        email: 'gerente@sistema-rh.com',
        phone: '(11) 97651-3248',
        type: 'clt',
        departmentId: depRH.id,
        positionId: cargoGerenteRH.id,
        hireDate: DateTime.fromISO('2021-06-01'),
        salary: 18500.0,
        status: 'active',
        birthDate: DateTime.fromISO('1985-08-12'),
        addressStreet: 'Avenida Paulista',
        addressNumber: '900',
        addressComplement: 'Cj 1204',
        addressNeighborhood: 'Bela Vista',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '01310-100',
      }
    )

    // MAT-003 - Carlos Oliveira - Dev Pleno - TI - CLT
    const empCarlos = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-003' },
      {
        userId: userCarlos.id,
        registrationNumber: 'MAT-003',
        fullName: 'Carlos Oliveira',
        cpf: '156.934.728-51',
        email: 'carlos.oliveira@sistema-rh.com',
        phone: '(19) 99187-4532',
        type: 'clt',
        departmentId: depTI.id,
        positionId: cargoDevPl.id,
        hireDate: DateTime.fromISO('2023-01-10'),
        salary: 9800.0,
        status: 'active',
        birthDate: DateTime.fromISO('1995-11-30'),
        addressStreet: 'Rua Barao de Jaguara',
        addressNumber: '578',
        addressNeighborhood: 'Centro',
        addressCity: 'Campinas',
        addressState: 'SP',
        addressZip: '13015-001',
      }
    )

    // MAT-004 - Ana Santos - Analista Financeiro - CLT
    const empAna = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-004' },
      {
        userId: userAna.id,
        registrationNumber: 'MAT-004',
        fullName: 'Ana Santos',
        cpf: '498.317.625-80',
        email: 'ana.santos@sistema-rh.com',
        phone: '(11) 98765-2143',
        type: 'clt',
        departmentId: depFinanceiro.id,
        positionId: cargoAnalistaFin.id,
        hireDate: DateTime.fromISO('2023-09-01'),
        salary: 8200.0,
        status: 'active',
        birthDate: DateTime.fromISO('1992-03-25'),
        addressStreet: 'Rua Oscar Freire',
        addressNumber: '340',
        addressComplement: 'Apto 45',
        addressNeighborhood: 'Pinheiros',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '01426-001',
      }
    )

    // MAT-005 - Pedro Mendes - Tech Lead - TI - PJ
    const empPedro = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-005' },
      {
        userId: userPedro.id,
        registrationNumber: 'MAT-005',
        fullName: 'Pedro Mendes',
        cnpj: '42.318.765/0001-92',
        email: 'pedro.mendes@sistema-rh.com',
        phone: '(21) 99876-5432',
        type: 'pj',
        departmentId: depTI.id,
        positionId: cargoTechLead.id,
        hireDate: DateTime.fromISO('2022-08-01'),
        salary: 25000.0,
        status: 'active',
        birthDate: DateTime.fromISO('1987-12-03'),
        addressStreet: 'Rua Visconde de Piraja',
        addressNumber: '82',
        addressComplement: 'Sala 301',
        addressNeighborhood: 'Ipanema',
        addressCity: 'Rio de Janeiro',
        addressState: 'RJ',
        addressZip: '22410-003',
      }
    )

    // MAT-006 - Fernanda Lima - Analista de RH - CLT
    const empFernanda = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-006' },
      {
        userId: userFernanda.id,
        registrationNumber: 'MAT-006',
        fullName: 'Fernanda Lima',
        cpf: '623.871.459-12',
        email: 'fernanda.lima@sistema-rh.com',
        phone: '(11) 97432-8910',
        type: 'clt',
        departmentId: depRH.id,
        positionId: cargoAnalistaRH.id,
        hireDate: DateTime.fromISO('2023-04-17'),
        salary: 6800.0,
        status: 'active',
        birthDate: DateTime.fromISO('1994-07-18'),
        addressStreet: 'Rua Vergueiro',
        addressNumber: '1635',
        addressComplement: 'Bloco B Apto 22',
        addressNeighborhood: 'Vila Mariana',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '04101-000',
      }
    )

    // MAT-007 - Rafael Costa - Dev Junior - TI - CLT
    const empRafael = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-007' },
      {
        userId: userRafael.id,
        registrationNumber: 'MAT-007',
        fullName: 'Rafael Costa',
        cpf: '215.763.894-67',
        email: 'rafael.costa@sistema-rh.com',
        phone: '(41) 99654-7821',
        type: 'clt',
        departmentId: depTI.id,
        positionId: cargoDevJr.id,
        hireDate: DateTime.fromISO('2024-07-15'),
        salary: 4500.0,
        status: 'active',
        birthDate: DateTime.fromISO('2000-01-09'),
        addressStreet: 'Rua XV de Novembro',
        addressNumber: '423',
        addressNeighborhood: 'Centro',
        addressCity: 'Curitiba',
        addressState: 'PR',
        addressZip: '80020-310',
      }
    )

    // MAT-008 - Juliana Ferreira - Vendedora Senior - Comercial - CLT
    const empJuliana = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-008' },
      {
        userId: userJuliana.id,
        registrationNumber: 'MAT-008',
        fullName: 'Juliana Ferreira',
        cpf: '879.214.536-93',
        email: 'juliana.ferreira@sistema-rh.com',
        phone: '(11) 98321-6754',
        type: 'clt',
        departmentId: depComercial.id,
        positionId: cargoVendedorSr.id,
        hireDate: DateTime.fromISO('2021-11-20'),
        salary: 9500.0,
        status: 'active',
        birthDate: DateTime.fromISO('1988-04-14'),
        addressStreet: 'Rua da Consolacao',
        addressNumber: '2910',
        addressComplement: 'Apto 154',
        addressNeighborhood: 'Consolacao',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '01302-100',
      }
    )

    // MAT-009 - Bruno Almeida - Advogado - Juridico - PJ
    const empBruno = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-009' },
      {
        userId: userBruno.id,
        registrationNumber: 'MAT-009',
        fullName: 'Bruno Almeida',
        cnpj: '31.456.789/0001-45',
        email: 'bruno.almeida@sistema-rh.com',
        phone: '(31) 98765-4321',
        type: 'pj',
        departmentId: depJuridico.id,
        positionId: cargoAdvogado.id,
        hireDate: DateTime.fromISO('2023-03-01'),
        salary: 20000.0,
        status: 'active',
        birthDate: DateTime.fromISO('1983-09-27'),
        addressStreet: 'Avenida Afonso Pena',
        addressNumber: '1500',
        addressComplement: 'Sala 802',
        addressNeighborhood: 'Funcionarios',
        addressCity: 'Belo Horizonte',
        addressState: 'MG',
        addressZip: '30130-921',
      }
    )

    // MAT-010 - Camila Rodrigues - Analista de Marketing - CLT
    const empCamila = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-010' },
      {
        userId: userCamila.id,
        registrationNumber: 'MAT-010',
        fullName: 'Camila Rodrigues',
        cpf: '734.562.198-40',
        email: 'camila.rodrigues@sistema-rh.com',
        phone: '(11) 99213-4567',
        type: 'clt',
        departmentId: depMarketing.id,
        positionId: cargoAnalistaMarketing.id,
        hireDate: DateTime.fromISO('2024-02-05'),
        salary: 7200.0,
        status: 'active',
        birthDate: DateTime.fromISO('1996-10-31'),
        addressStreet: 'Rua Pamplona',
        addressNumber: '518',
        addressNeighborhood: 'Jardim Paulista',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '01405-000',
      }
    )

    // MAT-011 - Lucas Nascimento - Analista de QA - TI - CLT
    const empLucas = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-011' },
      {
        userId: userLucas.id,
        registrationNumber: 'MAT-011',
        fullName: 'Lucas Nascimento',
        cpf: '412.897.653-28',
        email: 'lucas.nascimento@sistema-rh.com',
        phone: '(19) 98432-1098',
        type: 'clt',
        departmentId: depTI.id,
        positionId: cargoQA.id,
        hireDate: DateTime.fromISO('2023-06-12'),
        salary: 7500.0,
        status: 'active',
        birthDate: DateTime.fromISO('1993-02-14'),
        addressStreet: 'Avenida Norte Sul',
        addressNumber: '890',
        addressComplement: 'Apto 31',
        addressNeighborhood: 'Jardim Chapadao',
        addressCity: 'Campinas',
        addressState: 'SP',
        addressZip: '13070-710',
      }
    )

    // MAT-012 - Patricia Souza - Controller - Financeiro - CLT
    const empPatricia = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-012' },
      {
        userId: userPatricia.id,
        registrationNumber: 'MAT-012',
        fullName: 'Patricia Souza',
        cpf: '567.321.984-75',
        email: 'patricia.souza@sistema-rh.com',
        phone: '(11) 97654-3219',
        type: 'clt',
        departmentId: depFinanceiro.id,
        positionId: cargoController.id,
        hireDate: DateTime.fromISO('2021-09-15'),
        salary: 16000.0,
        status: 'active',
        birthDate: DateTime.fromISO('1982-06-08'),
        addressStreet: 'Rua Haddock Lobo',
        addressNumber: '595',
        addressComplement: 'Cj 32',
        addressNeighborhood: 'Cerqueira Cesar',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '01414-001',
      }
    )

    // MAT-013 - Thiago Martins - Coordenador de Operacoes - CLT
    const empThiago = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-013' },
      {
        userId: userThiago.id,
        registrationNumber: 'MAT-013',
        fullName: 'Thiago Martins',
        cpf: '893.157.426-60',
        email: 'thiago.martins@sistema-rh.com',
        phone: '(21) 98123-4567',
        type: 'clt',
        departmentId: depOperacoes.id,
        positionId: cargoCoordenadorOps.id,
        hireDate: DateTime.fromISO('2022-05-02'),
        salary: 11000.0,
        status: 'inactive',
        birthDate: DateTime.fromISO('1991-12-22'),
        addressStreet: 'Rua das Laranjeiras',
        addressNumber: '307',
        addressNeighborhood: 'Laranjeiras',
        addressCity: 'Rio de Janeiro',
        addressState: 'RJ',
        addressZip: '22240-004',
      }
    )

    // MAT-014 - Renata Barbosa - DBA - TI - PJ
    const empRenata = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-014' },
      {
        userId: userRenata.id,
        registrationNumber: 'MAT-014',
        fullName: 'Renata Barbosa',
        cnpj: '56.789.012/0001-78',
        email: 'renata.barbosa@sistema-rh.com',
        phone: '(41) 97654-8901',
        type: 'pj',
        departmentId: depTI.id,
        positionId: cargoDBA.id,
        hireDate: DateTime.fromISO('2024-01-08'),
        salary: 18000.0,
        status: 'active',
        birthDate: DateTime.fromISO('1989-03-15'),
        addressStreet: 'Rua Marechal Deodoro',
        addressNumber: '630',
        addressComplement: 'Sala 1105',
        addressNeighborhood: 'Centro',
        addressCity: 'Curitiba',
        addressState: 'PR',
        addressZip: '80010-010',
      }
    )

    // MAT-015 - Gustavo Pereira - Vendedor - Comercial - CLT
    const empGustavo = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-015' },
      {
        userId: userGustavo.id,
        registrationNumber: 'MAT-015',
        fullName: 'Gustavo Pereira',
        cpf: '246.813.579-02',
        email: 'gustavo.pereira@sistema-rh.com',
        phone: '(11) 96543-2178',
        type: 'clt',
        departmentId: depComercial.id,
        positionId: cargoVendedor.id,
        hireDate: DateTime.fromISO('2024-10-01'),
        salary: 5500.0,
        status: 'active',
        birthDate: DateTime.fromISO('1997-08-05'),
        addressStreet: 'Rua Teodoro Sampaio',
        addressNumber: '1020',
        addressNeighborhood: 'Pinheiros',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '05406-050',
      }
    )

    // MAT-016 - Mariana Araujo - Assistente Administrativo - CLT - TERMINATED
    const empMariana = await Employee.updateOrCreate(
      { registrationNumber: 'MAT-016' },
      {
        userId: userMariana.id,
        registrationNumber: 'MAT-016',
        fullName: 'Mariana Araujo',
        cpf: '678.234.519-41',
        email: 'mariana.araujo@sistema-rh.com',
        phone: '(11) 98456-7123',
        type: 'clt',
        departmentId: depAdministrativo.id,
        positionId: cargoAssistAdmin.id,
        hireDate: DateTime.fromISO('2023-02-13'),
        terminationDate: DateTime.fromISO('2025-10-31'),
        salary: 3800.0,
        status: 'terminated',
        birthDate: DateTime.fromISO('1998-05-19'),
        addressStreet: 'Rua Voluntarios da Patria',
        addressNumber: '190',
        addressComplement: 'Apto 12',
        addressNeighborhood: 'Santana',
        addressCity: 'Sao Paulo',
        addressState: 'SP',
        addressZip: '02011-000',
      }
    )

    // ============================================================
    // 5. TIME ENTRIES (Registros de Ponto) - Last 45 weekdays
    // ============================================================
    console.log('Criando registros de ponto (ultimos 45 dias uteis)...')

    // Only active CLT employees get time entries
    const activeCLTEmployees = [
      empJoao, empMaria, empCarlos, empAna, empFernanda, empRafael,
      empJuliana, empCamila, empLucas, empPatricia, empGustavo,
    ]

    // Each employee has a "personality" for time patterns
    // [avgClockInHour, avgClockInMin, avgClockOutHour, avgClockOutMin, lateVariance, overtimeChance]
    type TimeProfile = {
      clockInBase: number // base minute from midnight for clock-in
      clockInVariance: number // +/- variance in minutes
      lunchStartBase: number
      lunchEndBase: number
      clockOutBase: number
      clockOutVariance: number
      overtimeChance: number // 0.0 to 1.0 - chance of overtime entry
    }

    const timeProfiles: Map<number, TimeProfile> = new Map([
      // Joao - early bird, often works overtime
      [empJoao.id, { clockInBase: 475, clockInVariance: 10, lunchStartBase: 715, lunchEndBase: 775, clockOutBase: 1060, clockOutVariance: 40, overtimeChance: 0.08 }],
      // Maria - punctual manager
      [empMaria.id, { clockInBase: 490, clockInVariance: 15, lunchStartBase: 720, lunchEndBase: 780, clockOutBase: 1050, clockOutVariance: 30, overtimeChance: 0.05 }],
      // Carlos - sometimes a bit late
      [empCarlos.id, { clockInBase: 510, clockInVariance: 20, lunchStartBase: 730, lunchEndBase: 790, clockOutBase: 1060, clockOutVariance: 25, overtimeChance: 0.04 }],
      // Ana - very punctual
      [empAna.id, { clockInBase: 485, clockInVariance: 8, lunchStartBase: 720, lunchEndBase: 775, clockOutBase: 1040, clockOutVariance: 15, overtimeChance: 0.03 }],
      // Fernanda - consistent
      [empFernanda.id, { clockInBase: 495, clockInVariance: 12, lunchStartBase: 725, lunchEndBase: 785, clockOutBase: 1050, clockOutVariance: 20, overtimeChance: 0.04 }],
      // Rafael - junior, sometimes late
      [empRafael.id, { clockInBase: 520, clockInVariance: 25, lunchStartBase: 740, lunchEndBase: 800, clockOutBase: 1070, clockOutVariance: 30, overtimeChance: 0.02 }],
      // Juliana - sales, variable schedule
      [empJuliana.id, { clockInBase: 500, clockInVariance: 20, lunchStartBase: 730, lunchEndBase: 785, clockOutBase: 1080, clockOutVariance: 35, overtimeChance: 0.06 }],
      // Camila - marketing, regular
      [empCamila.id, { clockInBase: 505, clockInVariance: 15, lunchStartBase: 725, lunchEndBase: 790, clockOutBase: 1050, clockOutVariance: 20, overtimeChance: 0.03 }],
      // Lucas - QA, dedicated
      [empLucas.id, { clockInBase: 480, clockInVariance: 10, lunchStartBase: 715, lunchEndBase: 770, clockOutBase: 1065, clockOutVariance: 25, overtimeChance: 0.07 }],
      // Patricia - controller, stays late sometimes
      [empPatricia.id, { clockInBase: 485, clockInVariance: 10, lunchStartBase: 720, lunchEndBase: 775, clockOutBase: 1070, clockOutVariance: 40, overtimeChance: 0.06 }],
      // Gustavo - new salesman, regular
      [empGustavo.id, { clockInBase: 510, clockInVariance: 15, lunchStartBase: 735, lunchEndBase: 795, clockOutBase: 1055, clockOutVariance: 20, overtimeChance: 0.02 }],
    ])

    // Seeded random for reproducibility
    let seed = 42
    function seededRandom(): number {
      seed = (seed * 16807 + 0) % 2147483647
      return (seed - 1) / 2147483646
    }

    function randomInRange(base: number, variance: number): number {
      return Math.floor(base + (seededRandom() * 2 - 1) * variance)
    }

    function minutesToTime(totalMinutes: number): { hour: number; minute: number } {
      return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60 }
    }

    for (const emp of activeCLTEmployees) {
      const profile = timeProfiles.get(emp.id)!
      let overtimeCount = 0

      for (let i = 45; i >= 0; i--) {
        const currentDate = DateTime.now().minus({ days: i })

        // Skip weekends
        if (currentDate.weekday === 6 || currentDate.weekday === 7) {
          continue
        }

        // Today: only clock-in
        if (i === 0) {
          const clockInMinutes = randomInRange(profile.clockInBase, profile.clockInVariance)
          const clockInTime = minutesToTime(clockInMinutes)

          await TimeEntry.updateOrCreate(
            { employeeId: emp.id, date: DateTime.fromSQL(currentDate.toSQLDate()!) },
            {
              employeeId: emp.id,
              date: DateTime.fromSQL(currentDate.toSQLDate()!),
              clockIn: currentDate.set({ hour: clockInTime.hour, minute: clockInTime.minute }),
              clockOut: null,
              lunchStart: null,
              lunchEnd: null,
              totalWorkedMinutes: 0,
              type: 'regular',
              notes: null,
            }
          )
          continue
        }

        // Determine if this is an overtime entry
        const isOvertime = overtimeCount < 3 && seededRandom() < profile.overtimeChance
        if (isOvertime) overtimeCount++

        const clockInMinutes = randomInRange(profile.clockInBase, profile.clockInVariance)
        const lunchStartMinutes = randomInRange(profile.lunchStartBase, 15)
        const lunchEndMinutes = randomInRange(profile.lunchEndBase, 15)
        const clockOutMinutes = isOvertime
          ? randomInRange(profile.clockOutBase + 90, 30)
          : randomInRange(profile.clockOutBase, profile.clockOutVariance)

        const clockInTime = minutesToTime(Math.max(clockInMinutes, 465)) // no earlier than 7:45
        const lunchStartTime = minutesToTime(Math.max(lunchStartMinutes, 705)) // no earlier than 11:45
        const lunchEndTime = minutesToTime(Math.max(lunchEndMinutes, 765)) // no earlier than 12:45
        const clockOutTime = minutesToTime(Math.min(Math.max(clockOutMinutes, 1020), 1170)) // 17:00-19:30

        const clockIn = currentDate.set({ hour: clockInTime.hour, minute: clockInTime.minute })
        const lunchStart = currentDate.set({ hour: lunchStartTime.hour, minute: lunchStartTime.minute })
        const lunchEnd = currentDate.set({ hour: lunchEndTime.hour, minute: lunchEndTime.minute })
        const clockOut = currentDate.set({ hour: clockOutTime.hour, minute: clockOutTime.minute })

        const totalWorkedMinutes = Math.floor(
          clockOut.diff(clockIn, 'minutes').minutes - lunchEnd.diff(lunchStart, 'minutes').minutes
        )

        await TimeEntry.updateOrCreate(
          { employeeId: emp.id, date: DateTime.fromSQL(currentDate.toSQLDate()!) },
          {
            employeeId: emp.id,
            date: DateTime.fromSQL(currentDate.toSQLDate()!),
            clockIn,
            clockOut,
            lunchStart,
            lunchEnd,
            totalWorkedMinutes: Math.max(totalWorkedMinutes, 0),
            type: isOvertime ? 'overtime' : 'regular',
            notes: isOvertime ? 'Hora extra aprovada pela gerencia' : null,
          }
        )
      }
    }

    // ============================================================
    // 6. HOURS BANK (Banco de Horas) - Sep 2025 to Feb 2026
    // ============================================================
    console.log('Criando registros de banco de horas...')

    const monthsToGenerate = [
      { month: 9, year: 2025, workDays: 22 },
      { month: 10, year: 2025, workDays: 23 },
      { month: 11, year: 2025, workDays: 20 },
      { month: 12, year: 2025, workDays: 21 },
      { month: 1, year: 2026, workDays: 22 },
      { month: 2, year: 2026, workDays: 20 },
    ]

    // Balance tendencies per employee:
    // positive = dedicated / works overtime
    // negative = owing hours
    // balanced = near zero
    type BalanceTendency = 'positive' | 'negative' | 'balanced'
    const balanceTendencies: Map<number, BalanceTendency> = new Map([
      [empJoao.id, 'positive'],      // dedicated dev senior
      [empMaria.id, 'balanced'],      // punctual manager
      [empCarlos.id, 'negative'],     // sometimes under
      [empAna.id, 'balanced'],        // very punctual
      [empFernanda.id, 'balanced'],   // consistent
      [empRafael.id, 'negative'],     // junior, still adjusting
      [empJuliana.id, 'positive'],    // sales, hard worker
      [empCamila.id, 'balanced'],     // regular
      [empLucas.id, 'positive'],      // dedicated QA
      [empPatricia.id, 'positive'],   // controller, stays late
      [empGustavo.id, 'balanced'],    // new, regular
    ])

    for (const emp of activeCLTEmployees) {
      let accumulatedBalance = 0
      const tendency = balanceTendencies.get(emp.id) || 'balanced'

      for (const period of monthsToGenerate) {
        const expectedMinutes = period.workDays * 440

        let balanceMinutes: number
        switch (tendency) {
          case 'positive':
            balanceMinutes = Math.floor(seededRandom() * 80) + 10 // +10 to +90
            break
          case 'negative':
            balanceMinutes = Math.floor(seededRandom() * 60) - 50 // -50 to +10
            break
          case 'balanced':
            balanceMinutes = Math.floor(seededRandom() * 40) - 20 // -20 to +20
            break
        }

        const workedMinutes = expectedMinutes + balanceMinutes
        accumulatedBalance += balanceMinutes

        await HoursBank.updateOrCreate(
          {
            employeeId: emp.id,
            referenceMonth: period.month,
            referenceYear: period.year,
          },
          {
            employeeId: emp.id,
            referenceMonth: period.month,
            referenceYear: period.year,
            expectedMinutes,
            workedMinutes,
            balanceMinutes,
            accumulatedBalanceMinutes: accumulatedBalance,
          }
        )
      }
    }

    // ============================================================
    // 7. EMPLOYEE HISTORY (Historico de Colaboradores)
    // ============================================================
    console.log('Criando historico de colaboradores...')

    // --- Joao Silva ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJoao.id, type: 'hire', eventDate: DateTime.fromISO('2022-03-15') },
      {
        employeeId: empJoao.id,
        type: 'hire',
        title: 'Admissao de Joao Silva',
        description: 'Colaborador admitido como Desenvolvedor Pleno no departamento de TI',
        eventDate: DateTime.fromISO('2022-03-15'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJoao.id, type: 'promotion', eventDate: DateTime.fromISO('2023-10-01') },
      {
        employeeId: empJoao.id,
        type: 'promotion',
        title: 'Promocao a Desenvolvedor Senior',
        description: 'Promovido de Desenvolvedor Pleno para Desenvolvedor Senior por excelente desempenho e lideranca tecnica',
        oldValue: 'Desenvolvedor Pleno',
        newValue: 'Desenvolvedor Senior',
        eventDate: DateTime.fromISO('2023-10-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJoao.id, type: 'salary_change', eventDate: DateTime.fromISO('2023-10-01') },
      {
        employeeId: empJoao.id,
        type: 'salary_change',
        title: 'Ajuste salarial por promocao',
        description: 'Reajuste salarial referente a promocao para Desenvolvedor Senior',
        oldValue: '10500.00',
        newValue: '12800.00',
        eventDate: DateTime.fromISO('2023-10-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJoao.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-03-01') },
      {
        employeeId: empJoao.id,
        type: 'salary_change',
        title: 'Reajuste anual',
        description: 'Reajuste anual por merito e inflacao',
        oldValue: '12800.00',
        newValue: '14500.00',
        eventDate: DateTime.fromISO('2025-03-01'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJoao.id, type: 'note', eventDate: DateTime.fromISO('2025-12-15') },
      {
        employeeId: empJoao.id,
        type: 'note',
        title: 'Avaliacao de desempenho 2025',
        description: 'Desempenho excepcional. Liderou a migracao da API legada para microsservicos com zero downtime. Recomendado para posicao de Tech Lead.',
        eventDate: DateTime.fromISO('2025-12-15'),
        createdBy: manager.id,
      }
    )

    // --- Maria Oliveira ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMaria.id, type: 'hire', eventDate: DateTime.fromISO('2021-06-01') },
      {
        employeeId: empMaria.id,
        type: 'hire',
        title: 'Admissao de Maria Oliveira',
        description: 'Colaboradora admitida como Analista de RH Senior',
        eventDate: DateTime.fromISO('2021-06-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMaria.id, type: 'promotion', eventDate: DateTime.fromISO('2022-12-01') },
      {
        employeeId: empMaria.id,
        type: 'promotion',
        title: 'Promocao a Gerente de RH',
        description: 'Promovida de Analista de RH Senior para Gerente de RH, assumindo a gestao de toda a area',
        oldValue: 'Analista de RH Senior',
        newValue: 'Gerente de RH',
        eventDate: DateTime.fromISO('2022-12-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMaria.id, type: 'salary_change', eventDate: DateTime.fromISO('2022-12-01') },
      {
        employeeId: empMaria.id,
        type: 'salary_change',
        title: 'Ajuste salarial por promocao',
        description: 'Reajuste salarial referente a promocao para Gerente de RH',
        oldValue: '12000.00',
        newValue: '16500.00',
        eventDate: DateTime.fromISO('2022-12-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMaria.id, type: 'note', eventDate: DateTime.fromISO('2025-11-20') },
      {
        employeeId: empMaria.id,
        type: 'note',
        title: 'Certificacao em Gestao de Pessoas',
        description: 'Concluiu MBA em Gestao Estrategica de Pessoas pela FGV. Certificado registrado no sistema.',
        eventDate: DateTime.fromISO('2025-11-20'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMaria.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-06-01') },
      {
        employeeId: empMaria.id,
        type: 'salary_change',
        title: 'Reajuste anual',
        description: 'Reajuste anual por dissidio coletivo e merito',
        oldValue: '16500.00',
        newValue: '18500.00',
        eventDate: DateTime.fromISO('2025-06-01'),
        createdBy: admin.id,
      }
    )

    // --- Carlos Oliveira ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empCarlos.id, type: 'hire', eventDate: DateTime.fromISO('2023-01-10') },
      {
        employeeId: empCarlos.id,
        type: 'hire',
        title: 'Admissao de Carlos Oliveira',
        description: 'Colaborador admitido como Desenvolvedor Junior no departamento de TI',
        eventDate: DateTime.fromISO('2023-01-10'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empCarlos.id, type: 'promotion', eventDate: DateTime.fromISO('2024-07-01') },
      {
        employeeId: empCarlos.id,
        type: 'promotion',
        title: 'Promocao a Desenvolvedor Pleno',
        description: 'Promovido de Junior para Pleno apos 18 meses de bom desempenho e conclusao de treinamentos internos',
        oldValue: 'Desenvolvedor Junior',
        newValue: 'Desenvolvedor Pleno',
        eventDate: DateTime.fromISO('2024-07-01'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empCarlos.id, type: 'salary_change', eventDate: DateTime.fromISO('2024-07-01') },
      {
        employeeId: empCarlos.id,
        type: 'salary_change',
        title: 'Ajuste salarial por promocao',
        description: 'Reajuste salarial referente a promocao para Desenvolvedor Pleno',
        oldValue: '6500.00',
        newValue: '9800.00',
        eventDate: DateTime.fromISO('2024-07-01'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empCarlos.id, type: 'warning', eventDate: DateTime.fromISO('2025-09-10') },
      {
        employeeId: empCarlos.id,
        type: 'warning',
        title: 'Advertencia verbal - atrasos',
        description: 'Advertencia verbal por atrasos recorrentes no mes de setembro. Colaborador se comprometeu a melhorar a pontualidade.',
        eventDate: DateTime.fromISO('2025-09-10'),
        createdBy: manager.id,
      }
    )

    // --- Ana Santos ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empAna.id, type: 'hire', eventDate: DateTime.fromISO('2023-09-01') },
      {
        employeeId: empAna.id,
        type: 'hire',
        title: 'Admissao de Ana Santos',
        description: 'Colaboradora admitida como Analista Financeiro no departamento Financeiro',
        eventDate: DateTime.fromISO('2023-09-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empAna.id, type: 'transfer', eventDate: DateTime.fromISO('2024-06-01') },
      {
        employeeId: empAna.id,
        type: 'transfer',
        title: 'Transferencia de area',
        description: 'Transferida da area de Contas a Pagar para Controladoria dentro do departamento Financeiro',
        oldValue: 'Contas a Pagar',
        newValue: 'Controladoria',
        eventDate: DateTime.fromISO('2024-06-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empAna.id, type: 'note', eventDate: DateTime.fromISO('2025-05-15') },
      {
        employeeId: empAna.id,
        type: 'note',
        title: 'Certificacao CPA-20',
        description: 'Obteve certificacao CPA-20 pela ANBIMA. Importante para as atividades de analise financeira.',
        eventDate: DateTime.fromISO('2025-05-15'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empAna.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-09-01') },
      {
        employeeId: empAna.id,
        type: 'salary_change',
        title: 'Reajuste anual',
        description: 'Reajuste salarial anual por merito',
        oldValue: '7500.00',
        newValue: '8200.00',
        eventDate: DateTime.fromISO('2025-09-01'),
        createdBy: admin.id,
      }
    )

    // --- Pedro Mendes (PJ) ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empPedro.id, type: 'hire', eventDate: DateTime.fromISO('2022-08-01') },
      {
        employeeId: empPedro.id,
        type: 'hire',
        title: 'Contratacao de Pedro Mendes',
        description: 'Consultor PJ contratado como Tech Lead para liderar o squad de plataforma',
        eventDate: DateTime.fromISO('2022-08-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empPedro.id, type: 'salary_change', eventDate: DateTime.fromISO('2024-08-01') },
      {
        employeeId: empPedro.id,
        type: 'salary_change',
        title: 'Renovacao de contrato PJ',
        description: 'Renovacao do contrato PJ com reajuste de valor pela entrega consistente de resultados',
        oldValue: '22000.00',
        newValue: '25000.00',
        eventDate: DateTime.fromISO('2024-08-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empPedro.id, type: 'note', eventDate: DateTime.fromISO('2025-07-15') },
      {
        employeeId: empPedro.id,
        type: 'note',
        title: 'Avaliacao semestral',
        description: 'Excelente lideranca tecnica do squad. Implementou cultura de code review e pair programming que reduziu bugs em producao em 40%.',
        eventDate: DateTime.fromISO('2025-07-15'),
        createdBy: manager.id,
      }
    )

    // --- Fernanda Lima ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empFernanda.id, type: 'hire', eventDate: DateTime.fromISO('2023-04-17') },
      {
        employeeId: empFernanda.id,
        type: 'hire',
        title: 'Admissao de Fernanda Lima',
        description: 'Colaboradora admitida como Analista de RH no departamento de Recursos Humanos',
        eventDate: DateTime.fromISO('2023-04-17'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empFernanda.id, type: 'note', eventDate: DateTime.fromISO('2024-03-10') },
      {
        employeeId: empFernanda.id,
        type: 'note',
        title: 'Treinamento em Departamento Pessoal',
        description: 'Concluiu treinamento intensivo em rotinas de Departamento Pessoal e legislacao trabalhista atualizada',
        eventDate: DateTime.fromISO('2024-03-10'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empFernanda.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-04-17') },
      {
        employeeId: empFernanda.id,
        type: 'salary_change',
        title: 'Reajuste anual',
        description: 'Reajuste salarial por aniversario de empresa e bom desempenho',
        oldValue: '6200.00',
        newValue: '6800.00',
        eventDate: DateTime.fromISO('2025-04-17'),
        createdBy: admin.id,
      }
    )

    // --- Rafael Costa ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empRafael.id, type: 'hire', eventDate: DateTime.fromISO('2024-07-15') },
      {
        employeeId: empRafael.id,
        type: 'hire',
        title: 'Admissao de Rafael Costa',
        description: 'Colaborador admitido como Desenvolvedor Junior. Primeiro emprego apos formatura em Ciencia da Computacao pela UFPR.',
        eventDate: DateTime.fromISO('2024-07-15'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empRafael.id, type: 'note', eventDate: DateTime.fromISO('2025-01-15') },
      {
        employeeId: empRafael.id,
        type: 'note',
        title: 'Avaliacao do periodo de experiencia',
        description: 'Aprovado no periodo de experiencia de 90 dias. Demonstrou boa capacidade de aprendizado e trabalho em equipe.',
        eventDate: DateTime.fromISO('2025-01-15'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empRafael.id, type: 'warning', eventDate: DateTime.fromISO('2025-11-05') },
      {
        employeeId: empRafael.id,
        type: 'warning',
        title: 'Advertencia - atraso em entrega',
        description: 'Advertencia verbal por atraso na entrega de funcionalidades do sprint 47. Necessario melhorar gestao de tempo e comunicacao de impedimentos.',
        eventDate: DateTime.fromISO('2025-11-05'),
        createdBy: manager.id,
      }
    )

    // --- Juliana Ferreira ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJuliana.id, type: 'hire', eventDate: DateTime.fromISO('2021-11-20') },
      {
        employeeId: empJuliana.id,
        type: 'hire',
        title: 'Admissao de Juliana Ferreira',
        description: 'Colaboradora admitida como Vendedora no departamento Comercial',
        eventDate: DateTime.fromISO('2021-11-20'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJuliana.id, type: 'promotion', eventDate: DateTime.fromISO('2023-11-20') },
      {
        employeeId: empJuliana.id,
        type: 'promotion',
        title: 'Promocao a Vendedora Senior',
        description: 'Promovida a Vendedora Senior por atingir 150% da meta em 3 trimestres consecutivos',
        oldValue: 'Vendedor',
        newValue: 'Vendedor Senior',
        eventDate: DateTime.fromISO('2023-11-20'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJuliana.id, type: 'salary_change', eventDate: DateTime.fromISO('2023-11-20') },
      {
        employeeId: empJuliana.id,
        type: 'salary_change',
        title: 'Ajuste salarial por promocao',
        description: 'Reajuste salarial referente a promocao para Vendedora Senior',
        oldValue: '6500.00',
        newValue: '8500.00',
        eventDate: DateTime.fromISO('2023-11-20'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empJuliana.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-11-20') },
      {
        employeeId: empJuliana.id,
        type: 'salary_change',
        title: 'Reajuste por performance',
        description: 'Reajuste por metas batidas no ano de 2025 e dissidio coletivo',
        oldValue: '8500.00',
        newValue: '9500.00',
        eventDate: DateTime.fromISO('2025-11-20'),
        createdBy: manager.id,
      }
    )

    // --- Bruno Almeida (PJ) ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empBruno.id, type: 'hire', eventDate: DateTime.fromISO('2023-03-01') },
      {
        employeeId: empBruno.id,
        type: 'hire',
        title: 'Contratacao de Bruno Almeida',
        description: 'Advogado PJ contratado para atuar na area de Direito Trabalhista e Societario',
        eventDate: DateTime.fromISO('2023-03-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empBruno.id, type: 'note', eventDate: DateTime.fromISO('2024-08-20') },
      {
        employeeId: empBruno.id,
        type: 'note',
        title: 'Atualizacao de certificacoes OAB',
        description: 'Apresentou certificado de atualizacao profissional da OAB/MG. Registro atualizado no sistema.',
        eventDate: DateTime.fromISO('2024-08-20'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empBruno.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-03-01') },
      {
        employeeId: empBruno.id,
        type: 'salary_change',
        title: 'Renovacao de contrato PJ',
        description: 'Renovacao bienal do contrato com reajuste de honorarios',
        oldValue: '18000.00',
        newValue: '20000.00',
        eventDate: DateTime.fromISO('2025-03-01'),
        createdBy: admin.id,
      }
    )

    // --- Camila Rodrigues ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empCamila.id, type: 'hire', eventDate: DateTime.fromISO('2024-02-05') },
      {
        employeeId: empCamila.id,
        type: 'hire',
        title: 'Admissao de Camila Rodrigues',
        description: 'Colaboradora admitida como Analista de Marketing para atuar com marketing digital e redes sociais',
        eventDate: DateTime.fromISO('2024-02-05'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empCamila.id, type: 'note', eventDate: DateTime.fromISO('2024-11-15') },
      {
        employeeId: empCamila.id,
        type: 'note',
        title: 'Destaque em campanha digital',
        description: 'Campanha Black Friday 2024 liderada por Camila superou KPIs em 200%. ROI de 8.5x sobre investimento em midia paga.',
        eventDate: DateTime.fromISO('2024-11-15'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empCamila.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-02-05') },
      {
        employeeId: empCamila.id,
        type: 'salary_change',
        title: 'Reajuste por aniversario de empresa',
        description: 'Reajuste salarial referente ao primeiro ano de empresa e excelente desempenho',
        oldValue: '6500.00',
        newValue: '7200.00',
        eventDate: DateTime.fromISO('2025-02-05'),
        createdBy: admin.id,
      }
    )

    // --- Lucas Nascimento ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empLucas.id, type: 'hire', eventDate: DateTime.fromISO('2023-06-12') },
      {
        employeeId: empLucas.id,
        type: 'hire',
        title: 'Admissao de Lucas Nascimento',
        description: 'Colaborador admitido como Analista de QA no departamento de TI. Experiencia previa com automacao de testes.',
        eventDate: DateTime.fromISO('2023-06-12'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empLucas.id, type: 'note', eventDate: DateTime.fromISO('2024-06-12') },
      {
        employeeId: empLucas.id,
        type: 'note',
        title: 'Implementacao de pipeline de testes',
        description: 'Liderou a implementacao do pipeline de testes automatizados no CI/CD, reduzindo tempo de deploy em 60%',
        eventDate: DateTime.fromISO('2024-06-12'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empLucas.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-06-12') },
      {
        employeeId: empLucas.id,
        type: 'salary_change',
        title: 'Reajuste anual',
        description: 'Reajuste salarial por aniversario de empresa e contribuicoes tecnicas relevantes',
        oldValue: '6800.00',
        newValue: '7500.00',
        eventDate: DateTime.fromISO('2025-06-12'),
        createdBy: admin.id,
      }
    )

    // --- Patricia Souza ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empPatricia.id, type: 'hire', eventDate: DateTime.fromISO('2021-09-15') },
      {
        employeeId: empPatricia.id,
        type: 'hire',
        title: 'Admissao de Patricia Souza',
        description: 'Colaboradora admitida como Analista Financeiro Senior no departamento Financeiro',
        eventDate: DateTime.fromISO('2021-09-15'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empPatricia.id, type: 'promotion', eventDate: DateTime.fromISO('2023-09-15') },
      {
        employeeId: empPatricia.id,
        type: 'promotion',
        title: 'Promocao a Controller',
        description: 'Promovida de Analista Financeiro Senior para Controller. Passara a supervisionar toda a area de Controladoria.',
        oldValue: 'Analista Financeiro Senior',
        newValue: 'Controller',
        eventDate: DateTime.fromISO('2023-09-15'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empPatricia.id, type: 'salary_change', eventDate: DateTime.fromISO('2023-09-15') },
      {
        employeeId: empPatricia.id,
        type: 'salary_change',
        title: 'Ajuste salarial por promocao',
        description: 'Reajuste salarial referente a promocao para Controller',
        oldValue: '11000.00',
        newValue: '14500.00',
        eventDate: DateTime.fromISO('2023-09-15'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empPatricia.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-09-15') },
      {
        employeeId: empPatricia.id,
        type: 'salary_change',
        title: 'Reajuste anual',
        description: 'Reajuste por dissidio coletivo e merito',
        oldValue: '14500.00',
        newValue: '16000.00',
        eventDate: DateTime.fromISO('2025-09-15'),
        createdBy: admin.id,
      }
    )

    // --- Thiago Martins (inactive) ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empThiago.id, type: 'hire', eventDate: DateTime.fromISO('2022-05-02') },
      {
        employeeId: empThiago.id,
        type: 'hire',
        title: 'Admissao de Thiago Martins',
        description: 'Colaborador admitido como Coordenador de Operacoes',
        eventDate: DateTime.fromISO('2022-05-02'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empThiago.id, type: 'note', eventDate: DateTime.fromISO('2024-05-02') },
      {
        employeeId: empThiago.id,
        type: 'note',
        title: 'Avaliacao de desempenho',
        description: 'Bom desempenho geral. Necessario melhorar comunicacao com equipes de outros departamentos.',
        eventDate: DateTime.fromISO('2024-05-02'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empThiago.id, type: 'note', eventDate: DateTime.fromISO('2025-08-15') },
      {
        employeeId: empThiago.id,
        type: 'note',
        title: 'Afastamento por licenca medica',
        description: 'Colaborador afastado por licenca medica a partir de 15/08/2025. Previsao de retorno indeterminada.',
        eventDate: DateTime.fromISO('2025-08-15'),
        createdBy: admin.id,
      }
    )

    // --- Renata Barbosa (PJ) ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empRenata.id, type: 'hire', eventDate: DateTime.fromISO('2024-01-08') },
      {
        employeeId: empRenata.id,
        type: 'hire',
        title: 'Contratacao de Renata Barbosa',
        description: 'DBA PJ contratada para administracao e otimizacao dos bancos de dados PostgreSQL e Redis',
        eventDate: DateTime.fromISO('2024-01-08'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empRenata.id, type: 'note', eventDate: DateTime.fromISO('2024-09-20') },
      {
        employeeId: empRenata.id,
        type: 'note',
        title: 'Migracao de banco de dados concluida',
        description: 'Concluiu com sucesso a migracao do banco de dados principal de MySQL para PostgreSQL 16 com zero perda de dados.',
        eventDate: DateTime.fromISO('2024-09-20'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empRenata.id, type: 'salary_change', eventDate: DateTime.fromISO('2025-01-08') },
      {
        employeeId: empRenata.id,
        type: 'salary_change',
        title: 'Renovacao de contrato PJ',
        description: 'Renovacao anual do contrato PJ com reajuste pelo IGPM',
        oldValue: '16500.00',
        newValue: '18000.00',
        eventDate: DateTime.fromISO('2025-01-08'),
        createdBy: admin.id,
      }
    )

    // --- Gustavo Pereira ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empGustavo.id, type: 'hire', eventDate: DateTime.fromISO('2024-10-01') },
      {
        employeeId: empGustavo.id,
        type: 'hire',
        title: 'Admissao de Gustavo Pereira',
        description: 'Colaborador admitido como Vendedor no departamento Comercial. Indicacao interna da equipe de vendas.',
        eventDate: DateTime.fromISO('2024-10-01'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empGustavo.id, type: 'note', eventDate: DateTime.fromISO('2025-01-10') },
      {
        employeeId: empGustavo.id,
        type: 'note',
        title: 'Aprovacao no periodo de experiencia',
        description: 'Aprovado no periodo de experiencia de 90 dias. Atingiu 85% da meta individual no primeiro trimestre.',
        eventDate: DateTime.fromISO('2025-01-10'),
        createdBy: manager.id,
      }
    )

    // --- Mariana Araujo (terminated) ---
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMariana.id, type: 'hire', eventDate: DateTime.fromISO('2023-02-13') },
      {
        employeeId: empMariana.id,
        type: 'hire',
        title: 'Admissao de Mariana Araujo',
        description: 'Colaboradora admitida como Assistente Administrativo no departamento Administrativo',
        eventDate: DateTime.fromISO('2023-02-13'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMariana.id, type: 'salary_change', eventDate: DateTime.fromISO('2024-02-13') },
      {
        employeeId: empMariana.id,
        type: 'salary_change',
        title: 'Reajuste anual',
        description: 'Reajuste por aniversario de empresa',
        oldValue: '3500.00',
        newValue: '3800.00',
        eventDate: DateTime.fromISO('2024-02-13'),
        createdBy: admin.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMariana.id, type: 'warning', eventDate: DateTime.fromISO('2025-07-20') },
      {
        employeeId: empMariana.id,
        type: 'warning',
        title: 'Advertencia escrita - faltas injustificadas',
        description: 'Advertencia escrita por 3 faltas injustificadas nos meses de junho e julho de 2025.',
        eventDate: DateTime.fromISO('2025-07-20'),
        createdBy: manager.id,
      }
    )
    await EmployeeHistory.updateOrCreate(
      { employeeId: empMariana.id, type: 'termination', eventDate: DateTime.fromISO('2025-10-31') },
      {
        employeeId: empMariana.id,
        type: 'termination',
        title: 'Desligamento de Mariana Araujo',
        description: 'Desligamento sem justa causa. Rescisao processada conforme legislacao vigente. Aviso previo indenizado.',
        eventDate: DateTime.fromISO('2025-10-31'),
        createdBy: admin.id,
      }
    )

    // ============================================================
    // 8. DOCUMENTS (Metadados de Documentos)
    // ============================================================
    console.log('Criando metadados de documentos...')

    interface DocTemplate {
      title: string
      type: string
      fileNameSuffix: string
      notes: string
      fileSize: number
    }

    function getBaseDocsForEmployee(
      emp: Employee
    ): DocTemplate[] {
      const isPJ = emp.type === 'pj'
      const docs: DocTemplate[] = [
        {
          title: 'RG',
          type: 'identification',
          fileNameSuffix: 'rg',
          notes: 'Documento de identidade - RG',
          fileSize: 210000 + Math.floor(seededRandom() * 90000),
        },
      ]

      if (isPJ) {
        docs.push({
          title: 'CNPJ',
          type: 'identification',
          fileNameSuffix: 'cnpj',
          notes: 'Cadastro Nacional de Pessoa Juridica',
          fileSize: 150000 + Math.floor(seededRandom() * 60000),
        })
        docs.push({
          title: 'Contrato de Prestacao de Servicos',
          type: 'contract',
          fileNameSuffix: 'contrato_pj',
          notes: 'Contrato PJ de prestacao de servicos',
          fileSize: 500000 + Math.floor(seededRandom() * 200000),
        })
      } else {
        docs.push({
          title: 'CPF',
          type: 'identification',
          fileNameSuffix: 'cpf',
          notes: 'Cadastro de Pessoa Fisica',
          fileSize: 150000 + Math.floor(seededRandom() * 60000),
        })
        docs.push({
          title: 'Contrato de Trabalho',
          type: 'contract',
          fileNameSuffix: 'contrato_clt',
          notes: 'Contrato de trabalho CLT',
          fileSize: 450000 + Math.floor(seededRandom() * 200000),
        })
      }

      return docs
    }

    // Extra docs per employee - varying
    const extraDocsMap: Map<number, DocTemplate[]> = new Map([
      [empJoao.id, [
        { title: 'Diploma de Graduacao', type: 'certificate', fileNameSuffix: 'diploma', notes: 'Diploma de Engenharia de Software - USP', fileSize: 685432 },
        { title: 'Certificado AWS Solutions Architect', type: 'certificate', fileNameSuffix: 'cert_aws', notes: 'Certificacao AWS Solutions Architect Professional', fileSize: 345678 },
      ]],
      [empMaria.id, [
        { title: 'Diploma de Pos-Graduacao', type: 'certificate', fileNameSuffix: 'diploma_mba', notes: 'MBA em Gestao Estrategica de Pessoas - FGV', fileSize: 712345 },
        { title: 'Comprovante de Residencia', type: 'other', fileNameSuffix: 'comprovante_res', notes: 'Conta de energia eletrica - Enel', fileSize: 234567 },
      ]],
      [empCarlos.id, [
        { title: 'Diploma de Graduacao', type: 'certificate', fileNameSuffix: 'diploma', notes: 'Diploma de Ciencia da Computacao - UNICAMP', fileSize: 698765 },
      ]],
      [empAna.id, [
        { title: 'Certificado CPA-20', type: 'certificate', fileNameSuffix: 'cert_cpa20', notes: 'Certificacao CPA-20 ANBIMA', fileSize: 345678 },
        { title: 'Comprovante de Residencia', type: 'other', fileNameSuffix: 'comprovante_res', notes: 'Conta de gas - Comgas', fileSize: 198765 },
      ]],
      [empPedro.id, [
        { title: 'Certificado Scrum Master', type: 'certificate', fileNameSuffix: 'cert_scrum', notes: 'Certificacao Scrum Master - Scrum.org', fileSize: 287654 },
      ]],
      [empFernanda.id, [
        { title: 'Diploma de Graduacao', type: 'certificate', fileNameSuffix: 'diploma', notes: 'Diploma de Administracao - Mackenzie', fileSize: 654321 },
      ]],
      [empRafael.id, [
        { title: 'Diploma de Graduacao', type: 'certificate', fileNameSuffix: 'diploma', notes: 'Diploma de Ciencia da Computacao - UFPR', fileSize: 678901 },
      ]],
      [empJuliana.id, [
        { title: 'Comprovante de Residencia', type: 'other', fileNameSuffix: 'comprovante_res', notes: 'Conta de agua - Sabesp', fileSize: 178543 },
        { title: 'Certificado de Vendas Consultivas', type: 'certificate', fileNameSuffix: 'cert_vendas', notes: 'Certificacao em Vendas Consultivas - ESPM', fileSize: 312456 },
      ]],
      [empBruno.id, [
        { title: 'Carteira da OAB', type: 'identification', fileNameSuffix: 'oab', notes: 'Carteira de inscricao OAB/MG numero 187.432', fileSize: 189654 },
      ]],
      [empCamila.id, [
        { title: 'Diploma de Graduacao', type: 'certificate', fileNameSuffix: 'diploma', notes: 'Diploma de Comunicacao Social - PUC-SP', fileSize: 643210 },
      ]],
      [empLucas.id, [
        { title: 'Certificado ISTQB', type: 'certificate', fileNameSuffix: 'cert_istqb', notes: 'Certificacao ISTQB Foundation Level', fileSize: 267890 },
        { title: 'Diploma de Graduacao', type: 'certificate', fileNameSuffix: 'diploma', notes: 'Diploma de Sistemas de Informacao - PUC-Campinas', fileSize: 632145 },
      ]],
      [empPatricia.id, [
        { title: 'Diploma de Pos-Graduacao', type: 'certificate', fileNameSuffix: 'diploma_pos', notes: 'Pos-graduacao em Controladoria e Financas - Insper', fileSize: 723456 },
        { title: 'Atestado Medico Admissional', type: 'medical', fileNameSuffix: 'atestado_adm', notes: 'ASO admissional - apta para o trabalho', fileSize: 156789 },
      ]],
      [empThiago.id, [
        { title: 'Atestado Medico', type: 'medical', fileNameSuffix: 'atestado_medico', notes: 'Atestado medico referente ao afastamento em agosto de 2025', fileSize: 189432 },
      ]],
      [empRenata.id, [
        { title: 'Certificado Oracle DBA', type: 'certificate', fileNameSuffix: 'cert_oracle', notes: 'Oracle Certified Professional - Database Administration', fileSize: 298765 },
      ]],
      [empGustavo.id, [
        { title: 'Comprovante de Residencia', type: 'other', fileNameSuffix: 'comprovante_res', notes: 'Conta de internet - Vivo Fibra', fileSize: 167890 },
      ]],
      [empMariana.id, [
        { title: 'Termo de Rescisao', type: 'contract', fileNameSuffix: 'rescisao', notes: 'TRCT - Termo de Rescisao de Contrato de Trabalho', fileSize: 534210 },
      ]],
    ])

    const allEmployees = [
      empJoao, empMaria, empCarlos, empAna, empPedro, empFernanda,
      empRafael, empJuliana, empBruno, empCamila, empLucas, empPatricia,
      empThiago, empRenata, empGustavo, empMariana,
    ]

    const firstNames: Map<number, string> = new Map([
      [empJoao.id, 'joao'],
      [empMaria.id, 'maria'],
      [empCarlos.id, 'carlos'],
      [empAna.id, 'ana'],
      [empPedro.id, 'pedro'],
      [empFernanda.id, 'fernanda'],
      [empRafael.id, 'rafael'],
      [empJuliana.id, 'juliana'],
      [empBruno.id, 'bruno'],
      [empCamila.id, 'camila'],
      [empLucas.id, 'lucas'],
      [empPatricia.id, 'patricia'],
      [empThiago.id, 'thiago'],
      [empRenata.id, 'renata'],
      [empGustavo.id, 'gustavo'],
      [empMariana.id, 'mariana'],
    ])

    for (const emp of allEmployees) {
      const baseDocs = getBaseDocsForEmployee(emp)
      const extraDocs = extraDocsMap.get(emp.id) || []
      const allDocs = [...baseDocs, ...extraDocs]
      const firstName = firstNames.get(emp.id) || 'employee'

      for (const doc of allDocs) {
        const fileName = `${firstName}_${doc.fileNameSuffix}.pdf`
        await Document.updateOrCreate(
          { employeeId: emp.id, title: doc.title, type: doc.type },
          {
            employeeId: emp.id,
            title: doc.title,
            type: doc.type,
            fileName,
            filePath: `storage/uploads/documents/${emp.id}/${fileName}`,
            fileSize: doc.fileSize,
            mimeType: 'application/pdf',
            notes: doc.notes,
            uploadedAt: emp.hireDate,
          }
        )
      }
    }

    // ============================================================
    // 9. ROLE PERMISSIONS (Permissoes por Role)
    // ============================================================
    console.log('Criando permissoes por role...')

    const modules = [
      'employees', 'attendance', 'hours_bank', 'documents', 'history',
      'leave', 'benefits', 'payroll', 'performance', 'recruitment',
    ] as const

    for (const mod of modules) {
      await RolePermission.updateOrCreate(
        { role: 'admin', module: mod },
        { canAccess: true }
      )
    }

    for (const mod of modules) {
      await RolePermission.updateOrCreate(
        { role: 'manager', module: mod },
        { canAccess: true }
      )
    }

    const employeePermissions: Record<string, boolean> = {
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
    }

    for (const mod of modules) {
      await RolePermission.updateOrCreate(
        { role: 'employee', module: mod },
        { canAccess: employeePermissions[mod] }
      )
    }

    // ============================================================
    // RESUMO FINAL
    // ============================================================
    console.log('')
    console.log('Seed concluido com sucesso!')
    console.log('')
    console.log('='.repeat(80))
    console.log('  CREDENCIAIS DE ACESSO')
    console.log('='.repeat(80))
    console.log('')
    console.log(
      '  ' +
      'NOME'.padEnd(28) +
      'EMAIL'.padEnd(40) +
      'SENHA'.padEnd(18) +
      'ROLE'
    )
    console.log('  ' + '-'.repeat(96))

    const credentials = [
      { name: 'Administrador', email: 'admin@sistema-rh.com', password: 'Admin@123', role: 'admin' },
      { name: 'Maria Oliveira', email: 'gerente@sistema-rh.com', password: 'gerente123456', role: 'manager' },
      { name: 'Joao Silva', email: 'joao.silva@sistema-rh.com', password: 'employee123456', role: 'employee' },
      { name: 'Ana Santos', email: 'ana.santos@sistema-rh.com', password: 'employee123456', role: 'employee' },
      { name: 'Carlos Oliveira', email: 'carlos.oliveira@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Pedro Mendes', email: 'pedro.mendes@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Fernanda Lima', email: 'fernanda.lima@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Rafael Costa', email: 'rafael.costa@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Juliana Ferreira', email: 'juliana.ferreira@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Bruno Almeida', email: 'bruno.almeida@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Camila Rodrigues', email: 'camila.rodrigues@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Lucas Nascimento', email: 'lucas.nascimento@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Patricia Souza', email: 'patricia.souza@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Thiago Martins', email: 'thiago.martins@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Renata Barbosa', email: 'renata.barbosa@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Gustavo Pereira', email: 'gustavo.pereira@sistema-rh.com', password: 'Mudar@123', role: 'employee' },
      { name: 'Mariana Araujo', email: 'mariana.araujo@sistema-rh.com', password: 'Mudar@123', role: 'employee (inativo)' },
    ]

    for (const cred of credentials) {
      console.log(
        '  ' +
        cred.name.padEnd(28) +
        cred.email.padEnd(40) +
        cred.password.padEnd(18) +
        cred.role
      )
    }

    console.log('')
    console.log('='.repeat(80))
    console.log(`  Total: ${credentials.length} usuarios | 16 colaboradores | 8 departamentos | 17 cargos`)
    console.log('='.repeat(80))
    console.log('')
  }
}

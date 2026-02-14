import { test } from '@japa/runner'
import {
  createEmployeeValidator,
  updateEmployeeValidator,
  listEmployeeValidator,
} from '#validators/employee_validator'

test.group('EmployeeValidator - createEmployeeValidator', () => {
  test('deve validar dados completos de employee CLT', async ({ assert }) => {
    const data = {
      fullName: 'João da Silva',
      cpf: '123.456.789-00',
      email: 'joao.silva@empresa.com',
      phone: '(11) 98765-4321',
      type: 'clt',
      departmentId: 1,
      positionId: 1,
      hireDate: '2024-01-15',
      salary: 5000.0,
      status: 'active',
      birthDate: '1990-05-20',
      addressStreet: 'Rua das Flores',
      addressNumber: '123',
      addressNeighborhood: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZip: '01234-567',
    }

    const validated = await createEmployeeValidator.validate(data)

    assert.equal(validated.fullName, data.fullName)
    assert.equal(validated.email, data.email)
    assert.equal(validated.type, 'clt')
  })

  test('deve validar dados completos de employee PJ', async ({ assert }) => {
    const data = {
      fullName: 'Maria Consultoria LTDA',
      cnpj: '12.345.678/0001-90',
      email: 'maria@consultoria.com',
      phone: '(11) 98765-4321',
      type: 'pj',
      hireDate: '2024-01-15',
      salary: 8000.0,
    }

    const validated = await createEmployeeValidator.validate(data)

    assert.equal(validated.fullName, data.fullName)
    assert.equal(validated.email, data.email)
    assert.equal(validated.type, 'pj')
  })

  test('deve exigir fullName', async ({ assert }) => {
    const data = {
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve exigir email', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      hireDate: '2024-01-15',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve exigir hireDate', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve validar email com formato correto', async ({ assert }) => {
    const validData = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
    }

    const validated = await createEmployeeValidator.validate(validData)
    assert.equal(validated.email, 'teste@empresa.com')
  })

  test('deve rejeitar email invalido', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'email-invalido',
      hireDate: '2024-01-15',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve aceitar type clt', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      type: 'clt',
      hireDate: '2024-01-15',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.type, 'clt')
  })

  test('deve aceitar type pj', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      type: 'pj',
      hireDate: '2024-01-15',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.type, 'pj')
  })

  test('deve rejeitar type invalido', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      type: 'freelancer',
      hireDate: '2024-01-15',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve aceitar status active', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      status: 'active',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.status, 'active')
  })

  test('deve aceitar status inactive', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      status: 'inactive',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.status, 'inactive')
  })

  test('deve aceitar status terminated', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      status: 'terminated',
      terminationDate: '2024-12-31',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.status, 'terminated')
  })

  test('deve rejeitar status invalido', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      status: 'suspended',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve validar CPF com tamanho maximo', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      cpf: '123.456.789-00',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.cpf, '123.456.789-00')
  })

  test('deve rejeitar CPF muito longo', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      cpf: '123.456.789-00-12345',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve validar CNPJ com tamanho maximo', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      cnpj: '12.345.678/0001-90',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.cnpj, '12.345.678/0001-90')
  })

  test('deve rejeitar CNPJ muito longo', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      cnpj: '12.345.678/0001-90-EXTRA',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve aceitar fullName com minimo 2 caracteres', async ({ assert }) => {
    const data = {
      fullName: 'Ab',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.fullName, 'Ab')
  })

  test('deve rejeitar fullName com 1 caractere', async ({ assert }) => {
    const data = {
      fullName: 'A',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve validar salary positivo', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      salary: 5000.0,
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.salary, 5000.0)
  })

  test('deve aceitar salary zero', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      salary: 0,
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.salary, 0)
  })

  test('deve rejeitar salary negativo', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      salary: -1000,
    }

    await assert.rejects(async () => await createEmployeeValidator.validate(data))
  })

  test('deve validar addressState com 2 caracteres', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      addressState: 'SP',
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.equal(validated.addressState, 'SP')
  })

  test('deve aceitar campos opcionais como null', async ({ assert }) => {
    const data = {
      fullName: 'Teste',
      email: 'teste@empresa.com',
      hireDate: '2024-01-15',
      cpf: null,
      phone: null,
      notes: null,
    }

    const validated = await createEmployeeValidator.validate(data)
    assert.isNull(validated.cpf)
    assert.isNull(validated.phone)
    assert.isNull(validated.notes)
  })
})

test.group('EmployeeValidator - updateEmployeeValidator', () => {
  test('deve permitir atualizacao parcial', async ({ assert }) => {
    const data = {
      salary: 6000.0,
    }

    const validated = await updateEmployeeValidator.validate(data)
    assert.equal(validated.salary, 6000.0)
  })

  test('deve permitir atualizar apenas email', async ({ assert }) => {
    const data = {
      email: 'novo.email@empresa.com',
    }

    const validated = await updateEmployeeValidator.validate(data)
    assert.equal(validated.email, 'novo.email@empresa.com')
  })

  test('deve validar email quando fornecido', async ({ assert }) => {
    const data = {
      email: 'email-invalido',
    }

    await assert.rejects(async () => await updateEmployeeValidator.validate(data))
  })

  test('deve validar type quando fornecido', async ({ assert }) => {
    const data = {
      type: 'freelancer',
    }

    await assert.rejects(async () => await updateEmployeeValidator.validate(data))
  })

  test('deve permitir update sem nenhum campo obrigatorio', async ({ assert }) => {
    const data = {}

    const validated = await updateEmployeeValidator.validate(data)
    assert.isObject(validated)
  })
})

test.group('EmployeeValidator - listEmployeeValidator', () => {
  test('deve validar filtros de listagem', async ({ assert }) => {
    const data = {
      page: 1,
      limit: 20,
      search: 'João',
      type: 'clt',
      status: 'active',
      departmentId: 5,
    }

    const validated = await listEmployeeValidator.validate(data)
    assert.equal(validated.page, 1)
    assert.equal(validated.limit, 20)
    assert.equal(validated.search, 'João')
  })

  test('deve aceitar page positivo', async ({ assert }) => {
    const data = {
      page: 2,
    }

    const validated = await listEmployeeValidator.validate(data)
    assert.equal(validated.page, 2)
  })

  test('deve rejeitar page zero ou negativo', async ({ assert }) => {
    const data = {
      page: 0,
    }

    await assert.rejects(async () => await listEmployeeValidator.validate(data))
  })

  test('deve aceitar limit ate 500', async ({ assert }) => {
    const data = {
      limit: 500,
    }

    const validated = await listEmployeeValidator.validate(data)
    assert.equal(validated.limit, 500)
  })

  test('deve rejeitar limit acima de 500', async ({ assert }) => {
    const data = {
      limit: 501,
    }

    await assert.rejects(async () => await listEmployeeValidator.validate(data))
  })

  test('deve validar type filter', async ({ assert }) => {
    const data = {
      type: 'pj',
    }

    const validated = await listEmployeeValidator.validate(data)
    assert.equal(validated.type, 'pj')
  })

  test('deve validar status filter', async ({ assert }) => {
    const data = {
      status: 'inactive',
    }

    const validated = await listEmployeeValidator.validate(data)
    assert.equal(validated.status, 'inactive')
  })

  test('deve permitir listagem sem filtros', async ({ assert }) => {
    const data = {}

    const validated = await listEmployeeValidator.validate(data)
    assert.isObject(validated)
  })
})

const request = require('supertest');

// Mock database connection for tests if necessary
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
  };
  return {
    Pool: jest.fn().mockImplementation(() => mPool),
  };
});

const { Pool } = require('pg');
const app = require('./server');

describe('API Endpoints', () => {
  it('should fail login with missing fields', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.statusCode).toBe(500); // Because the pool.query will fail (mock)
  });

  it('should fail registration with missing fields', async () => {
    const res = await request(app).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Todos los campos son obligatorios');
  });

  it('should fail to list patients without clinic id', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('No se proporcionó una clínica válida');
  });

  it('should fail to get a patient with invalid ID', async () => {
    const res = await request(app).get('/api/patients/invalid-id');
    expect(res.statusCode).toBe(500); // Because invalid id will cause DB error
  });

  it('should fail to add a patient without name', async () => {
    const res = await request(app).post('/api/patients').send({ edad: 30 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El nombre es obligatorio');
  });
});

it('should return 401 if user not found', async () => {
  const query = Pool.mock.instances[0].query;
  query.mockResolvedValueOnce({ rows: [] });

  const res = await request(app).post('/api/login').send({ email: 'nonexistent@example.com', password: '1234' });
  expect(res.statusCode).toBe(401);
  expect(res.body.error).toBe('Usuario no encontrado');
});

it('should register a new user successfully', async () => {
  const query = Pool.mock.instances[0].query;
  query
    .mockResolvedValueOnce({ rows: [] }) // Check if email exists
    .mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Test', email: 'test@example.com', clinica_id: 1 }] });

  const res = await request(app).post('/api/register').send({
    nombre: 'Test',
    email: 'test@example.com',
    password: '123456',
    clinica_id: 1,
  });

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('id');
});

it('should list patients by clinic id', async () => {
  const query = Pool.mock.instances[0].query;
  query.mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Paciente 1' }] });

  const res = await request(app).get('/api/patients?clinica_id=1');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual(expect.arrayContaining([{ id: 1, nombre: 'Paciente 1' }]));
});

it('should return patient by id', async () => {
  const query = Pool.mock.instances[0].query;
  query.mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Paciente 1' }] });

  const res = await request(app).get('/api/patients/1');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('id', 1);
});

it('should update patient by id', async () => {
  const query = Pool.mock.instances[0].query;
  query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, nombre: 'Paciente Actualizado' }] });

  const res = await request(app).put('/api/patients/1').send({
    nombre: 'Paciente Actualizado',
    edad: 30,
    genero: 'F',
    telefono: '1234567890'
  });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('nombre', 'Paciente Actualizado');
});

it('should delete patient by id', async () => {
  const query = Pool.mock.instances[0].query;
  query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

  const res = await request(app).delete('/api/patients/1');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('message', 'Paciente eliminado correctamente');
});
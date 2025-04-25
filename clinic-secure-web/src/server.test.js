

const request = require('supertest');
const app = require('./server');

// Mock database connection for tests if necessary
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

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
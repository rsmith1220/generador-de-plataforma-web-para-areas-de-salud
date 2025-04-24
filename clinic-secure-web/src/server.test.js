jest.mock('pg', () => {
  const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
  const mockConnect = jest.fn().mockResolvedValue();

  const mClient = {
    connect: mockConnect,
    query: mockQuery,
    end: jest.fn(),
  };

  console.log("✅ MOCK DE PG APLICADO");

  return {
    Pool: jest.fn(() => mClient),
  };
});

import request from 'supertest';
import app from './server';

test('rechaza login con campos vacíos', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({ email: '', password: '' });

  expect(response.status).toBe(401);
  expect(response.body.error).toMatch(/usuario no encontrado|contraseña incorrecta/i);
});

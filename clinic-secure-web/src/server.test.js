import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
  const mockQuery = jest.fn((text, params) => {
    const lowered = text.toLowerCase();

    if (lowered.includes('from usuarios')) {
      if (lowered.includes('select id, nombre, email, password, clinica_id')) {
        return Promise.resolve({ rowCount: 0, rows: [] });
      }
      if (lowered.includes('select id from usuarios')) {
        return Promise.resolve({ rowCount: 0, rows: [] });
      }
    }

    if (lowered.includes('insert into usuarios')) {
      return Promise.resolve({
        rowCount: 1,
        rows: [{
          id: 1,
          nombre: params[0],
          email: params[1],
          clinica_id: params[3]
        }]
      });
    }

    if (lowered.includes('from pacientes')) {
      if (lowered.includes('where id =')) {
        return Promise.resolve({ rowCount: 1, rows: [{
          id: params[0],
          nombre: "Paciente Test",
          edad: 30,
          genero: "Masculino",
          telefono: "12345678",
          clinica_id: 1
        }] });
      }
      return Promise.resolve({ rowCount: 0, rows: [] });
    }

    return Promise.resolve({ rowCount: 0, rows: [] });
  });

  return {
    Pool: jest.fn(() => ({
      connect: jest.fn().mockResolvedValue(),
      query: mockQuery,
      end: jest.fn(),
    }))
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

test('registra un usuario nuevo exitosamente', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({
      nombre: 'Nuevo Usuario',
      email: 'nuevo@usuario.com',
      password: 'passwordseguro',
      clinica_id: 1
    });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('nombre', 'Nuevo Usuario');
  expect(response.body).toHaveProperty('email', 'nuevo@usuario.com');
});

test('devuelve lista vacía de pacientes si no hay registros', async () => {
  const response = await request(app)
    .get('/api/patients?clinica_id=1');

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBe(0);
});

test('devuelve un paciente por ID', async () => {
  const response = await request(app)
    .get('/api/patients/1');

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('id', 1);
  expect(response.body).toHaveProperty('nombre', 'Paciente Test');
});

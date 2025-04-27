const bcrypt = require('bcrypt');
// Mock pg before any imports to avoid real DB connections
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn((text, params) => {
      if (text.includes('FROM usuarios')) {
        // Simular que no existe el usuario
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      if (text.includes('FROM pacientes')) {
        if (text.includes('WHERE id = $1')) {
          // Simular búsqueda por ID que no existe
          return Promise.resolve({ rows: [], rowCount: 0 });
        }
        if (text.includes('WHERE clinica_id = $1')) {
          // Simular lista de pacientes
          return Promise.resolve({ rows: [], rowCount: 0 });
        }
      }
      if (text.includes('INSERT INTO pacientes')) {
        // Simular inserción de paciente
        return Promise.resolve({ rows: [{ id: 1, nombre: 'Mock Paciente', edad: 30, genero: 'Masculino', telefono: '12345678' }], rowCount: 1 });
      }
      if (text.includes('UPDATE pacientes')) {
        // Simular update que no encuentra paciente
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      if (text.includes('DELETE FROM pacientes')) {
        // Simular delete que no encuentra paciente
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }),
    connect: jest.fn(),
    end: jest.fn()
  };
  return { Pool: jest.fn(() => mClient) };
});

const request = require('supertest');
const { app, pool } = require('./server');

describe('API Endpoints', () => {
  describe('POST /api/login', () => {
    it('should return 401 if user is not found', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Usuario no encontrado');
    });
  });

  describe('POST /api/register', () => {
    it('should return 400 if missing fields', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ nombre: '', email: '', password: '', clinica_id: '' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Todos los campos son obligatorios');
    });
  });

  describe('GET /api/patients', () => {
    it('should return 400 if clinica_id is missing', async () => {
      const res = await request(app)
        .get('/api/patients');
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'No se proporcionó una clínica válida');
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should return 404 if patient is not found', async () => {
      const res = await request(app)
        .get('/api/patients/99999'); // Assuming this ID doesn't exist
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Paciente no encontrado');
    });
  });

  describe('POST /api/patients', () => {
    it('should return 400 if nombre is missing', async () => {
      const res = await request(app)
        .post('/api/patients')
        .send({ edad: 30, genero: 'Masculino', telefono: '12345678' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'El nombre es obligatorio');
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should return 404 if trying to update a non-existent patient', async () => {
      const res = await request(app)
        .put('/api/patients/99999')
        .send({ nombre: 'Nuevo Nombre', edad: 30, genero: 'Masculino', telefono: '12345678' });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Paciente no encontrado');
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('should return 404 if trying to delete a non-existent patient', async () => {
      const res = await request(app)
        .delete('/api/patients/99999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Paciente no encontrado');
    });
  });
});

// Additional tests for broader coverage and grouped by feature
describe('Login', () => {
  it('should fail login with missing fields', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 if user not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/login').send({ email: 'nonexistent@example.com', password: '1234' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Usuario no encontrado');
  });
});

describe('Register', () => {
  it('should fail registration with missing fields', async () => {
    const res = await request(app).post('/api/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Todos los campos son obligatorios');
  });

  it('should register a new user successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // Email check
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
});

describe('Patients', () => {
  it('should fail to list patients without clinic id', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('No se proporcionó una clínica válida');
  });

  it('should list patients by clinic id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Paciente 1' }] });

    const res = await request(app).get('/api/patients?clinica_id=1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([{ id: 1, nombre: 'Paciente 1' }]));
  });

  it('should fail to get a patient with invalid ID', async () => {
    const res = await request(app).get('/api/patients/invalid-id');
    expect(res.statusCode).toBe(404);
  });

  it('should return patient by id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, nombre: 'Paciente 1' }] });

    const res = await request(app).get('/api/patients/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('should fail to add a patient without name', async () => {
    const res = await request(app).post('/api/patients').send({ edad: 30 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El nombre es obligatorio');
  });

  it('should update patient by id', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, nombre: 'Paciente Actualizado' }] });

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
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const res = await request(app).delete('/api/patients/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Paciente eliminado correctamente');
  });
});


// Error handling coverage
describe('Error handling', () => {
  it('should fail login if password is incorrect', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 1,
        nombre: 'Test',
        email: 'test@example.com',
        password: await bcrypt.hash('correctpassword', 10),
        clinica_id: 1
      }]
    });

    const res = await request(app).post('/api/login').send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Contraseña incorrecta');
  });

  it('should handle error on register', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post('/api/register').send({
      nombre: 'Test',
      email: 'test@example.com',
      password: '123456',
      clinica_id: 1
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });

  it('should handle error on GET /api/patients', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/patients?clinica_id=1');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });

  it('should handle error on GET /api/patients/:id', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/patients/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });

  it('should handle error on POST /api/patients', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post('/api/patients').send({
      nombre: 'Test Paciente',
      edad: 30,
      genero: 'M',
      telefono: '12345678'
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });

  it('should handle error on PUT /api/patients/:id', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).put('/api/patients/1').send({
      nombre: 'Paciente Actualizado',
      edad: 30,
      genero: 'F',
      telefono: '987654321'
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });

  it('should handle error on DELETE /api/patients/:id', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).delete('/api/patients/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });
});
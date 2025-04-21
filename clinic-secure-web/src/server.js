require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configuración de conexión a RDS PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

// === LOGIN ===
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, password, clinica_id FROM usuarios WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      clinica_id: user.clinica_id
    });
  } catch (err) {
    console.error('Error en el login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === REGISTRO ===
app.post('/api/register', async (req, res) => {
  const { nombre, email, password, clinica_id } = req.body;

  if (!nombre || !email || !password || !clinica_id) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const userCheck = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, clinica_id) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, clinica_id',
      [nombre, email, hashedPassword, clinica_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error registrando usuario:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === LISTAR PACIENTES POR CLÍNICA ===
app.get('/api/patients', async (req, res) => {
  const clinicaId = req.query.clinica_id;

  if (!clinicaId) {
    return res.status(400).json({ error: 'No se proporcionó una clínica válida' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, edad, genero, telefono FROM pacientes WHERE clinica_id = $1',
      [clinicaId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo pacientes:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === OBTENER PACIENTE POR ID ===
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, nombre, edad, genero, telefono FROM pacientes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error obteniendo paciente por ID:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === AGREGAR PACIENTE ===
app.post('/api/patients', async (req, res) => {
  const { nombre, edad, genero, telefono } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO pacientes (nombre, edad, genero, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, edad, genero, telefono]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error insertando paciente:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === ACTUALIZAR PACIENTE ===
app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, edad, genero, telefono } = req.body;

  try {
    const result = await pool.query(
      'UPDATE pacientes SET nombre = $1, edad = $2, genero = $3, telefono = $4 WHERE id = $5 RETURNING *',
      [nombre, edad, genero, telefono, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error actualizando paciente:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === ELIMINAR PACIENTE ===
app.delete('/api/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM pacientes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error eliminando paciente:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === CONEXIÓN Y ARRANQUE ===
pool.connect()
  .then(() => console.log('✅ Conectado a la base de datos PostgreSQL en RDS'))
  .catch(err => console.error('❌ Error de conexión:', err));

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

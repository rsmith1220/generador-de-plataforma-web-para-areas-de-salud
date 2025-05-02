require('dotenv').config();
const helmet = require('helmet');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.disable('x-powered-by'); // 🔒 Oculta versión de Express

const PORT = process.env.PORT || 5000;

// 🔒 CORS seguro: acepta localhost:3000 y vite en 5173
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL // permite agregar URL de producción desde .env
];

// 🛡️ Seguridad HTTP con Helmet
app.use(helmet());

// Opcional: política CSP personalizada
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"]
  }
}));

// Protección contra clickjacking
app.use(helmet.frameguard({ action: 'deny' }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Configuración de conexión a RDS PostgreSQL
const createPool = () => new Pool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : false
});

const pool = createPool();

// === LOGIN ===
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, password, clinica_id FROM usuarios WHERE email = $1 LIMIT 1',
      [email]
    );
    if (!result?.rows?.length) {
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

// === LISTAR PACIENTES POR CLÍNICA (con más información) ===
app.get('/api/patients', async (req, res) => {
  const clinicaId = req.query.clinica_id;

  if (!clinicaId) {
    return res.status(400).json({ error: 'No se proporcionó una clínica válida' });
  }

  try {
    const result = await pool.query(
      `SELECT id, nombre, edad, genero, telefono, clinica_id, 
              altura_cm, peso_kg, tipo_sangre, alergias, medicamentos, cirugias,
              telefono_casa, telefono_celular
       FROM pacientes
       WHERE clinica_id = $1`,
      [clinicaId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo pacientes:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// === OBTENER PACIENTE POR ID (con más información) ===
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, nombre, edad, genero, telefono, clinica_id, 
              altura_cm, peso_kg, tipo_sangre, alergias, medicamentos, cirugias,
              telefono_casa, telefono_celular, extras
       FROM pacientes
       WHERE id = $1`,
      [id]
    );

    if (!result?.rows?.length) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const paciente = result.rows[0];
    const pacienteCompleto = {
      ...paciente,
      ...paciente.extras
    };
    delete pacienteCompleto.extras;

    res.json(pacienteCompleto);
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

    if (!result || typeof result.rowCount !== 'number' || result.rowCount === 0) {
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

    if (!result || typeof result.rowCount !== 'number' || result.rowCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error eliminando paciente:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === ACTUALIZAR CAMPOS EXTRAS DE UN PACIENTE ===
app.put('/api/patients/:id/extras', async (req, res) => {
  const { id } = req.params;
  const nuevosExtras = req.body;

  try {
    const result = await pool.query(
      'UPDATE pacientes SET extras = $1 WHERE id = $2 RETURNING extras',
      [nuevosExtras, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ message: 'Información adicional actualizada', extras: result.rows[0].extras });
  } catch (err) {
    console.error('❌ Error actualizando extras:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// === CONEXIÓN Y ARRANQUE ===
if (process.env.NODE_ENV !== 'test' && typeof pool.connect === 'function') {
  pool.connect()
    .then(() => console.log('✅ Conectado a la base de datos PostgreSQL en RDS'))
    .catch(err => console.error('❌ Error de conexión:', err));
}

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  }
  
  module.exports = { app, pool, createPool };
  

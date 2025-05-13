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
  'http://localhost:5000',
  process.env.FRONTEND_URL // permite agregar URL de producción desde .env
];

// 🛡️ Seguridad HTTP con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  frameguard: { action: 'deny' },
  hidePoweredBy: true
}));

// 🚫 Evitar caché (colócalo aquí)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});


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

  // Validación: debe ser un número entero positivo
  if (!clinicaId || !/^\d+$/.test(clinicaId)) {
    return res.status(400).json({ error: 'ID de clínica inválido' });
  }
  

  try {
    const result = await pool.query(
      `SELECT * FROM pacientes WHERE clinica_id = $1`,
      [clinicaId]
    );
    
    const pacientesLimpios = result.rows.map(paciente => {
      const pacienteFiltrado = { ...paciente };
    
      // Si hay fecha de creación, conviértela a solo YYYY-MM-DD
      if (pacienteFiltrado.created_at) {
        pacienteFiltrado.fecha = pacienteFiltrado.created_at.toISOString().split('T')[0];
      }
    
      // Eliminar campos sensibles o irrelevantes
      delete pacienteFiltrado.created_at;
      delete pacienteFiltrado.updated_at;
      delete pacienteFiltrado.fecha_registro;
    
      return pacienteFiltrado;
    });
    
    res.json(pacientesLimpios);
    
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

    delete pacienteCompleto.created_at;
    delete pacienteCompleto.updated_at;
    delete pacienteCompleto.fecha_registro;
    

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

// === AGREGAR NOTA MÉDICA A UN PACIENTE ===
app.post('/api/patients/:id/notas', async (req, res) => {
  const { id } = req.params;
  const { nota } = req.body;
  const fecha = new Date().toISOString().split('T')[0];

  try {
    // Obtiene las notas actuales
    const result = await pool.query(
      'SELECT extras FROM pacientes WHERE id = $1',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const extras = result.rows[0].extras || {};
    const notasAnteriores = extras.notas_medicas || [];

    const nuevasNotas = [...notasAnteriores, { fecha, nota }];
    extras.notas_medicas = nuevasNotas;

    // Actualiza en la base de datos
    await pool.query(
      'UPDATE pacientes SET extras = $1 WHERE id = $2',
      [extras, id]
    );

    res.json({ message: 'Nota médica agregada', notas_medicas: nuevasNotas });
  } catch (err) {
    console.error('❌ Error agregando nota médica:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// === ACTUALIZAR TODAS LAS NOTAS MÉDICAS DEL PACIENTE ===
app.put('/api/patients/:id/notas', async (req, res) => {
  const { id } = req.params;
  const nuevasNotas = req.body.notas_medicas;

  try {
    const result = await pool.query('SELECT extras FROM pacientes WHERE id = $1', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const extras = result.rows[0].extras || {};
    extras.notas_medicas = nuevasNotas;

    await pool.query('UPDATE pacientes SET extras = $1 WHERE id = $2', [extras, id]);

    res.json({ message: 'Notas actualizadas', notas_medicas: nuevasNotas });
  } catch (err) {
    console.error('❌ Error actualizando notas médicas:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// === CONEXIÓN Y ARRANQUE ===
if (process.env.NODE_ENV !== 'test' && typeof pool.connect === 'function') {
  pool.connect()
    .then(() => console.log('✅ Conectado a la base de datos PostgreSQL en RDS'))
    .catch(err => console.error('❌ Error de conexión:', err));
}
const path = require('path');


app.use((req, res, next) => {
  if (/\/\.[^\/]+/.test(req.url)) {
    return res.status(403).send('Acceso denegado');
  }
  next();
});


// 🧱 Servir archivos estáticos del frontend compilado (React)
app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res) => {
    // 🔐 Seguridad HTTP aplicada también al frontend
    res.setHeader("Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self'; " +
      "form-action 'self'; " +
      "frame-ancestors 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self'"
    );
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // 🚫 Evita almacenamiento en caché
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
  }
}));


// 🧭 Redirigir todas las rutas SPA al index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname,  'build', 'index.html'));

});

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  }
  
  module.exports = { app, pool, createPool };
  

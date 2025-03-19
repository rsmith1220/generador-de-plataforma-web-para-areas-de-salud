require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); // Usamos pg en lugar de mysql2
const cors = require('cors');

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
  ssl: {
    rejectUnauthorized: false, // Esto es necesario si AWS RDS usa SSL
  }
});

app.get('/api/patients', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pacientes');
      console.log("Datos obtenidos de la BD:", result.rows); // Depuración
      res.json(result.rows); // Enviar solo los datos
    } catch (err) {
      console.error('Error obteniendo pacientes:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });


// Verificar la conexión
pool.connect()
  .then(() => console.log('✅ Conectado a la base de datos PostgreSQL en RDS'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Endpoint para obtener todos los pacientes
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pacientes');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error obteniendo pacientes:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint para agregar un paciente
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

// Endpoint para actualizar un paciente
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

// Endpoint para eliminar un paciente
app.delete('/api/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM pacientes WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error eliminando paciente:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

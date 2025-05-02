import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import './Pacientes.css';

const Pacientes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [editando, setEditando] = useState(false);
const [extrasEditados, setExtrasEditados] = useState({});

const handleExtrasChange = (key, value) => {
  setExtrasEditados(prev => ({ ...prev, [key]: value }));
};

const guardarExtras = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/patients/${id}/extras`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extrasEditados)
    });

    const data = await res.json();
    if (res.ok) {
      setPaciente(prev => ({ ...prev, ...data.extras }));
      setEditando(false);
    } else {
      alert(data.error || 'Error al guardar');
    }
  } catch (err) {
    console.error('❌ Error guardando extras:', err);
  }
};


  useEffect(() => {
    fetch(`http://localhost:5000/api/patients/${id}`)
      .then(res => res.json())
      .then(data => setPaciente(data))
      .catch(err => {
        console.error("❌ Error al cargar paciente:", err);
      });
  }, [id]);

  if (!paciente) {
    return <div className="paciente-container">Cargando datos del paciente...</div>;
  }

  // Estos son los campos comunes que ya mostramos
const CAMPOS_BASE = new Set([
  "id", "nombre", "edad", "genero", "telefono", "clinica_id",
  "altura_cm", "peso_kg", "tipo_sangre", "alergias", "medicamentos", "cirugias",
  "telefono_casa", "telefono_celular", "foto_url"
]);

// Extrae automáticamente solo los campos extras
const camposExtras = Object.entries(paciente)
  .filter(([clave]) => !CAMPOS_BASE.has(clave));

// Función para poner bonitos los nombres
const formatearClave = (clave) =>
  clave.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());


  return (
    <div className="paciente-container">
  <div className="paciente-card">
    <div className="paciente-header">
      <img
        src={paciente.foto_url || "/Portrait_Placeholder.png"}
        alt={`Foto de ${paciente.nombre}`}
        className="paciente-imagen"
      />
      <h2 className="paciente-nombre">{paciente.nombre}</h2>
    </div>

    <div className="paciente-info">
      <div className="paciente-col">
        <p>Edad: {paciente.edad}</p>
        <p>Altura: {paciente.altura_cm || "No registrada"}</p>
        <p>Alergias: {paciente.alergias || "No registradas"}</p>
        <p>Peso: {paciente.peso_kg || "No registrado"}</p>
      </div>
      <div className="paciente-col">
        <p>Cirugías: {paciente.cirugias || "No registradas"}</p>
        <p>Tipo de sangre: {paciente.tipo_sangre || "No registrado"}</p>
        <p>Medicamentos: {paciente.medicamentos || "No registrados"}</p>
      </div>
      {camposExtras.length > 0 && (
  <div className="paciente-extra">
    <h3>Información adicional</h3>
    {camposExtras.map(([clave, valor]) => (
      <p key={clave}>
        {formatearClave(clave)}: {valor || "No disponible"}
      </p>
    ))}
    
    {!editando ? (
  <button className="boton-editar" onClick={() => {
    const initExtras = Object.fromEntries(camposExtras);
    setExtrasEditados(initExtras);
    setEditando(true);
  }}>
    Editar información adicional
  </button>
  
) : (
  <div className="form-edicion-extras">
  {Object.entries(extrasEditados).map(([clave, valor]) => (
    <div key={clave}>
      <label>{formatearClave(clave)}:</label>
      <input
        value={valor}
        onChange={e => handleExtrasChange(clave, e.target.value)}
      />
    </div>
  ))}
  <div className="botones-edicion">
    <button className="boton-guardar" onClick={guardarExtras}>Guardar</button>
    <button className="boton-cancelar" onClick={() => setEditando(false)}>Cancelar</button>
  </div>
</div>

)}

  </div>
)}

    </div>

    <button className="paciente-volver" onClick={() => navigate(-1)}>
      Volver
    </button>
  </div>
</div>

  );
};

export default Pacientes;

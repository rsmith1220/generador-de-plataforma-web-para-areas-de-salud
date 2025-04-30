import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import './Pacientes.css';

const Pacientes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);

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
        <p>Altura: {paciente.altura || "No registrada"}</p>
        <p>Alergias: {paciente.alergias || "No registradas"}</p>
        <p>Peso: {paciente.peso || "No registrado"}</p>
      </div>
      <div className="paciente-col">
        <p>Cirugías: {paciente.cirugias || "No registradas"}</p>
        <p>Tipo de sangre: {paciente.tipo_sangre || "No registrado"}</p>
        <p>Medicamentos: {paciente.medicamentos || "No registrados"}</p>
      </div>
    </div>

    <button className="paciente-volver" onClick={() => navigate(-1)}>
      Volver
    </button>
  </div>
</div>

  );
};

export default Pacientes;

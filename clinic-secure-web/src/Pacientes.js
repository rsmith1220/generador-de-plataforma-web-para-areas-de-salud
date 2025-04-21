import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Pacientes.css';

const Pacientes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/patients/${id}`)
      .then(res => res.json())
      .then(data => {
        setPaciente(data);
      })
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
        <h2 className="paciente-nombre">{paciente.nombre}</h2>
        <div className="paciente-info">
          <div className="paciente-col">
            <p>Edad: {paciente.edad}</p>
            <p>Género: {paciente.genero}</p>
            <p>Teléfono: {paciente.telefono}</p>
          </div>
          <div className="paciente-col">
            <p>Cirugías</p>
            <p>Tipo de sangre</p>
            <p>Medicamentos</p>
          </div>
        </div>
      </div>

      <button className="paciente-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
};

export default Pacientes;

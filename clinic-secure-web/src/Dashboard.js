import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    const clinicaId = localStorage.getItem('clinica_id');

    if (!usuarioId) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost:5000/api/patients?clinica_id=${clinicaId}`)
      .then(response => response.json())
      .then(data => {
        setPatients(Array.isArray(data) ? data : []);
      })
      .catch(error => console.error('Error cargando pacientes:', error));
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('clinica_id');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Pacientes</h1>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar paciente"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="patients-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient, index) => (
            <div
              key={index}
              className="patient-card"
              onClick={() => navigate(`/paciente/${patient.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {patient.nombre}
            </div>
          ))
        ) : (
          <p className="no-patients">No hay pacientes registrados.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

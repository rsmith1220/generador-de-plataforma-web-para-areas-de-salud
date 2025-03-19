import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Importamos el CSS externo

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/patients')
      .then(response => response.json())
      .then(data => {
        console.log("Datos recibidos:", data);
        setPatients(Array.isArray(data) ? data : []);
      })
      .catch(error => console.error('Error cargando pacientes:', error));
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patientName) => {
    navigate(`/patient/${encodeURIComponent(patientName)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
      
      <h1 className="dashboard-title">Pacientes</h1>
      
      <input 
        type="text"
        placeholder="Buscar paciente"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />
      
      <ul className="patient-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <li 
              key={patient.id} 
              onClick={() => handlePatientClick(patient.nombre)}
              className="patient-item">
              {patient.nombre}
            </li>
          ))
        ) : (
          <p className="no-patients">No hay pacientes registrados.</p>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;

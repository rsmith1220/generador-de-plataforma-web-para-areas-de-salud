import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';


const Dashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);

  // 🔹 Verificar si el usuario está autenticado
  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    const clinicaId = localStorage.getItem('clinica_id');

    if (!usuarioId) {
      navigate('/login'); // 🔹 Si no hay usuario, redirigir al login
      return;
    }

    // 🔹 Obtener los pacientes de la clínica
    fetch(`http://localhost:5000/api/patients?clinica_id=${clinicaId}`)
      .then(response => response.json())
      .then(data => {
        console.log("Pacientes recibidos:", data);
        setPatients(Array.isArray(data) ? data : []);
      })
      .catch(error => console.error('Error cargando pacientes:', error));
  }, [navigate]);

  // 🔹 Manejar cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('clinica_id');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard de Pacientes</h1>
      <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
      
      <table className="patients-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Género</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.nombre}</td>
                <td>{patient.edad}</td>
                <td>{patient.genero}</td>
                <td>{patient.telefono}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No hay pacientes registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;

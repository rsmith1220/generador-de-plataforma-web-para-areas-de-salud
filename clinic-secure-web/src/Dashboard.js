import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/patients')
      .then(response => response.json())
      .then(data => {
        console.log("Datos recibidos:", data);  // Verifica la respuesta en la consola
        setPatients(Array.isArray(data) ? data : []); // Asegura que sea un array
      })
      .catch(error => console.error('Error cargando pacientes:', error));
  }, []);
  
  // Filtrar pacientes según la búsqueda
  const filteredPatients = patients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar el clic en un paciente
  const handlePatientClick = (patientName) => {
    navigate(`/patient/${encodeURIComponent(patientName)}`);
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard de Pacientes</h1>
      <input
        type="text"
        placeholder="Buscar paciente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredPatients.map(patient => (
          <li key={patient.id} onClick={() => handlePatientClick(patient.nombre)}>
            {patient.nombre}
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  logoutButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#6c5ce7', // Color morado
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  header: {
    fontSize: '2em',
    marginBottom: '20px',
    color: '#333',
  },
  searchBox: {
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    marginBottom: '20px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontSize: '1.2em',
    color: '#555',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
  },
};

export default Dashboard;

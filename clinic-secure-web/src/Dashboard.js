import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate(); // Hook para navegar
  const [searchTerm, setSearchTerm] = useState('');

  // Lista de pacientes
  const patients = [
    'Paciente 1',
    'Paciente 2',
    'Paciente 3',
    'Paciente 4',
    'Paciente 5',
    'Paciente 6',
    'Paciente 7',
    'Paciente 8',
    'Paciente 9',
    'Paciente 10',
  ];

  // Filtrar pacientes según la búsqueda
  const filteredPatients = patients.filter((patient) =>
    patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar el clic en un paciente
  const handlePatientClick = (patientName) => {
    navigate(`/patient/${encodeURIComponent(patientName)}`); // Redirige a la página del paciente
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated'); // Elimina la clave de autenticación
    navigate('/login'); // Redirige a la página de login
  };

  return (
    <div style={styles.container}>
      <button onClick={handleLogout} style={styles.logoutButton}>
        Cerrar sesión
      </button>
      <h1 style={styles.header}>Pacientes</h1>
      <input
        type="text"
        placeholder="Buscar paciente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchBox}
      />
      <ul style={styles.list}>
        {filteredPatients.map((patient, index) => (
          <li
            key={index}
            style={styles.listItem}
            onClick={() => handlePatientClick(patient)}
          >
            {patient}
          </li>
        ))}
      </ul>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate(); // Hook para navegar
  const [searchTerm, setSearchTerm] = useState('');

  // Lista de pacientes
  const patients = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Emily Brown',
    'William Davis',
    'Olivia Martinez',
    'James Wilson',
    'Sophia Anderson',
    'Benjamin Thomas',
    'Emma White',
  ];

  // Filtrar pacientes según la búsqueda
  const filteredPatients = patients.filter((patient) =>
    patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar el clic en un paciente
  const handlePatientClick = (patientName) => {
    navigate(`/patient/${encodeURIComponent(patientName)}`); // Redirige a la página del paciente
  };

  return (
    <div style={styles.container}>
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
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontSize: '1.2em',
    color: '#555',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default Dashboard;

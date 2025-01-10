import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Pacientes = () => {
  const { patientName } = useParams(); // Obtiene el nombre del paciente desde la URL
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Información del Paciente</h1>
      <p style={styles.text}>Nombre: {decodeURIComponent(patientName)}</p>
      <button style={styles.button} onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  header: {
    fontSize: '2em',
    marginBottom: '20px',
    color: '#333',
  },
  text: {
    fontSize: '1.5em',
    color: '#555',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Pacientes;

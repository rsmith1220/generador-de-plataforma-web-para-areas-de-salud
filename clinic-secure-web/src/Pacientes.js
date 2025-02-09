import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Pacientes = () => {
  const { patientName } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: decodeURIComponent(patientName) || '',
    genero: '',
    fechaNacimiento: '',
    estadoCivil: '',
    tipoSangre: '',
    ocupacion: '',
    correo: '',
    direccion: '',
    telefono: '',
    seguro: '',
    contactoEmergencia: { nombre: '', telefono: '' },
    historialClinico: '',
    alergias: '',
    medicamentos: '',
  });

  useEffect(() => {
    // Aquí podrías cargar datos desde una API si es necesario
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos guardados:', formData);
    // Aquí podrías enviar los datos a una API
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Información del Paciente</h1>
      <button style={styles.backButton} onClick={() => navigate(-1)}>← Volver</button>
      <div style={styles.formContainer}>
        <div style={styles.section}>
          <h2 style={styles.subHeader}>Información del paciente</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre:</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Teléfono:</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Seguro Médico:</label>
              <input type="text" name="seguro" value={formData.seguro} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contacto de Emergencia:</label>
              <input type="text" name="contactoEmergencia.nombre" placeholder="Nombre" value={formData.contactoEmergencia.nombre} onChange={handleChange} style={styles.input} />
              <input type="text" name="contactoEmergencia.telefono" placeholder="Teléfono" value={formData.contactoEmergencia.telefono} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Historial Clínico:</label>
              <textarea name="historialClinico" value={formData.historialClinico} onChange={handleChange} style={styles.textarea}></textarea>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Alergias:</label>
              <textarea name="alergias" value={formData.alergias} onChange={handleChange} style={styles.textarea}></textarea>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Medicamentos:</label>
              <textarea name="medicamentos" value={formData.medicamentos} onChange={handleChange} style={styles.textarea}></textarea>
            </div>
            <button type="submit" style={styles.button}>Guardar</button>
          </form>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f0f4f7',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
  },
  header: {
    fontSize: '2.5em',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  text: {
    fontSize: '1.2em',
    textAlign: 'center',
    marginBottom: '10px',
  },
  backButton: {
    display: 'block',
    margin: '0 auto 20px',
    padding: '10px 20px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#17a2b8',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  formContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginBottom: '20px',
  },
  subHeader: {
    fontSize: '1.5em',
    color: '#555',
    marginBottom: '15px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    width: '90%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1em',
  },
  textarea: {
    width: '90%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1em',
    height: '100px',
  },
  radioGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    fontSize: '1em',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default Pacientes;

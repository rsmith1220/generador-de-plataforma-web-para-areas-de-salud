import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Pacientes = () => {
  const { patientName } = useParams(); // Obtiene el nombre del paciente desde la URL
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Información del Paciente</h1>
      <p style={styles.text}>Nombre: {decodeURIComponent(patientName)}</p>
      <button style={styles.backButton} onClick={() => navigate(-1)}>← Volver</button>
      <div style={styles.formContainer}>
        <div style={styles.section}>
          <h2 style={styles.subHeader}>Información del paciente</h2>
          <form>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre:</label>
              <input type="text" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Género:</label>
              <div style={styles.radioGroup}>
                <label>
                  <input type="radio" name="gender" value="Male" /> Masculino
                </label>
                <label>
                  <input type="radio" name="gender" value="Female" /> Femenino
                </label>
                <label>
                  <input type="radio" name="gender" value="Other" /> Otro
                </label>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha de nacimiento:</label>
              <input type="date" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Estado civil:</label>
              <select style={styles.input}>
                <option>Soltero</option>
                <option>Casado</option>
                <option>Viudo</option>
                <option>Divorciado</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de sangre:</label>
              <input type="text" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ocupación:</label>
              <input type="text" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Correo:</label>
              <input type="email" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Dirección:</label>
              <textarea style={styles.textarea}></textarea>
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
    width: '100%',
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import awsExports from '../aws-exports'; // Importa la config de Cognito
import { Amplify } from 'aws-amplify';

Amplify.configure(awsExports);

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await Auth.signIn(username, password);
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      await guardarUsuario(username, user.attributes.email); // Guarda en DynamoDB
      navigate('/dashboard');
    } catch (error) {
      alert('Error en login: ' + error.message);
    }
  };
  

  const guardarUsuario = async (username, email) => {
    try {
      await axios.post("https://lfidsaqrp7.execute-api.us-east-1.amazonaws.com/dev/guardarUsuario", {
        username,
        email,
      });
      console.log("Usuario guardado en DynamoDB!");
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };
  

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            placeholder="Enter your username"
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f3f4f6',
  },
  title: {
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '300px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  inputGroup: {
    width: '100%',
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Login;

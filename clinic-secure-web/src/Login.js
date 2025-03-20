import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 🔹 Importar CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', { // 🔹 Ajusta la URL si es necesario
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario_id', data.id);
        localStorage.setItem('clinica_id', data.clinica_id);
        navigate('/dashboard');
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert('Error en el servidor. Inténtalo más tarde.');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">¡Bienvenido!<br />Inicia Sesión</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
  );
};

export default Login;

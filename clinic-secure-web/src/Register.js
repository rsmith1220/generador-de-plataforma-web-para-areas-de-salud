import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // 🔹 Importar CSS

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicaId, setClinicaId] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email,
          password,
          clinica_id: clinicaId
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario registrado exitosamente');
        navigate('/login'); // Redirige al login después de registrarse
      } else {
        console.error('Error en respuesta:', data);
        alert(data.error || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error("Error en registro:", error);
      alert('Error en el servidor. Inténtalo más tarde.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Regístrate</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
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
        <input
          type="number"
          placeholder="Clinic ID"
          value={clinicaId}
          onChange={(e) => setClinicaId(e.target.value)}
          required
        />
        <button type="submit" className="register-button">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;

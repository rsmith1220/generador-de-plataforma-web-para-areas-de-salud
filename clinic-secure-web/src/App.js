import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Login from './Login';
import Dashboard from './Dashboard';
import Pacientes from './Pacientes';
import Register from './Register';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const usuarioId = localStorage.getItem("usuario_id");
    setIsAuthenticated(!!usuarioId);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route
  path="/paciente/:id"
  element={isAuthenticated ? <Pacientes /> : <Navigate to="/login" />}
/>

        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

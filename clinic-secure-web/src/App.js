import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Pacientes from './Pacientes'; // Importa el nuevo componente

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState("");

  useEffect(() => {
    // Verificar si el usuario está autenticado en localStorage
    const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(loggedIn);
    axios.get('https://lfidsaqrp7.execute-api.us-east-1.amazonaws.com/dev/')
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/patient/:patientName" element={isAuthenticated ? <Pacientes /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

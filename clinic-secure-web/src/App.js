import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getData, sendData } from './services/api';
import Login from './Login';
import Dashboard from './Dashboard';
import Pacientes from './Pacientes'; // Importa el nuevo componente

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


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

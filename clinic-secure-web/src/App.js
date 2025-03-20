import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getData, sendData } from './services/api';
import Login from './Login';
import Dashboard from './Dashboard';
import Pacientes from './Pacientes';
import Register from './Register';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/patient/:patientName" element={isAuthenticated ? <Pacientes /> : <Navigate to="/" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;

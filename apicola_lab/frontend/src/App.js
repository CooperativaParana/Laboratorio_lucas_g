import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/auth/Login';
import Menu from './components/menu/Menu';
import AnalisisPalinologico from './components/analisis/AnalisisPalinologico';
import AnalisisFisicoquimico from './components/analisis/AnalisisFisicoquimico';
import AgregarMuestra from './components/muestras/AgregarMuestra';
import Reportes from './components/reportes/Reportes';
import GraficasConsultas from './components/graficas/GraficasConsultas';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/analisis-palinologico" element={<AnalisisPalinologico />} />
          <Route path="/analisis-fisicoquimico" element={<AnalisisFisicoquimico />} />
          <Route path="/agregar-muestra/:tipo" element={<AgregarMuestra />} />
          <Route path="/reportes/:tipo" element={<Reportes />} />
          <Route path="/graficas-consultas/:tipo" element={<GraficasConsultas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
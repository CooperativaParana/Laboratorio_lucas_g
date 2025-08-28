import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/auth/Login';
import Menu from './components/menu/Menu';
import AnalisisPalinologico from './components/analisis/AnalisisPalinologico';
import AnalisisFisicoquimico from './components/analisis/AnalisisFisicoquimico';
import AgregarMuestra from './components/muestras/AgregarMuestra';
import Reportes from './components/reportes/Reportes';
import ReportesFisicoquimico from './components/reportes/ReportesFisicoquimico';
import GraficasConsultas from './components/graficas/GraficasConsultas';
import ListaPools from './components/analisis/ListaPools';
import ContadorPolen from './components/muestras/ContadorPolen';
import ListaMuestras from './components/muestras/ListaMuestras';
import EditarMuestra from './components/muestras/EditarMuestra';
import TodosAnalisis from './components/analisis/TodosAnalisis';
import AgregarMuestra1 from './components/muestras/AgregarMuestra1';
import EditarMuestra1 from './components/muestras/EditarMuestra1';
import ListaMuestrasFisicoquimicas from './components/muestras/ListaMuestrasFisicoquimicas';
import VerAnalisis from './components/analisis/VerAnalisis';
import ReportePorcentajes from './components/reportes/ReportePorcentajes';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/analisis-palinologico" element={<AnalisisPalinologico />} />
          <Route path="/analisis-fisicoquimico" element={<AnalisisFisicoquimico />} />
          <Route path="/agregar-muestra/:tipo" element={<AgregarMuestra />} />
          <Route path="/reportes/:tipo" element={<Reportes />} />
          <Route path="/reportes-fisicoquimico/:tipo" element={<ReportesFisicoquimico />} />
          <Route path="/lista-pools" element={<ListaPools />} />
          <Route path="/graficas-consultas" element={<GraficasConsultas />} />
          <Route path="/graficas-consultas/:poolId" element={<GraficasConsultas />} />
          <Route path="/contador-polen/:id" element={<ContadorPolen />} />
          <Route path="/muestras" element={<ListaMuestras />} />
          <Route path="/editar-muestra/:id" element={<EditarMuestra />} />
          <Route path="/todos-analisis" element={<TodosAnalisis />} />
          <Route path="/agregar-muestra/fisicoquimico" element={<AgregarMuestra1 />} />
          <Route path="/editar-muestra1/:id" element={<EditarMuestra1 />} />
          <Route path="/muestras-fisicoquimicas" element={<ListaMuestrasFisicoquimicas />} />
          <Route path="/ver-analisis" element={<VerAnalisis />} />
          <Route path="/reporte-porcentajes" element={<ReportePorcentajes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
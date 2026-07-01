import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';

import { Dashboard } from './pages/Dashboard';
import { Materias } from './pages/Materias';
import { Sessao } from './pages/Sessao';
import { Revisoes } from './pages/Revisoes';
import { Cronograma } from './pages/Cronograma';
import { Historico } from './pages/Historico';
import { Questoes } from './pages/Questoes';
import { Estatisticas } from './pages/Estatisticas';
import { Configuracoes } from './pages/Configuracoes';

import { ResumosDashboard } from './pages/ResumosDashboard';
import { ResumosLista } from './pages/ResumosLista';
import { ResumoEditor } from './pages/ResumoEditor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="materias" element={<Materias />} />
          <Route path="sessao" element={<Sessao />} />
          <Route path="cronograma" element={<Cronograma />} />
          <Route path="revisoes" element={<Revisoes />} />
          
          <Route path="resumos" element={<ResumosDashboard />} />
          <Route path="resumos/lista" element={<ResumosLista />} />
          <Route path="resumos/novo" element={<ResumoEditor />} />
          <Route path="resumos/:id" element={<ResumoEditor />} />
          
          <Route path="questoes" element={<Questoes />} />
          <Route path="historico" element={<Historico />} />
          <Route path="estatisticas" element={<Estatisticas />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

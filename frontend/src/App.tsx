import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { usePerms } from '@/hooks/usePermissoes'
import LoadingHud from '@/components/ui/LoadingHud'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/components/sections/LoginPage'
import DashboardPage from '@/components/sections/DashboardPage'
import RegistrarAcaoPage from '@/components/sections/RegistrarAcaoPage'
import HistoricoPage from '@/components/sections/HistoricoPage'
import EstatisticasPage from '@/components/sections/EstatisticasPage'
import RecrutamentoPage from '@/components/sections/RecrutamentoPage'
import RecrutaCandidatoPage from '@/components/sections/RecrutaCandidatoPage'
import MembrosPage from '@/components/sections/MembrosPage'
import ApreensaoPage from '@/components/sections/ApreensaoPage'
import RelatorioMembrosPage from '@/components/sections/RelatorioMembrosPage'
import ConfiguracoesPage from '@/components/sections/ConfiguracoesPage'

// Exige login. Se receber `tab`, também exige permissão de visualização.
function ProtectedRoute({ children, tab }: { children: React.ReactNode; tab?: string }) {
  const { token, user } = useAuthStore()
  const { can, firstAllowedPath, ready } = usePerms()
  if (!token || !user) return <Navigate to="/login" replace />
  if (tab) {
    if (!ready) return <LoadingHud />
    if (!can(tab, 'view')) return <Navigate to={firstAllowedPath()} replace />
  }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  const { firstAllowedPath, ready } = usePerms()
  if (token) {
    if (!ready) return <LoadingHud />
    return <Navigate to={firstAllowedPath()} replace />
  }
  return <>{children}</>
}

function RootRedirect() {
  const { firstAllowedPath, ready } = usePerms()
  if (!ready) return <LoadingHud />
  return <Navigate to={firstAllowedPath()} replace />
}

function SemAcesso() {
  return (
    <div className="p-10 text-center">
      <p className="font-orbitron text-gold tracking-widest mb-2">SEM ACESSO</p>
      <p className="font-mono text-xs text-txt2">Sua conta não tem permissão para visualizar nenhuma área. Contate um administrador.</p>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute><AppShell /></ProtectedRoute>
          }>
            <Route index element={<RootRedirect />} />
            <Route path="dashboard" element={
              <ProtectedRoute tab="dashboard"><DashboardPage /></ProtectedRoute>
            } />
            <Route path="acoes/nova" element={
              <ProtectedRoute tab="patrulha"><RegistrarAcaoPage /></ProtectedRoute>
            } />
            <Route path="acoes/historico" element={
              <ProtectedRoute tab="historico"><HistoricoPage /></ProtectedRoute>
            } />
            <Route path="estatisticas" element={
              <ProtectedRoute tab="relatorios"><EstatisticasPage /></ProtectedRoute>
            } />
            <Route path="recrutamento" element={
              <ProtectedRoute tab="recrutamento"><RecrutamentoPage /></ProtectedRoute>
            } />
            <Route path="recrutamento/:id" element={
              <ProtectedRoute tab="recrutamento"><RecrutaCandidatoPage /></ProtectedRoute>
            } />
            <Route path="apreensao" element={
              <ProtectedRoute tab="apreensao"><ApreensaoPage /></ProtectedRoute>
            } />
            <Route path="membros" element={
              <ProtectedRoute tab="membros"><MembrosPage /></ProtectedRoute>
            } />
            <Route path="relatorios-membros" element={
              <ProtectedRoute tab="relatoriosMembros"><RelatorioMembrosPage /></ProtectedRoute>
            } />
            <Route path="configuracoes" element={
              <ProtectedRoute tab="config"><ConfiguracoesPage /></ProtectedRoute>
            } />
            <Route path="sem-acesso" element={<SemAcesso />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

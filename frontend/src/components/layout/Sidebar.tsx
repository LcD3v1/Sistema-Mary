import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, History, BarChart2,
  Users, Settings, UserPlus, Eye, ClipboardList, Lock, FileText,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useLogo } from '@/hooks/useConfig'
import { usePerms } from '@/hooks/usePermissoes'
import { DURATION, EASE_SHARP } from '@/lib/motion'

const NAV_ITEMS = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard',            section: 'GERAL',     tab: 'dashboard' },
  { to: '/acoes/nova',         icon: PlusCircle,      label: 'Registrar Patrulha',   section: 'GERAL',     tab: 'patrulha' },
  { to: '/acoes/historico',    icon: History,          label: 'Histórico',            section: 'GERAL',     tab: 'historico' },
  { to: '/apreensao',          icon: Lock,             label: 'Apreensão',            section: 'OPERAÇÕES', tab: 'apreensao' },
  { to: '/estatisticas',       icon: BarChart2,        label: 'Relatórios',           section: 'OPERAÇÕES', tab: 'relatorios' },
  { to: '/recrutamento',       icon: UserPlus,         label: 'Recrutamento',         section: 'PESSOAL',   tab: 'recrutamento' },
  { to: '/membros',            icon: Users,            label: 'Membros',              section: 'PESSOAL',   tab: 'membros' },
  { to: '/relatorios-membros', icon: ClipboardList,    label: 'Relatório de Membros', section: 'PESSOAL',   tab: 'relatoriosMembros' },
  { to: '/relatorios-registrados', icon: FileText,     label: 'Relatórios Registrados', section: 'PESSOAL', tab: 'relatoriosRegistrados' },
  { to: '/configuracoes',      icon: Settings,         label: 'Configurações',        section: 'PESSOAL',   tab: 'config' },
]

export default function Sidebar() {
  const { user } = useAuthStore()
  const { sidebarCollapsed } = useUIStore()
  const { data: logoData } = useLogo()
  const { can } = usePerms()
  const location = useLocation()

  const isViewOnly = user?.nivel === 'view_only'

  const visibleItems = NAV_ITEMS.filter(item => can(item.tab, 'view'))

  return (
    <motion.nav
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      className={`
        bg-sb border-r border-bdr flex flex-col shrink-0 overflow-hidden
        transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo + nome */}
      <div className="flex flex-col items-center py-6 px-3 border-b border-bdr gap-3">
        <div className="logo-ring" style={{ width: 56, height: 56 }}>
          {logoData?.logo ? (
            <img src={logoData.logo} alt="Logo" className="logo-circle" />
          ) : (
            <span className="logo-fallback" style={{ fontSize: 9 }}>M.A.R.Y</span>
          )}
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-center overflow-hidden whitespace-nowrap"
            >
              <p className="font-orbitron text-xs font-bold text-gold tracking-widest">M.A.R.Y</p>
              <p className="font-mono text-[10px] text-txt3 tracking-wider">MOTO RESPONSE UNIT</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Banner view only */}
      {isViewOnly && !sidebarCollapsed && (
        <div className="mx-2 mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-bdr border border-bdr2 rounded text-txt3 font-mono text-[10px] tracking-widest">
          <Eye size={11} className="shrink-0" />
          SOMENTE LEITURA
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {visibleItems.map((item, i) => {
          const isActive = location.pathname === item.to
          const showSection = !sidebarCollapsed && (i === 0 || visibleItems[i - 1].section !== item.section)
          return (
            <div key={item.to}>
              {showSection && (
                <p className="px-3 pt-3 pb-1 font-mono text-[9px] text-txt3 tracking-[0.2em]">
                  {item.section}
                </p>
              )}
              <NavLink
                to={item.to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200 group ${
                  isActive ? 'text-gold' : 'text-txt2 hover:text-txt hover:bg-bdr'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-bdrg border-l-2 border-gold rounded-md"
                    transition={{ duration: DURATION.base, ease: EASE_SHARP }}
                  />
                )}
                <item.icon size={18} className="relative shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative font-mono text-xs tracking-wide whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-bdr"
          >
            <p className="font-mono text-[9px] text-txt3 text-center tracking-widest">
              © SISTEMA M.A.R.Y v3.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
